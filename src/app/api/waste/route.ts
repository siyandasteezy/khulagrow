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

  const logs = await prisma.wasteLog.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: {
      batch: { select: { code: true } },
      plant: { select: { tag: true } },
      farm: { select: { name: true } },
    },
    orderBy: { at: "desc" },
    take: 200,
  });
  return NextResponse.json(logs);
});

const createSchema = z.object({
  farmId: z.string(),
  batchId: z.string().optional(),
  plantId: z.string().optional(),
  reason: z.enum([
    "DISEASED", "PEST_INFESTED", "MALE_PLANT", "HERMAPHRODITE",
    "FAILED_QC", "DAMAGED", "EXPIRED", "OTHER",
  ]),
  weightGrams: z.number().nonnegative().optional(),
  plantCount: z.number().int().positive().optional(),
  method: z.string().min(1, "Destruction method is required"),
  witnessName: z.string().min(1, "SAHPRA requires a destruction witness"),
  notes: z.string().optional(),
  at: z.string().optional(),
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

  const log = await prisma.wasteLog.create({
    data: {
      ...body.data,
      at: body.data.at ? new Date(body.data.at) : undefined,
      byUserId: session.userId,
    },
  });

  // Destroying plants reduces the live count on the batch.
  if (body.data.batchId && body.data.plantCount) {
    await prisma.batch.update({
      where: { id: body.data.batchId },
      data: { plantCount: { decrement: body.data.plantCount } },
    });
  }
  if (body.data.plantId) {
    await prisma.plant.update({
      where: { id: body.data.plantId },
      data: { stage: "DESTROYED" },
    });
  }

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "WasteLog",
    entityId: log.id,
    detail: {
      reason: body.data.reason,
      witnessName: body.data.witnessName,
      plantCount: body.data.plantCount ?? null,
      weightGrams: body.data.weightGrams ?? null,
    },
  });

  return NextResponse.json(log, { status: 201 });
});
