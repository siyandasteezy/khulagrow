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

  const tasks = await prisma.taskItem.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: {
      assignee: { select: { id: true, name: true } },
      batch: { select: { code: true } },
      farm: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    take: 200,
  });
  return NextResponse.json(tasks);
});

const createSchema = z.object({
  farmId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  batchId: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, WRITE_ROLES);

  const task = await prisma.taskItem.create({
    data: {
      ...body.data,
      dueDate: body.data.dueDate ? new Date(body.data.dueDate) : undefined,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "TaskItem",
    entityId: task.id,
    detail: { title: task.title },
  });

  return NextResponse.json(task, { status: 201 });
});
