import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { newSensorKey } from "@/lib/sensors";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  if (!farmId) {
    return NextResponse.json({ error: "farmId is required" }, { status: 400 });
  }
  await requireFarmRole(session, farmId, ALL_ROLES);

  const sensors = await prisma.sensor.findMany({
    where: { farmId },
    include: {
      area: { select: { id: true, name: true } },
      readings: { orderBy: { at: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    sensors.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      apiKey: s.apiKey,
      active: s.active,
      lastSeenAt: s.lastSeenAt,
      area: s.area,
      latest: s.readings[0] ?? null,
    }))
  );
});

const createSchema = z.object({
  farmId: z.string(),
  areaId: z.string(),
  name: z.string().min(2),
  type: z.enum(["TEMP_HUMIDITY", "TEMPERATURE", "HUMIDITY", "PH", "EC", "CO2", "OTHER"]),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  await requireFarmRole(session, body.data.farmId, MANAGE_ROLES);

  const area = await prisma.area.findUnique({ where: { id: body.data.areaId } });
  if (!area || area.farmId !== body.data.farmId) {
    return NextResponse.json({ error: "Area not found on this farm" }, { status: 404 });
  }

  const sensor = await prisma.sensor.create({
    data: { ...body.data, apiKey: newSensorKey() },
    include: { area: { select: { id: true, name: true } } },
  });
  await audit({
    userId: session.userId,
    farmId: sensor.farmId,
    action: "CREATE",
    entity: "Sensor",
    entityId: sensor.id,
    detail: { name: sensor.name, type: sensor.type, areaId: sensor.areaId },
  });
  return NextResponse.json(sensor, { status: 201 });
});
