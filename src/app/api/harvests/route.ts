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

  const harvests = await prisma.harvest.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: {
      batch: { select: { code: true, strain: { select: { name: true } } } },
      farm: { select: { name: true } },
      lots: { select: { id: true, code: true, status: true } },
    },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(harvests);
});

const createSchema = z.object({
  batchId: z.string(),
  date: z.string().optional(),
  plantCount: z.number().int().positive(),
  wetWeightG: z.number().positive(),
  dryWeightG: z.number().positive().optional(),
  notes: z.string().optional(),
  markBatchHarvested: z.boolean().default(true),
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

  const batch = await prisma.batch.findUnique({ where: { id: body.data.batchId } });
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  await requireFarmRole(session, batch.farmId, WRITE_ROLES);

  const harvest = await prisma.harvest.create({
    data: {
      farmId: batch.farmId,
      batchId: body.data.batchId,
      date: body.data.date ? new Date(body.data.date) : undefined,
      plantCount: body.data.plantCount,
      wetWeightG: body.data.wetWeightG,
      dryWeightG: body.data.dryWeightG,
      notes: body.data.notes,
      byUserId: session.userId,
    },
  });

  // Auto-create an inventory lot so the harvested material is traceable
  // from the moment it leaves the grow area.
  const lotCount = await prisma.inventoryLot.count({ where: { farmId: batch.farmId } });
  const lot = await prisma.inventoryLot.create({
    data: {
      farmId: batch.farmId,
      harvestId: harvest.id,
      code: `LOT-${batch.code}-${String(lotCount + 1).padStart(3, "0")}`,
      product: "FLOWER",
      weightGrams: body.data.dryWeightG ?? body.data.wetWeightG,
      status: "DRYING",
    },
  });

  if (body.data.markBatchHarvested) {
    await prisma.batch.update({
      where: { id: batch.id },
      data: { stage: "HARVESTED" },
    });
    await prisma.plantEvent.create({
      data: {
        batchId: batch.id,
        type: "STAGE_CHANGE",
        stage: "HARVESTED",
        note: `Harvested ${body.data.plantCount} plants, ${body.data.wetWeightG} g wet`,
        byUserId: session.userId,
      },
    });
  }

  await audit({
    userId: session.userId,
    farmId: batch.farmId,
    action: "CREATE",
    entity: "Harvest",
    entityId: harvest.id,
    detail: {
      batchCode: batch.code,
      wetWeightG: body.data.wetWeightG,
      lotCode: lot.code,
    },
  });

  return NextResponse.json({ ...harvest, lot }, { status: 201 });
});
