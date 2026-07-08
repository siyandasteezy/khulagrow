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

  const lots = await prisma.inventoryLot.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: {
      farm: { select: { name: true } },
      harvest: {
        select: {
          date: true,
          batch: { select: { code: true, strain: { select: { name: true } } } },
        },
      },
      processing: { orderBy: { startedAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(lots);
});

const createSchema = z.object({
  farmId: z.string(),
  harvestId: z.string().optional(),
  product: z.enum(["FLOWER", "TRIM", "BIOMASS", "EXTRACT", "SEEDS", "CLONES"]).default("FLOWER"),
  weightGrams: z.number().positive(),
  status: z
    .enum(["DRYING", "CURING", "IN_STORAGE", "PROCESSING", "PACKAGED", "SHIPPED", "DESTROYED"])
    .default("IN_STORAGE"),
  storageLocation: z.string().optional(),
  packagedUnits: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, WRITE_ROLES);

  const count = await prisma.inventoryLot.count({ where: { farmId: body.data.farmId } });
  const lot = await prisma.inventoryLot.create({
    data: {
      ...body.data,
      code: `LOT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "InventoryLot",
    entityId: lot.id,
    detail: { code: lot.code, weightGrams: lot.weightGrams },
  });

  return NextResponse.json(lot, { status: 201 });
});
