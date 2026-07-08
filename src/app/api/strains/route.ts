import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handler } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const GET = handler(async () => {
  await requireSession();
  const strains = await prisma.strain.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { batches: true } } },
  });
  return NextResponse.json(strains);
});

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["INDICA", "SATIVA", "HYBRID"]).default("HYBRID"),
  genetics: z.string().optional(),
  floweringDays: z.number().int().positive().optional(),
  thcPercent: z.number().min(0).max(100).optional(),
  cbdPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const strain = await prisma.strain.upsert({
    where: { name: body.data.name },
    create: body.data,
    update: body.data,
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entity: "Strain",
    entityId: strain.id,
    detail: { name: strain.name },
  });

  return NextResponse.json(strain, { status: 201 });
});
