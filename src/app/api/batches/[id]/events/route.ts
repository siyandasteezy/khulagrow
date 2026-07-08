import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, WRITE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const createSchema = z.object({
  type: z.enum(["STAGE_CHANGE", "HEALTH_CHECK", "MOVE", "NOTE", "PHOTO"]),
  plantId: z.string().optional(),
  stage: z
    .enum(["GERMINATION", "CLONE", "SEEDLING", "VEGETATIVE", "FLOWERING", "HARVESTED", "DESTROYED"])
    .optional(),
  health: z
    .enum(["HEALTHY", "NEEDS_ATTENTION", "PEST", "DISEASE", "NUTRIENT_DEFICIENCY", "QUARANTINE", "DEAD"])
    .optional(),
  note: z.string().optional(),
  photoUrl: z.string().optional(),
  at: z.string().optional(),
});

export const POST = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;

  const batch = await prisma.batch.findUnique({ where: { id } });
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  await requireFarmRole(session, batch.farmId, WRITE_ROLES);

  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const event = await prisma.plantEvent.create({
    data: {
      batchId: id,
      plantId: body.data.plantId,
      type: body.data.type,
      stage: body.data.stage,
      health: body.data.health,
      note: body.data.note,
      photoUrl: body.data.photoUrl,
      at: body.data.at ? new Date(body.data.at) : undefined,
      byUserId: session.userId,
    },
  });

  // A health-check event on the batch also updates the batch's health flag.
  if (body.data.type === "HEALTH_CHECK" && body.data.health && !body.data.plantId) {
    await prisma.batch.update({ where: { id }, data: { health: body.data.health } });
  }
  if (body.data.plantId && body.data.health) {
    await prisma.plant.update({
      where: { id: body.data.plantId },
      data: { health: body.data.health },
    });
  }

  await audit({
    userId: session.userId,
    farmId: batch.farmId,
    action: "CREATE",
    entity: "PlantEvent",
    entityId: event.id,
    detail: { batchCode: batch.code, type: body.data.type },
  });

  return NextResponse.json(event, { status: 201 });
});
