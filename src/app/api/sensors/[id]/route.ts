import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { newSensorKey } from "@/lib/sensors";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  areaId: z.string().optional(),
  active: z.boolean().optional(),
  // Rotate the API key if a device is lost or a key leaks.
  rotateKey: z.boolean().optional(),
});

export const PATCH = handler(async (req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await requireSession();
  const sensor = await prisma.sensor.findUnique({ where: { id } });
  if (!sensor) return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
  await requireFarmRole(session, sensor.farmId, MANAGE_ROLES);

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { rotateKey, areaId, ...rest } = body.data;

  if (areaId) {
    const area = await prisma.area.findUnique({ where: { id: areaId } });
    if (!area || area.farmId !== sensor.farmId) {
      return NextResponse.json({ error: "Area not found on this farm" }, { status: 404 });
    }
  }

  const updated = await prisma.sensor.update({
    where: { id },
    data: { ...rest, ...(areaId ? { areaId } : {}), ...(rotateKey ? { apiKey: newSensorKey() } : {}) },
    include: { area: { select: { id: true, name: true } } },
  });
  await audit({
    userId: session.userId,
    farmId: sensor.farmId,
    action: "UPDATE",
    entity: "Sensor",
    entityId: id,
    detail: { ...rest, ...(areaId ? { areaId } : {}), ...(rotateKey ? { keyRotated: true } : {}) },
  });
  return NextResponse.json(updated);
});

export const DELETE = handler(async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const session = await requireSession();
  const sensor = await prisma.sensor.findUnique({ where: { id } });
  if (!sensor) return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
  await requireFarmRole(session, sensor.farmId, MANAGE_ROLES);

  // Readings stay (sensorId becomes null) — history is part of the record.
  await prisma.sensor.delete({ where: { id } });
  await audit({
    userId: session.userId,
    farmId: sensor.farmId,
    action: "DELETE",
    entity: "Sensor",
    entityId: id,
    detail: { name: sensor.name },
  });
  return NextResponse.json({ ok: true });
});
