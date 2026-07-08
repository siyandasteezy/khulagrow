import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, WRITE_ROLES, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      strain: true,
      area: true,
      farm: { select: { id: true, name: true } },
      plants: { orderBy: { tag: "asc" } },
      events: { orderBy: { at: "desc" }, take: 100 },
      inputLogs: { orderBy: { at: "desc" }, take: 50 },
      harvests: true,
      wasteLogs: true,
    },
  });
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  await requireFarmRole(session, batch.farmId, ALL_ROLES);
  return NextResponse.json(batch);
});

const updateSchema = z.object({
  stage: z
    .enum(["GERMINATION", "CLONE", "SEEDLING", "VEGETATIVE", "FLOWERING", "HARVESTED", "DESTROYED"])
    .optional(),
  health: z
    .enum(["HEALTHY", "NEEDS_ATTENTION", "PEST", "DISEASE", "NUTRIENT_DEFICIENCY", "QUARANTINE", "DEAD"])
    .optional(),
  areaId: z.string().nullable().optional(),
  plantCount: z.number().int().min(0).optional(),
  notes: z.string().nullable().optional(),
});

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;

  const existing = await prisma.batch.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  await requireFarmRole(session, existing.farmId, WRITE_ROLES);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const batch = await prisma.batch.update({
    where: { id },
    data: body.data,
  });

  // Record lifecycle transitions as events for the traceability timeline.
  if (body.data.stage && body.data.stage !== existing.stage) {
    await prisma.plantEvent.create({
      data: {
        batchId: id,
        type: "STAGE_CHANGE",
        stage: body.data.stage,
        note: `Stage: ${existing.stage} → ${body.data.stage}`,
        byUserId: session.userId,
      },
    });
    // Keep individually tagged plants in step with the batch.
    await prisma.plant.updateMany({
      where: { batchId: id, stage: { notIn: ["DESTROYED", "HARVESTED"] } },
      data: { stage: body.data.stage },
    });
  }
  if (body.data.health && body.data.health !== existing.health) {
    await prisma.plantEvent.create({
      data: {
        batchId: id,
        type: "HEALTH_CHECK",
        health: body.data.health,
        note: `Health: ${existing.health} → ${body.data.health}`,
        byUserId: session.userId,
      },
    });
  }
  if (body.data.areaId !== undefined && body.data.areaId !== existing.areaId) {
    await prisma.plantEvent.create({
      data: {
        batchId: id,
        type: "MOVE",
        note: "Batch moved to a different area",
        byUserId: session.userId,
      },
    });
  }

  await audit({
    userId: session.userId,
    farmId: existing.farmId,
    action: "UPDATE",
    entity: "Batch",
    entityId: id,
    detail: body.data as Record<string, string | number | null>,
  });

  return NextResponse.json(batch);
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  const existing = await prisma.batch.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  await requireFarmRole(session, existing.farmId, MANAGE_ROLES);

  await prisma.batch.delete({ where: { id } });
  await audit({
    userId: session.userId,
    farmId: existing.farmId,
    action: "DELETE",
    entity: "Batch",
    entityId: id,
    detail: { code: existing.code },
  });
  return NextResponse.json({ ok: true });
});
