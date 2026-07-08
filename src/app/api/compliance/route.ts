import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const records = await prisma.complianceRecord.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: { farm: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });
  return NextResponse.json(records);
});

const createSchema = z.object({
  farmId: z.string(),
  requirement: z.string().min(1),
  status: z.enum(["COMPLIANT", "ACTION_REQUIRED", "OVERDUE"]).default("ACTION_REQUIRED"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, MANAGE_ROLES);

  const record = await prisma.complianceRecord.create({
    data: {
      ...body.data,
      dueDate: body.data.dueDate ? new Date(body.data.dueDate) : undefined,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "ComplianceRecord",
    entityId: record.id,
    detail: { requirement: record.requirement },
  });

  return NextResponse.json(record, { status: 201 });
});
