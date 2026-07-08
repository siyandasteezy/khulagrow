import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, WRITE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const batches = await prisma.batch.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: {
      strain: { select: { name: true, type: true } },
      area: { select: { name: true, type: true } },
      farm: { select: { id: true, name: true } },
      _count: { select: { plants: true, harvests: true } },
    },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(batches);
});

const createSchema = z.object({
  farmId: z.string(),
  strainId: z.string(),
  source: z.enum(["SEED", "CLONE"]),
  plantCount: z.number().int().min(1).max(100000),
  areaId: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
  /** Create an individually tagged Plant row per plant (recommended <= 500). */
  tagIndividually: z.boolean().default(false),
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
  await requireFarmRole(session, body.data.farmId, WRITE_ROLES);

  // Sequential batch code per farm per year: KG-<year>-<seq>
  const year = new Date().getFullYear();
  const countThisYear = await prisma.batch.count({
    where: {
      farmId: body.data.farmId,
      startDate: { gte: new Date(`${year}-01-01`) },
    },
  });
  const code = `KG-${year}-${String(countThisYear + 1).padStart(3, "0")}`;

  const stage = body.data.source === "SEED" ? "GERMINATION" : "CLONE";
  const batch = await prisma.batch.create({
    data: {
      farmId: body.data.farmId,
      strainId: body.data.strainId,
      source: body.data.source,
      plantCount: body.data.plantCount,
      areaId: body.data.areaId,
      startDate: body.data.startDate ? new Date(body.data.startDate) : undefined,
      notes: body.data.notes,
      code,
      stage,
      plants:
        body.data.tagIndividually && body.data.plantCount <= 500
          ? {
              create: Array.from({ length: body.data.plantCount }, (_, i) => ({
                tag: `${code}-P${String(i + 1).padStart(3, "0")}`,
                stage,
              })),
            }
          : undefined,
      events: {
        create: {
          type: "STAGE_CHANGE",
          stage,
          note: `Batch started from ${body.data.source.toLowerCase()}`,
          byUserId: session.userId,
        },
      },
    },
    include: { strain: true },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "Batch",
    entityId: batch.id,
    detail: { code, plantCount: body.data.plantCount },
  });

  return NextResponse.json(batch, { status: 201 });
});
