import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  requireSession,
  requireFarmRole,
  handler,
  ALL_ROLES,
  MANAGE_ROLES,
} from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  await requireFarmRole(session, id, ALL_ROLES);

  const farm = await prisma.farm.findUnique({
    where: { id },
    include: {
      areas: { include: { beds: true, _count: { select: { batches: true } } } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: {
        select: { batches: true, harvests: true, inventory: true, documents: true },
      },
    },
  });
  if (!farm) return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  return NextResponse.json(farm);
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  licenceNumber: z.string().nullable().optional(),
  licenceExpiry: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  boundary: z.any().optional(),
  sizeHectares: z.number().positive().nullable().optional(),
});

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  await requireFarmRole(session, id, MANAGE_ROLES);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const farm = await prisma.farm.update({
    where: { id },
    data: {
      ...body.data,
      licenceExpiry:
        body.data.licenceExpiry === undefined
          ? undefined
          : body.data.licenceExpiry
            ? new Date(body.data.licenceExpiry)
            : null,
    },
  });

  await audit({
    userId: session.userId,
    farmId: id,
    action: "UPDATE",
    entity: "Farm",
    entityId: id,
  });

  return NextResponse.json(farm);
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  await requireFarmRole(session, id, ["OWNER"]);

  await prisma.farm.delete({ where: { id } });
  await audit({
    userId: session.userId,
    action: "DELETE",
    entity: "Farm",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
});
