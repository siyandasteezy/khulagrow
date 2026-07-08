import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, requireFarmRole, handler, ALL_ROLES } from "@/lib/auth";

export const GET = handler(async (req: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId");
  if (farmId) await requireFarmRole(session, farmId, ALL_ROLES);

  const logs = await prisma.auditLog.findMany({
    where: farmId
      ? { farmId }
      : { farm: { members: { some: { userId: session.userId } } } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { at: "desc" },
    take: 300,
  });
  return NextResponse.json(logs);
});
