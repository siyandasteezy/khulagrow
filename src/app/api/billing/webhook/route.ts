import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyYocoWebhook, activateMonth } from "@/lib/billing";
import { audit } from "@/lib/audit";

/**
 * Yoco webhook receiver. Register it once with Yoco (see README) and set
 * YOCO_WEBHOOK_SECRET to the returned whsec_… value. Unauthenticated by
 * design — authenticity comes from the HMAC signature.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!verifyYocoWebhook(req.headers, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    type?: string;
    payload?: { id?: string; status?: string; metadata?: Record<string, string> };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type !== "payment.succeeded") {
    return NextResponse.json({ received: true });
  }

  const checkoutId = event.payload?.metadata?.checkoutId;
  const userId = event.payload?.metadata?.userId;

  const payment = checkoutId
    ? await prisma.payment.findUnique({ where: { yocoCheckoutId: checkoutId } })
    : userId
      ? await prisma.payment.findFirst({
          where: { userId, status: "PENDING" },
          orderBy: { createdAt: "desc" },
        })
      : null;

  if (!payment) {
    // Unknown payment — acknowledge so Yoco stops retrying, but log it.
    console.error("Yoco webhook: no matching payment", { checkoutId, userId });
    return NextResponse.json({ received: true });
  }
  if (payment.status === "PAID") {
    return NextResponse.json({ received: true }); // idempotent redelivery
  }

  const periodStart = new Date();
  const periodEnd = await activateMonth(payment.userId);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidAt: periodStart, periodStart, periodEnd },
  });

  await audit({
    userId: payment.userId,
    action: "UPDATE",
    entity: "Payment",
    entityId: payment.id,
    detail: { status: "PAID", periodEnd: periodEnd.toISOString() },
  });

  return NextResponse.json({ received: true });
}
