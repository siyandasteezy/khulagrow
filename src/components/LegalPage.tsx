import Link from "next/link";
import type { ReactNode } from "react";

/** The five trust/compliance surfaces, linked from every public footer. */
export const TRUST_LINKS = [
  { href: "/privacy", label: "Privacy & POPIA" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/data", label: "Data hosting & backups" },
  { href: "/security", label: "Security & disaster recovery" },
  { href: "/support", label: "Support & SLA" },
];

export const LEGAL_UPDATED = "22 July 2026";

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-9 scroll-mt-20">
      <h2 className="font-display text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-0.5 text-brand-600">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-900">
      {children}
    </div>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f4] text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight text-brand-800">
            <span className="text-2xl">🌱</span> KhulaGrow
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-brand-700">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-gray-500">{intro}</p>
        <p className="mt-2 text-xs text-gray-400">Last updated {LEGAL_UPDATED}</p>

        {children}

        {/* Cross-navigation to the other trust surfaces */}
        <nav aria-label="Trust & compliance" className="mt-12 border-t border-gray-200 pt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Trust &amp; compliance</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {TRUST_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-medium text-brand-700 hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Questions about any of the above? Email{" "}
            <a href="mailto:support@smartpick.co.za" className="font-medium text-brand-600 hover:underline">
              support@smartpick.co.za
            </a>
            .
          </p>
        </nav>
      </main>
    </div>
  );
}
