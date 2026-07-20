import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const SITE_URL = process.env.APP_URL ?? "https://khulagrow.smartpick.co.za";

export const metadata: Metadata = {
  title: "KhulaGrow — Cannabis Cultivation Management Software for South Africa",
  description:
    "Seed-to-harvest traceability, SAHPRA-ready record-keeping, offline field capture, harvest & inventory tracking, and investor-ready reports for licensed cannabis cultivators in South Africa. R1,500/month, 3-day free trial.",
  keywords: [
    "cannabis cultivation software South Africa",
    "SAHPRA compliance software",
    "seed to harvest traceability",
    "cannabis farm management",
    "cannabis grow records",
    "cultivation batch tracking",
    "cannabis compliance records",
    "hemp farm software",
    "cannabis ERP South Africa",
    "grow management app",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "KhulaGrow",
    title: "KhulaGrow — Seed-to-Harvest Cannabis Cultivation Management",
    description:
      "SAHPRA-ready traceability and farm management for licensed cannabis cultivators in South Africa. Capture data in the field, even offline. R1,500/month with a 3-day free trial.",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "KhulaGrow — Cannabis Cultivation Management for South Africa",
    description:
      "Seed-to-harvest traceability, SAHPRA compliance and farm dashboards for licensed cultivators. 3-day free trial.",
  },
};

const FEATURES = [
  {
    icon: "🛰️",
    title: "Multi-farm & GPS mapping",
    body: "Manage every site from one account — GPS locations, farm sizes, blocks, tunnels, rooms and beds, with your SAHPRA licence details front and centre.",
  },
  {
    icon: "🌿",
    title: "Batch & plant traceability",
    body: "Unique batch codes and per-plant tags from seed or clone through germination, veg, flower and harvest — with a full photo timeline for every batch.",
  },
  {
    icon: "📵",
    title: "Works offline in the field",
    body: "Log irrigation, feeding, pests and labour in seconds with big thumb-friendly buttons. No signal? Entries queue on your phone and sync automatically.",
  },
  {
    icon: "🛡️",
    title: "SAHPRA-ready compliance",
    body: "Inspection records, compliance registers, witnessed destruction logs and a tamper-evident audit trail — the paper trail regulators expect, minus the paper.",
  },
  {
    icon: "📦",
    title: "Harvest & inventory lots",
    body: "Every harvest creates a traceable inventory lot. Track drying, curing, trimming and packaging with weights in and out, storage locations and status.",
  },
  {
    icon: "📊",
    title: "Dashboards & reports",
    body: "Plant health, yields, costs in rand, and compliance status at a glance — plus one-tap PDF and Excel exports, including investor-ready cultivation portfolios.",
  },
];

const FAQS = [
  {
    q: "Is KhulaGrow compliant with SAHPRA record-keeping requirements?",
    a: "KhulaGrow is built around the records SAHPRA-licensed cultivators must keep: complete seed-to-harvest batch traceability, input and pesticide logs, inspection records, witnessed waste and destruction registers, harvest and inventory records, and a tamper-evident audit trail of every action. You stay responsible for your licence conditions — KhulaGrow makes the evidence effortless.",
  },
  {
    q: "Does it work without internet on the farm?",
    a: "Yes. KhulaGrow is offline-first: capture logs, tasks and inspections with no signal, and everything syncs automatically the moment your phone reconnects. It also installs to your home screen like a native app.",
  },
  {
    q: "How much does KhulaGrow cost?",
    a: "R1,500 per month per farm owner, which covers the whole team — managers, supervisors, workers and inspectors included. Every new account starts with a 3-day free trial, no card required.",
  },
  {
    q: "How do payments work?",
    a: "Payments are processed securely by Yoco, a leading South African payment provider. There are no surprise debits — you're reminded in the app before your month ends.",
  },
  {
    q: "Can my team use it with different permission levels?",
    a: "Yes. Owners, managers, supervisors and workers each get appropriate access, and inspectors get read-only visibility. Every action is recorded in the audit trail with who did what, when.",
  },
  {
    q: "Can I export my records for an audit or investors?",
    a: "One tap generates PDF and Excel reports: cultivation logs, SAHPRA compliance packs, harvest and inventory reports, financial summaries and an investor-ready cultivation portfolio.",
  },
];

