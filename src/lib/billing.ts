import crypto from "crypto";
import { addDays, addMonths } from "date-fns";
import { prisma } from "./db";

/**
 * Billing: R1,500/month per farm owner, 3-day free trial at registration.
 * Payments run through Yoco Checkout (one-time payments — Yoco's public
 * API has no auto-recurring debit, so renewal is a one-tap manual payment
 * from the billing page). Team members are covered by their farm owner's
 * subscription.
 */

export const PLAN_AMOUNT_CENTS = 150_000; // R1,500.00
export const PLAN_CURRENCY = "ZAR";
export const TRIAL_DAYS = 3;

const YOCO_API = "https://payments.yoco.com/api";

export type BillingStatus = "TRIALING" | "ACTIVE" | "COVERED" | "EXPIRED" | "STAFF";

export type BillingInfo = {
  status: BillingStatus;
  /** When the current trial/paid period ends (null when EXPIRED/COVERED). */
  until: string | null;
  daysLeft: number | null;
  active: boolean;
};

function ownStatus(u: { trialEndsAt: Date | null; subscriptionEndsAt: Date | null }, now: Date) {
  if (u.subscriptionEndsAt && u.subscriptionEndsAt > now) {
    return { status: "ACTIVE" as const, until: u.subscriptionEndsAt };
  }
  if (u.trialEndsAt && u.trialEndsAt > now) {
    return { status: "TRIALING" as const, until: u.trialEndsAt };
  }
  return null;
}

/**
 * A user is covered when their own trial/subscription is current, or when
 * any farm they belong to has an owner whose trial/subscription is current.
 */
export async function getBillingInfo(userId: string): Promise<BillingInfo> {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true, subscriptionEndsAt: true, isAdmin: true },
  });
  if (!user) return { status: "EXPIRED", until: null, daysLeft: null, active: false };

  // Platform admins are never billed.
  if (user.isAdmin) return { status: "STAFF", until: null, daysLeft: null, active: true };

  const own = ownStatus(user, now);
  if (own) {
    const daysLeft = Math.max(0, Math.ceil((own.until.getTime() - now.getTime()) / 86_400_000));
    return { status: own.status, until: own.until.toISOString(), daysLeft, active: true };
  }

  const memberships = await prisma.farmMember.findMany({
    where: { userId },
    select: {
      farm: {
        select: {
          members: {
            where: { role: "OWNER" },
            select: { user: { select: { trialEndsAt: true, subscriptionEndsAt: true } } },
          },
        },
      },
    },
  });
  const covered = memberships.some((m) =>
    m.farm.members.some((o) => ownStatus(o.user, now) !== null)
  );
  if (covered) return { status: "COVERED", until: null, daysLeft: null, active: true };

  return { status: "EXPIRED", until: null, daysLeft: null, active: false };
}

export function trialEnd(): Date {
  return addDays(new Date(), TRIAL_DAYS);
}

/** Extends the user's paid period by one month and returns the new end. */
export async function activateMonth(userId: string): Promise<Date> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { subscriptionEndsAt: true },
  });
  const now = new Date();
  const base = user.subscriptionEndsAt && user.subscriptionEndsAt > now ? user.subscriptionEndsAt : now;
  const newEnd = addMonths(base, 1);
  await prisma.user.update({ where: { id: userId }, data: { subscriptionEndsAt: newEnd } });
  return newEnd;
}

// ── Yoco API ─────────────────────────────────────────────────────

function yocoKey(): string {
  const key = process.env.YOCO_SECRET_KEY;
  if (!key) {
    throw new Response(
      JSON.stringify({ error: "Payments are not configured yet (YOCO_SECRET_KEY missing)" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
  return key;
}

export async function createYocoCheckout(opts: {
  userId: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
}): Promise<{ id: string; redirectUrl: string }> {
  const res = await fetch(`${YOCO_API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${yocoKey()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      amount: PLAN_AMOUNT_CENTS,
      currency: PLAN_CURRENCY,
      successUrl: opts.successUrl,
      cancelUrl: opts.cancelUrl,
      failureUrl: opts.failureUrl,
      metadata: {
        userId: opts.userId,
        product: "khulagrow-monthly",
      },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.redirectUrl) {
    console.error("Yoco checkout failed", res.status, data);
    throw new Response(
      JSON.stringify({ error: "Could not start the payment — please try again" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
  return { id: data.id, redirectUrl: data.redirectUrl };
}

export async function getYocoCheckout(checkoutId: string): Promise<{ status?: string } | null> {
  const res = await fetch(`${YOCO_API}/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${yocoKey()}` },
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

/**
 * Verifies Yoco's webhook signature (svix-compatible scheme):
 * HMAC-SHA256 over `${id}.${timestamp}.${body}` keyed with the
 * base64-decoded portion of the `whsec_…` secret.
 */
export function verifyYocoWebhook(headers: Headers, rawBody: string): boolean {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!secret || !id || !timestamp || !signatureHeader) return false;

  // Reject stale deliveries (> 5 minutes skew) to prevent replay.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  // Header format: "v1,<base64> v1,<base64> …"
  return signatureHeader.split(" ").some((part) => {
    const sig = part.split(",")[1] ?? "";
    try {
      const a = Buffer.from(sig, "base64");
      const b = Buffer.from(expected, "base64");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}
