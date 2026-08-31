import { differenceInDays, format, subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { channelOf, type Channel } from "@/lib/attribution";
import { TRIAL_DAYS } from "@/lib/plan";

export const dynamic = "force-dynamic";

/**
 * The measurement panel from the marketing plan (tracker task T-06), and the
 * quarterly review surface for T-20.
 *
 * Deliberately measures the plan's KPIs rather than vanity traffic: where trials
 * come from, whether partnerships source any, and whether trials turn into
 * payments — split by trial length so the 3-vs-14-day test is readable.
 */

const CHANNELS: Channel[] = ["Partnership", "Content", "Search", "Social", "Direct", "Other"];

const pct = (n: number, d: number) => (d === 0 ? "—" : `${Math.round((n / d) * 100)}%`);

export default async function MeasurementPage() {
  const now = new Date();
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
      trialDays: true,
      signupSource: true,
      signupMedium: true,
      signupCampaign: true,
      signupReferrer: true,
      signupLandingPath: true,
      payments: {
        where: { status: "PAID" },
        select: { amountCents: true, paidAt: true },
        orderBy: { paidAt: "asc" },
      },
      memberships: { select: { farm: { select: { id: true, name: true, batches: { select: { id: true } } } } } },
    },
  });

  const rows = users.map((u) => {
    const firstPayment = u.payments[0] ?? null;
    return {
      ...u,
      channel: channelOf(u),
      converted: !!firstPayment,
      // Days from registration to first rand — the number that tells you
      // whether a longer trial is buying you anything.
      daysToPay: firstPayment?.paidAt ? differenceInDays(firstPayment.paidAt, u.createdAt) : null,
      revenueCents: u.payments.reduce((s, p) => s + p.amountCents, 0),
      // "Activated" = actually started a batch. A trial that never creates one
      // was never really a trial.
      activated: u.memberships.some((m) => m.farm.batches.length > 0),
      trialOver: !u.trialEndsAt || u.trialEndsAt <= now,
    };
  });

  const total = rows.length;
  const converted = rows.filter((r) => r.converted);
  // Only trials that have actually ended can be judged — counting live trials
  // as failures would understate conversion for the newest cohort.
  const decided = rows.filter((r) => r.trialOver);
  const last30 = rows.filter((r) => r.createdAt > subDays(now, 30));

  const headline = [
    ["Trials started", total, `${last30.length} in the last 30 days`],
    ["Activated (started a batch)", rows.filter((r) => r.activated).length, pct(rows.filter((r) => r.activated).length, total) + " of trials"],
    ["Trial → paid", converted.length, `${pct(converted.length, decided.length)} of ${decided.length} completed trials`],
    ["Partnership-sourced", rows.filter((r) => r.channel === "Partnership").length, "the plan's key relationship KPI"],
    ["Revenue collected", "R" + (rows.reduce((s, r) => s + r.revenueCents, 0) / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 }), "all Yoco payments"],
  ] as const;

  const byChannel = CHANNELS.map((c) => {
    const inChannel = rows.filter((r) => r.channel === c);
    const channelDecided = inChannel.filter((r) => r.trialOver);
    const channelPaid = inChannel.filter((r) => r.converted);
    return {
      channel: c,
      trials: inChannel.length,
      activated: inChannel.filter((r) => r.activated).length,
      paid: channelPaid.length,
      rate: pct(channelPaid.length, channelDecided.length),
      revenue: channelPaid.reduce((s, r) => s + r.revenueCents, 0),
    };
  }).filter((c) => c.trials > 0);

  // The T-13 test: cohorts grouped by the trial length they were actually given.
  const trialLengths = [...new Set(rows.map((r) => r.trialDays).filter((d): d is number => !!d))].sort((a, b) => a - b);
  const byTrialLength = trialLengths.map((days) => {
    const cohort = rows.filter((r) => r.trialDays === days);
    const cohortDecided = cohort.filter((r) => r.trialOver);
    const cohortPaid = cohort.filter((r) => r.converted);
    const times = cohortPaid.map((r) => r.daysToPay).filter((d): d is number => d !== null);
    return {
      days,
      trials: cohort.length,
      decided: cohortDecided.length,
      activated: cohort.filter((r) => r.activated).length,
      paid: cohortPaid.length,
      rate: pct(cohortPaid.length, cohortDecided.length),
      medianDaysToPay: times.length ? times.sort((a, b) => a - b)[Math.floor(times.length / 2)] : null,
    };
  });

  const campaigns = Object.entries(
    rows.reduce<Record<string, { trials: number; paid: number }>>((acc, r) => {
      const key = r.signupCampaign ?? r.signupSource ?? r.signupReferrer;
      if (!key) return acc;
      acc[key] ??= { trials: 0, paid: 0 };
      acc[key].trials += 1;
      if (r.converted) acc[key].paid += 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1].trials - a[1].trials);

  const untracked = rows.filter((r) => !r.signupSource && !r.signupReferrer && !r.signupCampaign).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Measurement</h1>
      <p className="mt-1 text-sm text-gray-500">
        The KPIs from the marketing plan — where trials come from, whether they activate, and
        whether they pay. Attribution is recorded at registration, so figures only cover
        accounts created since this panel went live.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {headline.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="font-display mt-1 text-2xl font-semibold text-brand-800">{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
          </div>
        ))}
      </div>

      <Panel
        title="By channel"
        note="Partnership-sourced trials are the plan's highest-leverage number — tag partner links with ?utm_medium=partner&utm_source=<their-name> so they land here."
      >
        <Table
          head={["Channel", "Trials", "Activated", "Paid", "Conversion", "Revenue"]}
          rows={byChannel.map((c) => [
            c.channel,
            String(c.trials),
            String(c.activated),
            String(c.paid),
            c.rate,
            "R" + (c.revenue / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 }),
          ])}
          empty="No attributed registrations yet."
        />
        {untracked > 0 && (
          <p className="mt-3 text-xs text-gray-400">
            {untracked} registration{untracked === 1 ? "" : "s"} arrived with no source at all —
            typed the URL, or came from an app that strips referrers.
          </p>
        )}
      </Panel>

      <Panel
        title="Trial length test"
        note={`Currently issuing a ${TRIAL_DAYS}-day trial. Change TRIAL_DAYS in the environment to run the other cohort — every account records the length it was given, so the comparison stays valid across the switch.`}
      >
        <Table
          head={["Trial length", "Trials", "Completed", "Activated", "Paid", "Conversion", "Median days to pay"]}
          rows={byTrialLength.map((t) => [
            `${t.days} days`,
            String(t.trials),
            String(t.decided),
            String(t.activated),
            String(t.paid),
            t.rate,
            t.medianDaysToPay === null ? "—" : String(t.medianDaysToPay),
          ])}
          empty="No completed trials to compare yet."
        />
        {byTrialLength.length < 2 && (
          <p className="mt-3 text-xs text-gray-400">
            Only one cohort so far. The comparison becomes meaningful once the second trial
            length has run long enough for its trials to complete.
          </p>
        )}
      </Panel>

      <Panel title="Campaigns & referrers" note="Every distinct utm_campaign, utm_source or referring host seen at registration.">
        <Table
          head={["Campaign / source", "Trials", "Paid"]}
          rows={campaigns.map(([key, v]) => [key, String(v.trials), String(v.paid)])}
          empty="Nothing tagged yet — add UTM parameters to outbound links."
        />
      </Panel>

      <Panel title="Recent registrations" note="Newest first, with the source recorded at signup.">
        <Table
          head={["Registered", "Account", "Channel", "Source", "Landed on", "Trial", "Status"]}
          rows={rows.slice(0, 40).map((r) => [
            format(r.createdAt, "d MMM yyyy"),
            `${r.name} · ${r.email}`,
            r.channel,
            r.signupCampaign ?? r.signupSource ?? r.signupReferrer ?? "—",
            r.signupLandingPath ?? "—",
            r.trialDays ? `${r.trialDays}d` : "—",
            r.converted ? `Paid (day ${r.daysToPay})` : r.activated ? "Activated" : r.trialOver ? "Lapsed" : "On trial",
          ])}
          empty="No registrations yet."
        />
      </Panel>
    </div>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {note && <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-400">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: string[][]; empty: string }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              {r.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