function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "KhulaGrow",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android (PWA)",
      description:
        "Seed-to-harvest cannabis cultivation management and SAHPRA-ready record-keeping for licensed cultivators in South Africa.",
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        price: "1500",
        priceCurrency: "ZAR",
        description: "Monthly subscription per farm owner, 3-day free trial",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function LeafTexture({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden
      width="100%"
      height="100%"
      style={{ opacity: 0.05, pointerEvents: "none" }}
    >
      <defs>
        <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path
            d="M30 12c-7 7-12 10-12 18a12 12 0 0024 0c0-8-5-11-12-18z"
            fill="currentColor"
          />
          <path
            d="M100 76c-5 5-9 7-9 13a9 9 0 0018 0c0-6-4-8-9-13z"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] rotate-2 rounded-[2.75rem] border-[10px] border-gray-950 bg-gray-950 shadow-2xl shadow-black/40">
      <div className="overflow-hidden rounded-[2.1rem] bg-[#f6f7f4] text-left text-gray-900">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[9px] font-semibold text-gray-500">
          <span>09:41</span>
          <span aria-hidden>📶 🔋</span>
        </div>
        {/* app header */}
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <div>
            <p className="text-[9px] text-gray-400">Good morning, Sipho</p>
            <p className="text-[13px] font-bold">🌱 Highveld Site A</p>
          </div>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[8px] font-bold text-brand-800">
            Licence ✓
          </span>
        </div>
        {/* stat cards */}
        <div className="grid grid-cols-2 gap-2 px-4">
          <div className="rounded-xl bg-white p-2.5 shadow-sm">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">Active plants</p>
            <p className="font-display text-lg font-semibold text-brand-800">248</p>
          </div>
          <div className="rounded-xl bg-white p-2.5 shadow-sm">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">In flower</p>
            <p className="font-display text-lg font-semibold text-brand-800">96</p>
          </div>
        </div>
        {/* mini chart */}
        <div className="mx-4 mt-2 rounded-xl bg-white p-2.5 shadow-sm">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">Logs this week</p>
          <div className="mt-1.5 flex h-12 items-end gap-1.5">
            {[35, 55, 40, 70, 60, 90, 75].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-sm ${i === 5 ? "bg-brand-600" : "bg-brand-200"}`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[7px] text-gray-400">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
        </div>
        {/* tasks */}
        <div className="mx-4 mt-2 space-y-1.5 pb-3">
          {[
            ["💧", "Irrigate Tunnel 2 — Batch KG-2026-002"],
            ["🔍", "Weekly pest scout — Flower room"],
          ].map(([icon, t]) => (
            <div key={t} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-sm">
              <span className="text-[11px]">{icon}</span>
              <span className="flex-1 text-[9px] font-medium">{t}</span>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-brand-300" />
            </div>
          ))}
        </div>
        {/* bottom nav */}
        <div className="flex justify-around border-t border-gray-100 bg-white px-2 py-2 text-[13px]">
          {["🏠", "🌿", "＋", "✅", "📊"].map((n, i) => (
            <span key={i} className={i === 2 ? "flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-white" : "opacity-60"}>
              {n}
            </span>
          ))}
        </div>
      </div>
      {/* floating cards */}
      <div className="absolute -left-24 top-40 hidden -rotate-6 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl sm:block">
        <p className="text-[10px] font-bold text-gray-900">🌿 KG-2026-002</p>
        <p className="text-[9px] text-gray-500">Flowering · day 34 · 96 plants</p>
      </div>
      <div className="absolute -right-20 bottom-16 hidden rotate-3 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl sm:block">
        <p className="text-[10px] font-bold text-gray-900">📵 Saved offline</p>
        <p className="text-[9px] text-gray-500">Will sync when back in signal ✓</p>
      </div>
    </div>
  );
}

function QuickLogMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm -rotate-1 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Quick log — Tunnel 2</p>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[
          ["💧", "Irrigation"],
          ["🧪", "Feeding"],
          ["🐛", "Pest check"],
          ["✂️", "Pruning"],
          ["📸", "Photo"],
          ["⚖️", "Weight"],
        ].map(([icon, label]) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center ${
              label === "Irrigation" ? "bg-brand-700 text-white" : "bg-[#f6f7f4] text-gray-700"
            }`}
          >
            <span className="text-xl" aria-hidden>{icon}</span>
            <span className="text-[10px] font-semibold">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
        <span aria-hidden>📵</span>
        <p className="text-xs font-medium text-amber-800">
          No signal — entry queued on this phone, syncs automatically
        </p>
      </div>
      <div className="absolute -right-4 -top-4 rotate-6 rounded-xl bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
        3 taps ✓
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  const appHref = session ? "/dashboard" : "/login";
  const appCta = session ? "Open dashboard" : "Sign in";

  return (
    <div className="bg-[#f6f7f4] text-gray-900">
      <JsonLd />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="font-display flex items-center gap-2 text-xl font-semibold tracking-tight text-brand-800">
            <span className="text-2xl">🌱</span> KhulaGrow
          </div>
          <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-brand-700">Features</a>
            <a href="#compliance" className="hover:text-brand-700">Compliance</a>
            <a href="#pricing" className="hover:text-brand-700">Pricing</a>
            <a href="#faq" className="hover:text-brand-700">FAQ</a>
          </nav>
          <Link
            href={appHref}
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            {appCta}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-800 to-brand-900 px-4 pb-20 pt-16 text-white">
        <LeafTexture id="leaf-hero" className="absolute inset-0 text-white" />
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <p className="mb-5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-100">
              Built for SAHPRA-licensed cultivators in South Africa 🇿🇦
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Seed-to-harvest traceability{" "}
              <em className="italic text-brand-200">your licence depends on</em>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-100 lg:mx-0">
              KhulaGrow is cannabis cultivation management software for South African
              farms — batch tracking, SAHPRA-ready records, offline field capture,
              harvest &amp; inventory control, and investor-ready reports. All from your phone.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/login"
                className="w-full rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-800 shadow-lg hover:bg-brand-50 sm:w-auto"
              >
                Start your 3-day free trial
              </Link>
              <a
                href="#features"
                className="w-full rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 sm:w-auto"
              >
                See what&apos;s inside
              </a>
            </div>
            <p className="mt-4 text-sm text-brand-200">
              No card needed for the trial · R1,500/month · Covers your whole team
            </p>
          </div>
          <div className="hidden sm:block">
            <PhoneMock />
          </div>
        </div>

        {/* Product stat strip */}
        <div className="relative mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Traceability", "Seed → sale lot"],
            ["Field capture", "Works offline"],
            ["Compliance", "Audit-ready"],
            ["Reports", "PDF & Excel"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">{k}</p>
              <p className="mt-1 font-bold">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything a licensed grow needs, <em className="italic text-brand-700">in one app</em>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-500">
          From the first seed to the sealed lot — capture it in the field with minimal
          taps, and let the records build themselves.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl" aria-hidden>{f.icon}</div>
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Field capture */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <QuickLogMock />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for muddy boots, <em className="italic text-brand-700">not office desks</em>
            </h2>
            <p className="mt-4 leading-relaxed text-gray-500">
              Records only work if your team actually keeps them. KhulaGrow&apos;s field
              screens use big thumb-friendly buttons, so an irrigation or pest log takes
              three taps in the tunnel — gloves on, no signal, no problem.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Quick-log grid for the actions you do every day",
                "Photos straight from the phone camera onto the batch timeline",
                "Offline-first: entries queue on the device and sync automatically",
                "Installs to the home screen like a native app — no app store needed",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="px-4 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Walk into your SAHPRA inspection <em className="italic text-brand-700">with confidence</em>
            </h2>
            <p className="mt-4 text-gray-500">
              Regulators don&apos;t accept &ldquo;it&apos;s in a notebook somewhere.&rdquo;
              KhulaGrow keeps the exact records a licensed cultivation facility must
              produce — organised, timestamped and exportable in seconds.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Complete batch genealogy: strain, source, stage history and photo evidence",
                "Input registers — irrigation, nutrients, pesticides — with costs in rand",
                "Witnessed waste & destruction logs with method and reason",
                "Inspection records and compliance deadlines with due-date alerts",
                "Licence and SOP document vault with expiry warnings",
                "Tamper-evident audit trail of every user action",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 p-8">
            <LeafTexture id="leaf-panel" className="absolute inset-0 rounded-3xl text-brand-700" />
            {/* report page peeking out behind the record card */}
            <div aria-hidden className="absolute inset-x-14 top-4 h-24 -rotate-2 rounded-xl bg-white/70 shadow" />
            <div className="relative rounded-2xl bg-white p-5 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Destruction record — example</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Batch</span><span className="font-mono font-semibold">KG-2026-002</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Reason</span><span className="font-semibold">Male plants (6)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-semibold">Shredded &amp; composted</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Witness</span><span className="font-semibold">T. Nkosi</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Logged by</span><span className="font-semibold">S. Dlamini · 09:14</span></div>
              </div>
              <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
                ✓ Recorded in the audit trail — exportable in your compliance pack
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing, <em className="italic text-brand-700">whole team included</em>
          </h2>
          <p className="mt-3 text-gray-500">
            One subscription per farm owner. Unlimited farms, batches, records and reports.
          </p>
          <div className="mt-10 rounded-3xl border border-brand-200 bg-white p-8 shadow-lg">
            <p className="font-display text-6xl font-semibold tracking-tight text-brand-800">
              R1,500<span className="font-sans text-lg font-medium tracking-normal text-gray-400"> / month</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-brand-700">3-day free trial — no card required</p>
            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left text-sm text-gray-700">
              {[
                "Unlimited farms, batches & plants",
                "Whole team covered — every role",
                "Offline field capture & sync",
                "All reports & exports included",
                "Secure Yoco card payments",
                "No lock-in — your data exports freely",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="text-brand-600">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 block w-full rounded-xl bg-brand-700 px-8 py-4 text-base font-bold text-white hover:bg-brand-800"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold text-gray-900 marker:hidden">
                  <span className="mr-2 inline-block text-brand-600 transition-transform group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <p className="mt-3 pl-6 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-800 to-brand-900 px-4 py-16 text-center text-white">
        <LeafTexture id="leaf-cta" className="absolute inset-0 text-white" />
        <h2 className="font-display relative text-3xl font-semibold tracking-tight sm:text-4xl">
          Get your grow <em className="italic text-brand-200">audit-ready</em> this week
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Set up your farm, start your first batch and capture your first logs in under
          ten minutes — free for 3 days.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-xl bg-white px-10 py-4 text-base font-bold text-brand-800 shadow-lg hover:bg-brand-50"
        >
          Start your free trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-400 sm:flex-row">
          <p className="flex items-center gap-2 font-semibold text-brand-800">
            <span>🌱</span> KhulaGrow
          </p>
          <nav aria-label="Footer" className="flex gap-6">
            <a href="#features" className="hover:text-brand-700">Features</a>
            <a href="#pricing" className="hover:text-brand-700">Pricing</a>
            <Link href="/login" className="hover:text-brand-700">Sign in</Link>
          </nav>
          <p>© {new Date().getFullYear()} KhulaGrow · Cultivation software for licensed growers</p>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-gray-300 sm:text-right">
          Developed by{" "}
          <a
            href="https://www.smartpick.co.za/it"
            target="_blank"
            rel="noopener"
            className="font-medium text-gray-400 hover:text-brand-700"
          >
            SmartP1ck
          </a>
        </p>
      </footer>
    </div>
  );
}
