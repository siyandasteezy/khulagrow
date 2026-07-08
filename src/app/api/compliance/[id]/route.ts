import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, MANAGE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["COMPLIANT", "ACTION_REQUIRED", "OVERDUE"]).optional(),
  dueDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;

  const existing = await prisma.complianceRecord.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Record not found" }, { status: 404 });
  await requireFarmRole(session, existing.farmId, MANAGE_ROLES);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const record = await prisma.complianceRecord.update({
    where: { id },
    data: {
      ...body.data,
      dueDate:
        body.data.dueDate === undefined
          ? undefined
          : body.data.dueDate
            ? new Date(body.data.dueDate)
            : null,
      completedAt: body.data.status === "COMPLIANT" ? new Date() : undefined,
    },
  });

  await audit({
    userId: session.userId,
    farmId: existing.farmId,
    action: "UPDATE",
    entity: "ComplianceRecord",
    entityId: id,
    detail: { status: body.data.status ?? null },
  });

  return NextResponse.json(record);
});
