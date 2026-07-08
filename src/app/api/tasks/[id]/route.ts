import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, WRITE_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;

  const existing = await prisma.taskItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  await requireFarmRole(session, existing.farmId, WRITE_ROLES);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const task = await prisma.taskItem.update({
    where: { id },
    data: {
      ...body.data,
      dueDate:
        body.data.dueDate === undefined
          ? undefined
          : body.data.dueDate
            ? new Date(body.data.dueDate)
            : null,
      completedAt:
        body.data.status === "DONE"
          ? new Date()
          : body.data.status
            ? null
            : undefined,
    },
  });

  await audit({
    userId: session.userId,
    farmId: existing.farmId,
    action: "UPDATE",
    entity: "TaskItem",
    entityId: id,
    detail: { status: body.data.status ?? null },
  });

  return NextResponse.json(task);
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const session = await requireSession();
  const { id } = await params;
  const existing = await prisma.taskItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  await requireFarmRole(session, existing.farmId, WRITE_ROLES);

  await prisma.taskItem.delete({ where: { id } });
  await audit({
    userId: session.userId,
    farmId: existing.farmId,
    action: "DELETE",
    entity: "TaskItem",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
});
