import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, WRITE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z
    .enum(["DRYING", "CURING", "IN_STORAGE", "PROCESSING", "PACKAGED", "SHIPPED", "DESTROYED"])
    .optional(),
  weightGrams: z.number().positive().optional(),
  storageLocation: z.string().nullable().optional(),
  packagedUnits: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;

  const existing = await prisma.inventoryLot.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Lot not found" }, { status: 404 });
  await requireFarmRole(session, existing.farmId, WRITE_ROLES);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const lot = await prisma.inventoryLot.update({ where: { id }, data: body.data });

  await audit({
    userId: session.userId,
    farmId: existing.farmId,
    action: "UPDATE",
    entity: "InventoryLot",
    entityId: id,
    detail: { code: existing.code, ...(body.data as Record<string, unknown>) } as never,
  });

  return NextResponse.json(lot);
});
