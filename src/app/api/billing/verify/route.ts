import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, handler } from "@/lib/auth";
import { getYocoCheckout, activateMonth, getBillingInfo } from "@/lib/billing";

/**
 * Fallback activation for when the user returns from Yoco before the
 * webhook lands (or in local dev where webhooks can't reach us). Confirms
 * the checkout status directly with Yoco before activating anything.
 */
export const POST = handler(async () => {
  const session = await requireSession();

  const pending = await prisma.payment.findMany({
    where: { userId: session.userId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  for (const payment of pending) {
    const checkout = await getYocoCheckout(payment.yocoCheckoutId);
    if (checkout?.status === "completed") {
      const periodStart = new Date();
      const periodEnd = await activateMonth(payment.userId);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: periodStart, periodStart, periodEnd },
      });
      break;
    }
  }

  const billing = await getBillingInfo(session.userId);
  return NextResponse.json({ billing });
});
