import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, handler } from "@/lib/auth";
import { getBillingInfo, PLAN_AMOUNT_CENTS } from "@/lib/billing";

export const GET = handler(async () => {
  const session = await requireSession();
  const [billing, payments] = await Promise.all([
    getBillingInfo(session.userId),
    prisma.payment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true, amountCents: true, currency: true, status: true,
        createdAt: true, paidAt: true, periodEnd: true,
      },
    }),
  ]);
  return NextResponse.json({ billing, payments, planAmountCents: PLAN_AMOUNT_CENTS });
});
