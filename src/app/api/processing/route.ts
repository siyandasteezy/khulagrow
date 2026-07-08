import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, WRITE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

const createSchema = z.object({
  lotId: z.string(),
  type: z.enum(["drying", "curing", "trimming", "extraction", "packaging"]),
  inputWeightG: z.number().positive().optional(),
  outputWeightG: z.number().positive().optional(),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
});

const STATUS_FOR_PROCESS: Record<string, "DRYING" | "CURING" | "PROCESSING" | "PACKAGED"> = {
  drying: "DRYING",
  curing: "CURING",
  trimming: "PROCESSING",
  extraction: "PROCESSING",
  packaging: "PACKAGED",
};

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const lot = await prisma.inventoryLot.findUnique({ where: { id: body.data.lotId } });
  if (!lot) return NextResponse.json({ error: "Lot not found" }, { status: 404 });
  await requireFarmRole(session, lot.farmId, WRITE_ROLES);

  const record = await prisma.processingRecord.create({
    data: {
      lotId: body.data.lotId,
      type: body.data.type,
      inputWeightG: body.data.inputWeightG,
      outputWeightG: body.data.outputWeightG,
      completedAt: body.data.completedAt ? new Date(body.data.completedAt) : undefined,
      notes: body.data.notes,
      byUserId: session.userId,
    },
  });

  // Processing moves the lot to the matching status; a completed step with
  // an output weight also updates the lot's current weight.
  await prisma.inventoryLot.update({
    where: { id: lot.id },
    data: {
      status: STATUS_FOR_PROCESS[body.data.type],
      weightGrams: body.data.outputWeightG ?? undefined,
    },
  });

  await audit({
    userId: session.userId,
    farmId: lot.farmId,
    action: "CREATE",
    entity: "ProcessingRecord",
    entityId: record.id,
    detail: { lotCode: lot.code, type: body.data.type },
  });

  return NextResponse.json(record, { status: 201 });
});
