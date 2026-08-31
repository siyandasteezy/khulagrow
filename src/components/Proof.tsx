import Image from "next/image";
import { TESTIMONIALS, CASE_STUDIES, FIELD_PHOTOS } from "@/lib/proof";

/**
 * Every section here renders nothing while its data source in src/lib/proof.ts
 * is empty, so the homepage degrades cleanly until real, permissioned customer
 * proof exists.
 */

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  const single = TESTIMONIALS.length === 1;

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          From growers <em className="italic text-brand-700">already using it</em>
        </h2>
        <div className={`mt-12 grid gap-6 ${single ? "max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {TESTIMONIALS.map((t) => (
            <figure key={`${t.farm}-${t.name}`} className="rounded-2xl border border-gray-100 bg-[#f6f7f4] p-6">
              <blockquote className="text-lg leading-relaxed text-gray-800">
                <span className="font-display text-3xl leading-none text-brand-300" aria-hidden>&ldquo;</span>
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-4">
                {t.photo && (
                  <Image src={t.photo} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                )}
                <div className="text-sm">
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-gray-500">
                    {t.role} · {t.farm}
                    {t.location && ` · ${t.location}`}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CaseStudies() {
  if (CASE_STUDIES.length === 0) return null;

  return (
    <section id="case-studies" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Inspection ready — <em className="italic text-brand-700">real farms</em>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-500">
          Named South African growers, and what changed about their record-keeping.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {CASE_STUDIES.map((c) => (
            <article key={c.slug} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {c.photo && (
                <Image
                  src={c.photo}
                  alt={`${c.farm}, ${c.location}`}
                  width={640}
                  height={360}
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {c.farm} · {c.location}
                </p>
                <h3 className="font-display mt-2 text-lg font-semibold leading-snug tracking-tight">
                  {c.headline}
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Before</dt>
                    <dd className="mt-1 leading-relaxed text-gray-600">{c.before}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">After</dt>
                    <dd className="mt-1 leading-relaxed text-gray-600">{c.after}</dd>
                  </div>
                </dl>
                <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  {c.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2.5 text-gray-700">
                      <span className="text-brand-600">✓</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
                {c.quote && (
                  <blockquote className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm italic leading-relaxed text-brand-900">
                    &ldquo;{c.quote.text}&rdquo;
                    <cite className="mt-1.5 block text-xs not-italic font-semibold text-brand-700">
                      — {c.quote.attribution}
                    </cite>
                  </blockquote>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FieldGallery() {
  if (FIELD_PHOTOS.length === 0) return null;

  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          In the tunnels, <em className="italic text-brand-700">not in a showroom</em>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD_PHOTOS.map((p) => (
            <figure key={p.src} className="overflow-hidden rounded-2xl border border-gray-100">
              <Image
                src={p.src}
                alt={p.alt}
                width={800}
                height={600}
                className="h-56 w-full object-cover"
              />
              {p.caption && (
                <figcaption className="bg-[#f6f7f4] px-4 py-2.5 text-xs text-gray-500">{p.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
