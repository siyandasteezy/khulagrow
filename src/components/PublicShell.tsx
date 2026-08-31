import Link from "next/link";
import { TRUST_LINKS } from "@/components/LegalPage";
import { AttributionCapture } from "@/components/AttributionCapture";

/**
 * Shared chrome for the public marketing surfaces. The homepage keeps its own
 * anchor-driven header; everything else (the resource library, individual
 * guides) uses SiteHeader, and all of them share SiteFooter so the internal
 * link structure stays identical across the site.
 */

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      {/* A visitor landing on a guide is the content engine working — record it. */}
      <AttributionCapture />
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-display flex items-center gap-2 text-xl font-semibold tracking-tight text-brand-800">
          <span className="text-2xl">🌱</span> KhulaGrow
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/#features" className="hover:text-brand-700">Features</Link>
          <Link href="/#pricing" className="hover:text-brand-700">Pricing</Link>
          <Link href="/resources" className="hover:text-brand-700">Guides</Link>
        </nav>
        <Link
          href={signedIn ? "/dashboard" : "/login"}
          className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {signedIn ? "Open dashboard" : "Sign in"}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="flex items-center gap-2 font-semibold text-brand-800">
            <span>🌱</span> KhulaGrow
          </p>
          <p className="mt-2 max-w-xs text-sm text-gray-400">
            Seed-to-harvest cultivation management and SAHPRA-ready records for licensed growers in
            South Africa.
          </p>
        </div>

        <nav aria-label="Product" className="text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Product</p>
          <ul className="mt-3 space-y-2 text-gray-500">
            <li><Link href="/#features" className="hover:text-brand-700">Features</Link></li>
            <li><Link href="/#compliance" className="hover:text-brand-700">Compliance</Link></li>
            <li><Link href="/#pricing" className="hover:text-brand-700">Pricing</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Sign in</Link></li>
          </ul>
        </nav>

        <nav aria-label="Guides" className="text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Guides</p>
          <ul className="mt-3 space-y-2 text-gray-500">
            <li><Link href="/resources" className="hover:text-brand-700">Grower&apos;s library</Link></li>
          </ul>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-gray-400">Trust &amp; compliance</p>
          <ul className="mt-3 space-y-2 text-gray-500">
            {TRUST_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-700">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Contact" className="text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Contact</p>
          <ul className="mt-3 space-y-2 text-gray-500">
            <li>
              <a href="mailto:support@smartpick.co.za" className="hover:text-brand-700">
                support@smartpick.co.za
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 text-xs text-gray-400 sm:flex-row">
        <p>© {new Date().getFullYear()} KhulaGrow · Cultivation software for licensed growers</p>
        <p className="text-gray-300">
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
      </div>
    </footer>
  );
}
