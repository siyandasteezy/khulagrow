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

  const logs = await prisma.dailyLog.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: { farm: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(logs);
});

const createSchema = z.object({
  farmId: z.string(),
  date: z.string().optional(),
  weather: z.string().optional(),
  notes: z.string().min(1),
});

export const POST = handler(async (req: Request) => {
  const session = await requireSession();
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await requireFarmRole(session, body.data.farmId, WRITE_ROLES);

  const log = await prisma.dailyLog.create({
    data: {
      ...body.data,
      date: body.data.date ? new Date(body.data.date) : undefined,
      byUserId: session.userId,
    },
  });

  await audit({
    userId: session.userId,
    farmId: body.data.farmId,
    action: "CREATE",
    entity: "DailyLog",
    entityId: log.id,
  });

  return NextResponse.json(log, { status: 201 });
});
