import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, handler } from "@/lib/auth";
import { createYocoCheckout, PLAN_AMOUNT_CENTS, PLAN_CURRENCY } from "@/lib/billing";
import { audit } from "@/lib/audit";

/** Starts a Yoco checkout for one month of KhulaGrow (R1,500). */
export const POST = handler(async (req: Request) => {
  const session = await requireSession();

  const origin = process.env.APP_URL ?? new URL(req.url).origin;
  const checkout = await createYocoCheckout({
    userId: session.userId,
    successUrl: `${origin}/billing?paid=1`,
    cancelUrl: `${origin}/billing?cancelled=1`,
    failureUrl: `${origin}/billing?failed=1`,
  });

  await prisma.payment.create({
    data: {
      userId: session.userId,
      yocoCheckoutId: checkout.id,
      amountCents: PLAN_AMOUNT_CENTS,
      currency: PLAN_CURRENCY,
      status: "PENDING",
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entity: "Payment",
    entityId: checkout.id,
    detail: { amountCents: PLAN_AMOUNT_CENTS },
  });

  return NextResponse.json({ redirectUrl: checkout.redirectUrl }, { status: 201 });
});
