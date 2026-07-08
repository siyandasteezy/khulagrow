import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, WRITE_ROLES } from "@/lib/auth";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const areaId = searchParams.get("areaId");
  const farmId = searchParams.get("farmId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const readings = await prisma.environmentReading.findMany({
    where: {
      ...(areaId ? { areaId } : {}),
      ...(farmId ? { area: { farmId } } : { area: { farm: { members: { some: { userId: session.userId } } } } }),
    },
    include: { area: { select: { name: true } } },
    orderBy: { at: "desc" },
    take: 100,
  });
  return NextResponse.json(readings);
});

const createSchema = z.object({
  areaId: z.string(),
  tempC: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  ph: z.number().min(0).max(14).optional(),
  ec: z.number().nonnegative().optional(),
  co2Ppm: z.number().nonnegative().optional(),
  at: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const area = await prisma.area.findUnique({ where: { id: body.data.areaId } });
  if (!area) return NextResponse.json({ error: "Area not found" }, { status: 404 });
  await requireFarmRole(session, area.farmId, WRITE_ROLES);

  const reading = await prisma.environmentReading.create({
    data: { ...body.data, at: body.data.at ? new Date(body.data.at) : undefined },
  });
  return NextResponse.json(reading, { status: 201 });
});
