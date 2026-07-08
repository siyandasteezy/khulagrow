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

  const inspections = await prisma.inspection.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: { farm: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(inspections);
});

const createSchema = z.object({
  farmId: z.string(),
  type: z.string().min(1),
  inspectorName: z.string().min(1),
  date: z.string().optional(),
  passed: z.boolean().default(true),
  findings: z.string().optional(),
  correctiveAction: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  // Inspectors may record inspections too.
  await requireFarmRole(session, body.data.farmId, [...WRITE_ROLES, "INSPECTOR"]);

  const inspection = await prisma.inspection.create({
    data: {
      ...body.data,
      date: body.data.date ? new Date(body.data.date) : undefined,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "Inspection",
    entityId: inspection.id,
    detail: { type: body.data.type, passed: body.data.passed },
  });

  return NextResponse.json(inspection, { status: 201 });
});
