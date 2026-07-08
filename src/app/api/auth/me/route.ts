import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const memberships = await prisma.farmMember.findMany({
    where: { userId: session.userId },
    include: { farm: { select: { id: true, name: true } } },
  });
  return NextResponse.json({
    user: { id: session.userId, email: session.email, name: session.name },
    memberships: memberships.map((m) => ({
      farmId: m.farmId,
      farmName: m.farm.name,
      role: m.role,
    })),
  });
}
