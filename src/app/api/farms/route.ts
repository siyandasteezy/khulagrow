import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handler } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const GET = handler(async () => {
  const session = await requireSession();
  const farms = await prisma.farm.findMany({
    where: { members: { some: { userId: session.userId } } },
    include: {
      members: { where: { userId: session.userId }, select: { role: true } },
      _count: { select: { batches: true, areas: true, tasks: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    farms.map((f) => ({
      id: f.id,
      name: f.name,
      licenceNumber: f.licenceNumber,
      licenceExpiry: f.licenceExpiry,
      address: f.address,
      latitude: f.latitude,
      longitude: f.longitude,
      sizeHectares: f.sizeHectares,
      role: f.members[0]?.role,
      counts: f._count,
    }))
  );
});

const createSchema = z.object({
  name: z.string().min(2),
  licenceNumber: z.string().optional(),
  licenceExpiry: z.string().datetime().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  boundary: z.any().optional(),
  sizeHectares: z.number().positive().optional(),
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

  const farm = await prisma.farm.create({
    data: {
      ...body.data,
      licenceExpiry: body.data.licenceExpiry
        ? new Date(body.data.licenceExpiry)
        : undefined,
      members: { create: { userId: session.userId, role: "OWNER" } },
    },
  });

  await audit({
    userId: session.userId,
    farmId: farm.id,
    action: "CREATE",
    entity: "Farm",
    entityId: farm.id,
    detail: { name: farm.name },
  });

  return NextResponse.json(farm, { status: 201 });
});
