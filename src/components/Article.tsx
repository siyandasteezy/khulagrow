import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Building blocks for the /resources long-form guides. Deliberately small and
 * typographic — the guides are the SEO surface, so the markup stays semantic
 * (real h2/h3, real lists) rather than div soup.
 */

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-relaxed text-gray-700">{children}</p>;
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-display mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-gray-900">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-lg font-bold text-gray-900">{children}</h3>;
}

export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 leading-relaxed text-gray-700">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function OL({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-4 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 leading-relaxed text-gray-700">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** A tick-list block — the format that earns the "checklist" search intent. */
export function Checklist({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-brand-300 text-[10px] font-bold text-brand-700">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm leading-relaxed text-brand-900">
      {children}
    </div>
  );
}

/**
 * Marks a fact that must be confirmed against the current SAHPRA / DALRRD
 * source before the guide is published. Renders visibly in draft guides and
 * is what the pre-publish check in scripts/check-resources.mjs looks for.
 */
export function Verify({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900 decoration-amber-400 decoration-dotted underline-offset-4">
      {children}
    </mark>
  );
}

/** Inline link to another guide — the internal-link web the SEO plan wants. */
export function GuideLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <Link href={`/resources/${slug}`} className="font-medium text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">
      {children}
    </Link>
  );
}

/** Inline link into the product — every guide should end up somewhere useful. */
export function AppLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-500">
      {children}
    </Link>
  );
}
