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
          <div className="flex items-center gap-2 text-lg font-bold text-brand-800">
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
      <section className="bg-gradient-to-b from-brand-800 to-brand-900 px-4 pb-20 pt-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-100">
            Built for SAHPRA-licensed cultivators in South Africa 🇿🇦
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Seed-to-harvest traceability your licence depends on
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-100">
            KhulaGrow is cannabis cultivation management software for South African
            farms — batch tracking, SAHPRA-ready records, offline field capture,
            harvest &amp; inventory control, and investor-ready reports. All from your phone.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

        {/* Product stat strip */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
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
        <h2 className="text-center text-3xl font-bold">
          Everything a licensed grow needs, in one app
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-500">
          From the first seed to the sealed lot — capture it in the field with minimal
          taps, and let the records build themselves.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="text-3xl" aria-hidden>{f.icon}</div>
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="bg-white px-4 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">
              Walk into your SAHPRA inspection with confidence
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
          <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 p-8">
            <div className="rounded-2xl bg-white p-5 shadow-lg">
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
      <section id="pricing" className="px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold">Simple pricing, whole team included</h2>
          <p className="mt-3 text-gray-500">
            One subscription per farm owner. Unlimited farms, batches, records and reports.
          </p>
          <div className="mt-10 rounded-3xl border border-brand-200 bg-white p-8 shadow-lg">
            <p className="text-5xl font-bold text-brand-800">
              R1,500<span className="text-lg font-medium text-gray-400"> / month</span>
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
      <section id="faq" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
          <div className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 bg-[#f6f7f4] p-5">
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
      <section className="bg-gradient-to-b from-brand-800 to-brand-900 px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Get your grow audit-ready this week</h2>
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
      </footer>
    </div>
  );
}
