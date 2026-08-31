import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/PublicShell";
import { RESOURCES, getResource } from "@/lib/resources";
import { ARTICLES } from "@/content/resources";

const SITE_URL = process.env.APP_URL ?? "https://khulagrow.smartpick.co.za";

export function generateStaticParams() {
  return RESOURCES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  const url = `${SITE_URL}/resources/${resource.slug}`;
  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `/resources/${resource.slug}` },
    // Drafts are reachable by URL for review but must never be indexed.
    robots: resource.status === "published" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "article",
      url,
      siteName: "KhulaGrow",
      title: resource.title,
      description: resource.description,
      locale: "en_ZA",
      publishedTime: resource.updated,
      modifiedTime: resource.updated,
    },
    twitter: {
      card: "summary_large_image",
      title: resource.title,
      description: resource.description,
    },
  };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResource(slug);
  const article = ARTICLES[slug];
  if (!resource || !article) notFound();

  const session = await getSession();
  const { Body, sections } = article;
  const url = `${SITE_URL}/resources/${resource.slug}`;
  const related = resource.related
    .map((s) => getResource(s))
    .filter((r): r is NonNullable<typeof r> => !!r && (r.status === "published" || !!session));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: resource.title,
      description: resource.description,
      inLanguage: "en-ZA",
      datePublished: resource.updated,
      dateModified: resource.updated,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "KhulaGrow", url: SITE_URL },
      publisher: { "@type": "Organization", name: "KhulaGrow", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 3, name: resource.heading, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-gray-900">
      {resource.status === "published" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <SiteHeader signedIn={!!session} />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-gray-400">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/resources" className="hover:text-brand-700">Guides</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-500">{resource.category}</span>
        </nav>

        {resource.status === "draft" && (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
            <p className="font-bold">Draft — not published, not indexed.</p>
            <p className="mt-1">
              Every <mark className="rounded bg-amber-100 px-1">highlighted</mark> fact below still
              needs checking against the current SAHPRA or DALRRD source. Once they are confirmed,
              set this guide&apos;s <code className="rounded bg-amber-100 px-1">status</code> to{" "}
              <code className="rounded bg-amber-100 px-1">&quot;published&quot;</code> in{" "}
              <code className="rounded bg-amber-100 px-1">src/lib/resources.ts</code> to put it live
              and into sitemap.xml.
            </p>
          </div>
        )}

        <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
          {resource.heading}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-500">{resource.description}</p>
        <p className="mt-5 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {resource.category} · {resource.readingMinutes} min read · Updated{" "}
          {format(new Date(resource.updated), "d MMMM yyyy")}
        </p>

        {sections.length > 0 && (
          <nav aria-label="On this page" className="mt-8 rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">On this page</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-700 hover:underline">{s.label}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article className="mt-10">
          <Body />
        </article>

        <section className="mt-14 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 px-6 py-9 text-center text-white">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Keep these records <em className="italic text-brand-200">without the paperwork</em>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-100">
            KhulaGrow captures batch traceability, input registers, destruction logs and a
            tamper-evident audit trail from a phone in the field — and exports your compliance
            pack in one tap.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-800 shadow-lg hover:bg-brand-50"
          >
            Start your free trial
          </Link>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold tracking-tight">Keep reading</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/resources/${r.slug}`}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="font-semibold leading-snug text-gray-900">{r.title}</p>
                  <p className="mt-2 text-sm text-gray-500">{r.readingMinutes} min read →</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
