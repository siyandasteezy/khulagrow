import { prisma } from "@/lib/db";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

type Own = { trialEndsAt: Date | null; subscriptionEndsAt: Date | null };

// Mirrors getBillingInfo in src/lib/billing.ts, but computed in one pass
// over the already-loaded registration list instead of per-user queries.
function ownStatus(u: Own, now: Date) {
  if (u.subscriptionEndsAt && u.subscriptionEndsAt > now) {
    return { status: "ACTIVE" as const, until: u.subscriptionEndsAt };
  }
  if (u.trialEndsAt && u.trialEndsAt > now) {
    return { status: "TRIALING" as const, until: u.trialEndsAt };
  }
  return null;
}

const STATUS_STYLE: Record<string, string> = {
  STAFF: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-brand-100 text-brand-800",
  TRIALING: "bg-amber-100 text-amber-800",
  COVERED: "bg-sky-100 text-sky-800",
  EXPIRED: "bg-red-100 text-red-700",
};

const fmtR = (cents: number) =>
  "R" + (cents / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 });

export default async function AdminPage() {
  const now = new Date();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isAdmin: true,
      createdAt: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
      memberships: {
        select: {
          role: true,
          farm: {
            select: {
              name: true,
              members: {
                where: { role: "OWNER" },
                select: {
                  user: { select: { trialEndsAt: true, subscriptionEndsAt: true } },
                },
              },
            },
          },
        },
      },
      payments: {
        where: { status: "PAID" },
        select: { amountCents: true, paidAt: true },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  const rows = users.map((u) => {
    const own = ownStatus(u, now);
    const covered =
      !own &&
      u.memberships.some((m) =>
        m.farm.members.some((o) => ownStatus(o.user, now))
      );
    const status = u.isAdmin ? "STAFF" : own?.status ?? (covered ? "COVERED" : "EXPIRED");
    const paidCents = u.payments.reduce((s, p) => s + p.amountCents, 0);
    return {
      ...u,
      status,
      until: own?.until ?? null,
      paidCents,
      lastPaidAt: u.payments[0]?.paidAt ?? null,
    };
  });

  const weekAgo = subDays(now, 7);
  const stats = [
    ["Registrations", rows.length, `${rows.filter((r) => r.createdAt > weekAgo).length} in the last 7 days`],
    ["Active (paid/comped)", rows.filter((r) => r.status === "ACTIVE").length, null],
    ["On trial", rows.filter((r) => r.status === "TRIALING").length, null],
    ["Expired", rows.filter((r) => r.status === "EXPIRED").length, "no access until they pay"],
    ["Revenue collected", fmtR(rows.reduce((s, r) => s + r.paidCents, 0)), "all Yoco payments"],
  ] as const;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Registrations</h1>
      <p className="mt-1 text-sm text-gray-500">
        Every account on the platform, newest first.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="font-display mt-1 text-2xl font-semibold text-brand-800">{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((u) => (
          <article key={u.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {u.name}
                  {u.isAdmin && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                      admin
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  <a href={`mailto:${u.email}`} className="text-brand-700 hover:underline">{u.email}</a>
                  {u.phone && (
                    <>
                      {" · "}
                      <a href={`tel:${u.phone}`} className="text-brand-700 hover:underline">{u.phone}</a>
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[u.status]}`}>
                  {u.status}
                </span>
                {u.until && (
                  <p className="mt-1 text-[11px] text-gray-400">until {format(u.until, "d MMM yyyy")}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-50 pt-3 text-xs text-gray-500">
              <span>Registered {format(u.createdAt, "d MMM yyyy, HH:mm")}</span>
              <span>
                {u.memberships.length === 0
                  ? "No farms yet"
                  : u.memberships.map((m) => `${m.farm.name} (${m.role.toLowerCase()})`).join(", ")}
              </span>
              <span>
                {u.paidCents > 0
                  ? `Paid ${fmtR(u.paidCents)}${u.lastPaidAt ? ` · last on ${format(u.lastPaidAt, "d MMM yyyy")}` : ""}`
                  : "No payments yet"}
              </span>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            No registrations yet.
          </p>
        )}
      </div>
    </div>
  );
}
