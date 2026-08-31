/**
 * The resource library — the content engine from the marketing plan.
 *
 * Every guide starts as a "draft": reachable at its URL so it can be reviewed
 * and shared privately, but noindex, excluded from the /resources index and
 * from sitemap.xml. Flipping `status` to "published" is the single edit that
 * puts a guide live. Nothing here should go to "published" until the
 * highlighted <Verify> facts inside the guide have been checked against the
 * current SAHPRA / DALRRD source.
 */

export type ResourceStatus = "draft" | "published";

export type Resource = {
  slug: string;
  /** <title> and card heading. */
  title: string;
  /** On-page H1 — shorter than the SEO title. */
  heading: string;
  description: string;
  category: "Licensing" | "Compliance" | "Comparisons" | "Case studies";
  /** Primary search intent this guide is written for. */
  targetQuery: string;
  readingMinutes: number;
  /** ISO date — drives Article schema and the "updated" line. */
  updated: string;
  status: ResourceStatus;
  /** Slugs of related guides, rendered at the foot of the article. */
  related: string[];
  /** Task ID in the marketing plan tracker this guide satisfies. */
  planTask: string;
};

export const RESOURCES: Resource[] = [
  {
    slug: "sahpra-cultivation-licence-checklist",
    title: "SAHPRA Cultivation Licence: The Complete 2026 Checklist",
    heading: "The SAHPRA cultivation licence checklist",
    description:
      "Everything a South African grower needs in place before applying for a SAHPRA cannabis cultivation licence — site, security, SOPs, record-keeping and the evidence an inspector will ask for.",
    category: "Licensing",
    targetQuery: "sahpra cultivation licence requirements",
    readingMinutes: 12,
    updated: "2026-08-27",
    status: "draft",
    related: ["hemp-permit-vs-medicinal-licence", "what-sahpra-inspectors-check"],
    planTask: "T-05",
  },
  {
    slug: "hemp-permit-vs-medicinal-licence",
    title: "Hemp Permit vs Medicinal Cannabis Licence in South Africa",
    heading: "Hemp permit or medicinal cannabis licence?",
    description:
      "Two different regulators, two different applications, two very different sets of records. How to tell which one your grow actually needs before you spend money on the wrong one.",
    category: "Licensing",
    targetQuery: "hemp permit vs cannabis licence south africa",
    readingMinutes: 9,
    updated: "2026-08-27",
    status: "draft",
    related: ["sahpra-cultivation-licence-checklist", "what-sahpra-inspectors-check"],
    planTask: "T-08",
  },
  {
    slug: "what-sahpra-inspectors-check",
    title: "What SAHPRA Inspectors Actually Check on a Cultivation Site",
    heading: "What inspectors actually check",
    description:
      "A walk-through of a cultivation inspection in the order it usually happens — documents, site, security, records — and the gaps that cost growers findings.",
    category: "Compliance",
    targetQuery: "sahpra inspection checklist cultivation",
    readingMinutes: 10,
    updated: "2026-08-27",
    status: "draft",
    related: ["sahpra-cultivation-licence-checklist", "hemp-permit-vs-medicinal-licence"],
    planTask: "T-09",
  },
  {
    slug: "metrc-biotrack-trellis-south-africa",
    title: "Why Metrc, BioTrack and Trellis Don't Fit South African Growers",
    heading: "Metrc, BioTrack, Trellis — and South Africa",
    description:
      "The big international seed-to-sale platforms are built around US state track-and-trace mandates. Here's where that model breaks for a SAHPRA-licensed farm, and what to look for instead.",
    category: "Comparisons",
    targetQuery: "metrc south africa alternative cannabis software",
    readingMinutes: 8,
    updated: "2026-08-27",
    status: "draft",
    related: ["sahpra-cultivation-licence-checklist", "what-sahpra-inspectors-check"],
    planTask: "T-18",
  },
];

export const publishedResources = () => RESOURCES.filter((r) => r.status === "published");

export const getResource = (slug: string) => RESOURCES.find((r) => r.slug === slug);

export const CATEGORY_ORDER: Resource["category"][] = [
  "Licensing",
  "Compliance",
  "Comparisons",
  "Case studies",
];
