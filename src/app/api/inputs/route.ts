import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, WRITE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  const batchId = searchParams.get("batchId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const logs = await prisma.inputLog.findMany({
    where: {
      ...(farmId ? { farmId } : { farm: { members: { some: { userId: session.userId } } } }),
      ...(batchId ? { batchId } : {}),
    },
    include: {
      batch: { select: { code: true } },
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
  type: z.enum([
    "IRRIGATION", "NUTRIENT", "FERTILIZER", "PESTICIDE", "FUNGICIDE",
    "GROWING_MEDIA", "LABOUR", "EQUIPMENT", "OTHER",
  ]),
  product: z.string().optional(),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  costRands: z.number().nonnegative().optional(),
  laborHours: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  at: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, WRITE_ROLES);

  const log = await prisma.inputLog.create({
    data: {
      ...body.data,
      at: body.data.at ? new Date(body.data.at) : undefined,
      byUserId: session.userId,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "InputLog",
    entityId: log.id,
    detail: { type: body.data.type, product: body.data.product ?? null },
  });

  return NextResponse.json(log, { status: 201 });
});
