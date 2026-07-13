import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBillingInfo } from "@/lib/billing";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const [memberships, billing, me] = await Promise.all([
    prisma.farmMember.findMany({
      where: { userId: session.userId },
      include: { farm: { select: { id: true, name: true } } },
    }),
    getBillingInfo(session.userId),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true },
    }),
  ]);
  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      isAdmin: me?.isAdmin ?? false,
    },
    memberships: memberships.map((m) => ({
      farmId: m.farmId,
      farmName: m.farm.name,
      role: m.role,
    })),
    billing,
  });
}
