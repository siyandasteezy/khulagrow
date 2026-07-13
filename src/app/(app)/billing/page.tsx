"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFarm, type Billing } from "@/components/FarmContext";
import { Badge, Button, Card, PageHeader, Spinner } from "@/components/ui";
import { format } from "date-fns";

type PaymentRow = {
  id: string; amountCents: number; currency: string; status: string;
  createdAt: string; paidAt: string | null; periodEnd: string | null;
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  TRIALING: { label: "Free trial", cls: "bg-brand-100 text-brand-800" },
  ACTIVE: { label: "Active", cls: "bg-green-100 text-green-800" },
  COVERED: { label: "Covered by farm owner", cls: "bg-blue-100 text-blue-800" },
  EXPIRED: { label: "Expired", cls: "bg-red-100 text-red-800" },
  STAFF: { label: "Platform admin", cls: "bg-gray-100 text-gray-700" },
};

function BillingInner() {
  const { refreshFarms } = useFarm();
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("paid") === "1";
  const cancelled = searchParams.get("cancelled") === "1";
  const failed = searchParams.get("failed") === "1";

  const [billing, setBilling] = useState<Billing | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(justPaid);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/billing");
    if (!res.ok) return;
    const data = await res.json();
    setBilling(data.billing);
    setPayments(data.payments);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Returned from Yoco: confirm the payment server-side (webhook fallback),
  // polling briefly in case Yoco is still settling.
  useEffect(() => {
    if (!justPaid) return;
    let attempts = 0;
    let stop = false;
    const tick = async () => {
      if (stop) return;
      attempts += 1;
      const res = await fetch("/api/billing/verify", { method: "POST" });
      const data = res.ok ? await res.json() : null;
      if (data?.billing?.status === "ACTIVE") {
        setBilling(data.billing);
        setVerifying(false);
        await Promise.all([load(), refreshFarms()]);
        return;
      }
      if (attempts < 6) setTimeout(tick, 2500);
      else {
        setVerifying(false);
        await load();
      }
    };
    tick();
    return () => {
      stop = true;
    };
  }, [justPaid, load, refreshFarms]);

  async function subscribe() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start the payment");
        setBusy(false);
        return;
      }
      window.location.href = data.redirectUrl; // off to Yoco's hosted page
    } catch {
      setError("You need to be online to pay — try again when connected");
      setBusy(false);
    }
  }

  if (!billing) return <Spinner />;

  const badge = STATUS_BADGE[billing.status];

  return (
    <div className="space-y-4">
      <PageHeader title="Billing" subtitle="KhulaGrow subscription" />

      {verifying && (
        <Card className="border-blue-200 bg-blue-50">
          <p className="text-sm font-medium text-blue-900">
            Confirming your payment with Yoco… this takes a few seconds.
          </p>
        </Card>
      )}
      {cancelled && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Payment cancelled — no charge was made.
        </p>
      )}
      {failed && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          The payment didn&apos;t go through. No charge was made — please try again.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              R 1 500<span className="text-sm font-medium text-gray-400"> / month</span>
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Unlimited farms, batches, team members and reports. 3-day free trial.
            </p>
          </div>
          <Badge className={badge.cls}>{badge.label}</Badge>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-3.5 text-sm">
          {billing.status === "TRIALING" && (
            <p>
              Your free trial ends{" "}
              <b>{billing.until ? format(new Date(billing.until), "d MMM yyyy 'at' HH:mm") : "soon"}</b>
              {" "}({billing.daysLeft} day{billing.daysLeft === 1 ? "" : "s"} left). Subscribe now and
              your paid month starts on top of the remaining trial time.
            </p>
          )}
          {billing.status === "ACTIVE" && (
            <p>
              Paid up until{" "}
              <b>{billing.until ? format(new Date(billing.until), "d MMM yyyy") : "—"}</b>.
              Renew any time — the new month is added on top.
            </p>
          )}
          {billing.status === "COVERED" && (
            <p>
              Your access is covered by your farm owner&apos;s subscription — nothing to pay on
              this account.
            </p>
          )}
          {billing.status === "STAFF" && (
            <p>This is a platform admin account — full access, nothing to pay.</p>
          )}
          {billing.status === "EXPIRED" && (
            <p className="text-red-700">
              Your trial and subscription have ended. Your records are safe and readable, but
              capturing new data is paused until you subscribe.
            </p>
          )}
        </div>

        {billing.status !== "COVERED" && billing.status !== "STAFF" && (
          <Button size="lg" className="mt-4" onClick={subscribe} disabled={busy || verifying}>
            {busy
              ? "Opening secure checkout…"
              : billing.status === "ACTIVE"
                ? "Renew — add a month for R1,500"
                : "Subscribe — R1,500/month"}
          </Button>
        )}
        {billing.status !== "COVERED" && billing.status !== "STAFF" && (
          <p className="mt-2 text-center text-xs text-gray-400">
            Secure card payment via Yoco. Renewals are manual — we remind you in the app before
            your month ends; no surprise debits.
          </p>
        )}
      </Card>

      {payments.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-bold text-gray-700">Payment history</h3>
          <ul className="divide-y divide-gray-50">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-gray-800">
                    R {(p.amountCents / 100).toLocaleString("en-ZA")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(p.paidAt ?? p.createdAt), "d MMM yyyy HH:mm")}
                    {p.periodEnd && ` · paid through ${format(new Date(p.periodEnd), "d MMM yyyy")}`}
                  </p>
                </div>
                <Badge
                  className={
                    p.status === "PAID"
                      ? "bg-green-100 text-green-800"
                      : p.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {p.status.toLowerCase()}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <BillingInner />
    </Suspense>
  );
}
