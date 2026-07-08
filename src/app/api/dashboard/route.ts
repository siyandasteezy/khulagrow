import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES } from "@/lib/auth";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const farmFilter = farmId
    ? { farmId }
    : { farm: { members: { some: { userId: session.userId } } } };
  const farmWhere = farmId
    ? { id: farmId }
    : { members: { some: { userId: session.userId } } };

  const [
    farms,
    activeBatches,
    batchesByStage,
    batchesByHealth,
    harvests,
    costsByType,
    openTasks,
    overdueTasks,
    compliance,
    wasteCount,
    lots,
    recentEvents,
    expiringDocs,
  ] = await Promise.all([
    prisma.farm.findMany({
      where: farmWhere,
      select: { id: true, name: true, licenceNumber: true, licenceExpiry: true },
    }),
    prisma.batch.findMany({
      where: { ...farmFilter, stage: { notIn: ["HARVESTED", "DESTROYED"] } },
      select: { plantCount: true },
    }),
    prisma.batch.groupBy({
      by: ["stage"],
      where: farmFilter,
      _sum: { plantCount: true },
      _count: true,
    }),
    prisma.batch.groupBy({
      by: ["health"],
      where: { ...farmFilter, stage: { notIn: ["HARVESTED", "DESTROYED"] } },
      _sum: { plantCount: true },
    }),
    prisma.harvest.findMany({
      where: farmFilter,
      select: { date: true, wetWeightG: true, dryWeightG: true, batch: { select: { code: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.inputLog.groupBy({
      by: ["type"],
      where: farmFilter,
      _sum: { costRands: true },
    }),
    prisma.taskItem.count({
      where: { ...farmFilter, status: { in: ["PENDING", "IN_PROGRESS"] } },
    }),
    prisma.taskItem.count({
      where: {
        ...farmFilter,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.complianceRecord.groupBy({
      by: ["status"],
      where: farmFilter,
      _count: true,
    }),
    prisma.wasteLog.count({ where: farmFilter }),
    prisma.inventoryLot.groupBy({
      by: ["status"],
      where: { ...farmFilter, status: { not: "DESTROYED" } },
      _sum: { weightGrams: true },
    }),
    prisma.plantEvent.findMany({
      where: { batch: farmFilter },
      include: { batch: { select: { code: true } } },
      orderBy: { at: "desc" },
      take: 10,
    }),
    prisma.document.findMany({
      where: {
        ...farmFilter,
        expiryDate: {
          lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      select: { id: true, title: true, type: true, expiryDate: true },
    }),
  ]);

  // Monthly cost series for the last 6 months.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const recentInputs = await prisma.inputLog.findMany({
    where: { ...farmFilter, at: { gte: sixMonthsAgo } },
    select: { at: true, costRands: true },
  });
  const costByMonth = new Map<string, number>();
  for (const log of recentInputs) {
    const key = log.at.toISOString().slice(0, 7);
    costByMonth.set(key, (costByMonth.get(key) ?? 0) + (log.costRands ?? 0));
  }

  return NextResponse.json({
    farms,
    totals: {
      farms: farms.length,
      activePlants: activeBatches.reduce((s, b) => s + b.plantCount, 0),
      activeBatches: activeBatches.length,
      openTasks,
      overdueTasks,
      wasteEvents: wasteCount,
      totalDryYieldG: harvests.reduce((s, h) => s + (h.dryWeightG ?? 0), 0),
      totalWetYieldG: harvests.reduce((s, h) => s + h.wetWeightG, 0),
      totalCostRands: costsByType.reduce((s, c) => s + (c._sum.costRands ?? 0), 0),
      inventoryWeightG: lots.reduce((s, l) => s + (l._sum.weightGrams ?? 0), 0),
    },
    batchesByStage: batchesByStage.map((b) => ({
      stage: b.stage,
      batches: b._count,
      plants: b._sum.plantCount ?? 0,
    })),
    plantsByHealth: batchesByHealth.map((b) => ({
      health: b.health,
      plants: b._sum.plantCount ?? 0,
    })),
    harvests: harvests.map((h) => ({
      date: h.date,
      batchCode: h.batch.code,
      wetWeightG: h.wetWeightG,
      dryWeightG: h.dryWeightG,
    })),
    costsByType: costsByType.map((c) => ({
      type: c.type,
      costRands: c._sum.costRands ?? 0,
    })),
    costByMonth: [...costByMonth.entries()]
      .sort()
      .map(([month, cost]) => ({ month, cost })),
    compliance: compliance.map((c) => ({ status: c.status, count: c._count })),
    inventoryByStatus: lots.map((l) => ({
      status: l.status,
      weightGrams: l._sum.weightGrams ?? 0,
    })),
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      type: e.type,
      note: e.note,
      at: e.at,
      batchCode: e.batch?.code,
    })),
    expiringDocs,
  });
});
