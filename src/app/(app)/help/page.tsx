"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { replayTour } from "@/components/Onboarding";

const STEPS = [
  {
    icon: "🚜",
    title: "1. Add your farm",
    intro: "Everything in KhulaGrow hangs off a farm — do this first.",
    how: [
      "Go to More → Farms & areas → + New farm (or Farms in the sidebar).",
      "Give it a name, and add your SAHPRA licence number and expiry — they appear on your compliance exports.",
      "Add the address or GPS location and size if you have them; you can edit all of this later.",
    ],
  },
  {
    icon: "🏗️",
    title: "2. Map your growing areas",
    intro: "Areas are your tunnels, rooms, greenhouses, blocks or fields.",
    how: [
      "Open your farm and add each area with its type and (optionally) capacity.",
      "Batches get assigned to areas, so your records show exactly where every plant lives.",
    ],
  },
  {
    icon: "👥",
    title: "3. Bring in your team",
    intro: "One subscription covers everyone on your farm.",
    how: [
      "In your farm, open Team and add members by email.",
      "Roles: Owner and Manager run the farm, Supervisors and Workers capture day-to-day logs, Inspectors get read-only access.",
      "Every action is recorded in the audit trail under the person who did it.",
    ],
  },
  {
    icon: "🌿",
    title: "4. Start your first batch",
    intro: "A batch is a group of plants you track together from seed or clone to harvest.",
    how: [
      "Go to Batches → + New batch: pick the strain, source (seed/clone), plant count and area.",
      "KhulaGrow gives it a traceable batch code and starts its timeline.",
      "Move the batch through stages (germination, veg, flower) as it grows — each change is dated automatically.",
    ],
  },
  {
    icon: "💧",
    title: "5. Log your daily work",
    intro: "This is the habit that builds your compliance records for you.",
    how: [
      "Tap the big ＋ button: irrigation, feeding, pest checks, pruning, photos — a log takes a few taps.",
      "Record inputs (nutrients, pesticides) with quantities and cost so registers and spend reports stay accurate.",
      "No signal in the field? Keep logging — entries save on your phone and sync when you're back in coverage.",
    ],
  },
  {
    icon: "📡",
    title: "Optional: let sensors do the tedious logging",
    intro: "Temperature, humidity, pH, EC and CO₂ can record themselves.",
    how: [
      "On your farm page, open Sensors → + Add sensor: name it, pick what it measures and which tunnel or room it sits in.",
      "You'll get an API key and endpoint — point the device (or whoever set it up) at them, and readings flow in automatically.",
      "Each sensor card shows whether it's online and its latest reading; tap it to copy or rotate the key, pause it, or move it.",
      "Manual readings via Quick log still work exactly the same — sensors just take the drudgery away.",
    ],
  },
  {
    icon: "✅",
    title: "6. Run the week with tasks",
    intro: "Assign work with due dates so nothing slips.",
    how: [
      "Create tasks from the Tasks tab and assign them to team members.",
      "Overdue tasks are flagged on the dashboard for everyone to see.",
    ],
  },
  {
    icon: "✂️",
    title: "7. Record harvests",
    intro: "Close the loop from plant to product.",
    how: [
      "Open a batch and record the harvest with wet weight — dry weight comes later.",
      "Each harvest automatically creates a traceable inventory lot.",
    ],
  },
  {
    icon: "📦",
    title: "8. Track inventory",
    intro: "Follow every lot through processing to sale-ready packaging.",
    how: [
      "Move lots through drying, curing, trimming and packaging, with weights in and out at each step.",
      "Storage locations and statuses show exactly what you're holding at any moment.",
    ],
  },
  {
    icon: "🛡️",
    title: "9. Keep compliance current",
    intro: "The records SAHPRA expects, building themselves as you work.",
    how: [
      "Log inspections and their outcomes under Compliance.",
      "Record plant destruction with reason, method and a witness — the register regulators ask for.",
      "Store licences, SOPs and certificates in Documents; expiry warnings appear before they lapse.",
    ],
  },
  {
    icon: "📊",
    title: "10. Export reports anytime",
    intro: "One tap, PDF or Excel.",
    how: [
      "Reports covers cultivation logs, the SAHPRA compliance pack, harvest & inventory, financials and the investor-ready portfolio.",
      "Everything is generated from your live records — no copy-paste, no spreadsheets to maintain.",
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="How KhulaGrow works"
        subtitle="From first login to audit-ready, in ten steps"
      />

      <Card className="mb-4 flex items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold text-gray-900">New here?</p>
          <p className="text-xs text-gray-400">Replay the quick welcome tour</p>
        </div>
        <button
          onClick={() => {
            replayTour();
            router.push("/dashboard");
          }}
          className="shrink-0 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          ▶ Replay tour
        </button>
      </Card>

      <div className="space-y-2.5">
        {STEPS.map((s) => (
          <details key={s.title} className="group rounded-2xl border border-gray-100 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3.5 p-4">
              <span className="text-2xl" aria-hidden>{s.icon}</span>
              <span className="flex-1">
                <span className="block font-semibold text-gray-900">{s.title}</span>
                <span className="block text-xs text-gray-400">{s.intro}</span>
              </span>
              <span className="text-gray-300 transition-transform group-open:rotate-90">›</span>
            </summary>
            <ul className="space-y-2 px-4 pb-4 pl-[52px]">
              {s.how.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 text-brand-600">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <Card className="mt-4 p-4">
        <p className="font-semibold text-gray-900">📵 Working offline</p>
        <p className="mt-1 text-sm text-gray-500">
          Install KhulaGrow on your phone (your browser&apos;s &ldquo;Add to Home Screen&rdquo;) and it
          behaves like a native app. Logs captured without signal are kept on the device and sync
          automatically — the cloud icon in the header shows anything still waiting to upload.
        </p>
      </Card>

      <Card className="mt-2.5 p-4">
        <p className="font-semibold text-gray-900">💳 Billing</p>
        <p className="mt-1 text-sm text-gray-500">
          One subscription of R1,500/month per farm owner covers the whole team. Renewals are
          manual via secure Yoco card payment — we remind you in the app, and never debit you
          automatically. Manage it under More → Billing.
        </p>
      </Card>

      <Card className="mt-2.5 p-4">
        <p className="font-semibold text-gray-900">🤝 Stuck? We&apos;ll help</p>
        <p className="mt-1 text-sm text-gray-500">
          Email{" "}
          <a href="mailto:support@smartpick.co.za" className="font-medium text-brand-700 hover:underline">
            support@smartpick.co.za
          </a>{" "}
          and we&apos;ll get you unstuck — support can securely look at your farm with you when
          you need hands-on help.
        </p>
      </Card>

      <p className="mt-4 text-center text-xs text-gray-300">
        <Link href="/farms/new" className="font-medium text-brand-600 hover:underline">
          Ready? Add your farm →
        </Link>
      </p>
    </div>
  );
}
