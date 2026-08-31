import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/PublicShell";
import { RESOURCES, CATEGORY_ORDER, publishedResources } from "@/lib/resources";

const SITE_URL = process.env.APP_URL ?? "https://khulagrow.smartpick.co.za";

export const metadata: Metadata = {
  title: "Guides for South African cannabis growers",
  description:
    "Practical guides on SAHPRA cultivation licensing, inspections and cultivation record-keeping for licensed growers in South Africa.",
  alternates: { canonical: "/resources" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/resources`,
    siteName: "KhulaGrow",
    title: "Guides for South African cannabis growers",
    description:
      "SAHPRA licensing, inspections and cultivation record-keeping — written for growers, not lawyers.",
    locale: "en_ZA",
  },
};

export default async function ResourcesPage() {
  const session = await getSession();
  const live = publishedResources();
  // Drafts stay visible to signed-in staff so guides can be reviewed in place
  // before the status flip publishes them.
  const drafts = session ? RESOURCES.filter((r) => r.status === "draft") : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "KhulaGrow grower's library",
    description:
      "Practical guides on SAHPRA cultivation licensing, inspections and cultivation record-keeping for licensed growers in South Africa.",
    url: `${SITE_URL}/resources`,
    inLanguage: "en-ZA",
    hasPart: live.map((r) => ({
      "@type": "Article",
      headline: r.title,
      url: `${SITE_URL}/resources/${r.slug}`,
      datePublished: r.updated,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader signedIn={!!session} />

      <main className="mx-auto max-w-5xl px-4 py-14">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Grower&apos;s library</p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Licensing, inspections and{" "}
          <em className="italic text-brand-700">records that hold up</em>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
          Plain-language guides for South African cultivators — what a licence application
          actually needs, what an inspector actually checks, and how to keep the records that
          keep your licence.
        </p>

        {live.length === 0 && drafts.length === 0 && (
          <p className="mt-12 rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            The first guides are being written. Check back shortly.
          </p>
        )}

        {CATEGORY_ORDER.map((category) => {
          const items = live.filter((r) => r.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} className="mt-12">
              <h2 className="font-display text-xl font-semibold tracking-tight text-gray-900">{category}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {items.map((r) => (
                  <ResourceCard key={r.slug} slug={r.slug} title={r.title} description={r.description} readingMinutes={r.readingMinutes} />
                ))}
              </div>
            </section>
          );
        })}

        {drafts.length > 0 && (
          <section className="mt-16 rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 p-6">
            <h2 className="font-display text-xl font-semibold tracking-tight text-amber-900">
              Drafts awaiting review
            </h2>
            <p className="mt-1.5 text-sm text-amber-800">
              Only visible to signed-in users. These are excluded from search engines and from
              sitemap.xml until their <code className="rounded bg-amber-100 px-1">status</code> is
              set to <code className="rounded bg-amber-100 px-1">&quot;published&quot;</code> in{" "}
              <code className="rounded bg-amber-100 px-1">src/lib/resources.ts</code>.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {drafts.map((r) => (
                <ResourceCard key={r.slug} slug={r.slug} title={r.title} description={r.description} readingMinutes={r.readingMinutes} draft />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 px-6 py-10 text-center text-white">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            The records these guides describe, <em className="italic text-brand-200">kept automatically</em>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            KhulaGrow captures batch traceability, input registers, destruction logs and an
            audit trail from a phone in the tunnel — and exports the compliance pack in one tap.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-block rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-800 shadow-lg hover:bg-brand-50"
          >
            Start your free trial
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function ResourceCard({
  slug,
  title,
  description,
  readingMinutes,
  draft,
}: {
  slug: string;
  title: string;
  description: string;
  readingMinutes: number;
  draft?: boolean;
}) {
  return (
    <Link
      href={`/resources/${slug}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-gray-900 group-hover:text-brand-800">
        {title}
      </h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-500">{description}</p>
      <p className="mt-4 text-xs font-semibold text-gray-400">
        {draft && <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Draft</span>}
        {readingMinutes} min read · Read guide →
      </p>
    </Link>
  );
}
