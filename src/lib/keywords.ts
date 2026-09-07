import { getResource } from "./resources";

/**
 * The keyword clusters from the field plan's SEO Strategy section (T-06),
 * ranked by where a prospect actually sits in their 12–24 month licensing
 * journey — not by search volume, which is too small a market for volume to
 * be the deciding factor.
 *
 * Ranking position is intentionally NOT tracked here: getting live SERP
 * position requires a Google Search Console property verified for
 * khulagrow.smartpick.co.za, with API access granted to this app. That
 * verification has to happen in the owner's Google account — see the note
 * rendered alongside this list in /admin/measurement.
 */

export type KeywordTier = "Regulatory education" | "Solution-aware" | "Decision & comparison";

export type KeywordTarget = {
  term: string;
  tier: KeywordTier;
  intent: string;
  /** Guide slug that targets this term, if one exists yet. */
  guideSlug?: string;
};

export const KEYWORD_TARGETS: KeywordTarget[] = [
  // Regulatory education — own this before GrowerIQ does.
  {
    term: "sahpra cultivation licence requirements",
    tier: "Regulatory education",
    intent: "Applicant, early research",
    guideSlug: "sahpra-cultivation-licence-checklist",
  },
  {
    term: "hemp permit vs sahpra medicinal licence",
    tier: "Regulatory education",
    intent: "Confused applicant — high-value explainer",
    guideSlug: "hemp-permit-vs-medicinal-licence",
  },
  {
    term: "sahpra inspection checklist",
    tier: "Regulatory education",
    intent: "Near-term, high urgency",
    guideSlug: "what-sahpra-inspectors-check",
  },
  {
    term: "cannabis record keeping requirements south africa",
    tier: "Regulatory education",
    intent: "Directly product-relevant",
    guideSlug: "sahpra-cultivation-licence-checklist",
  },
  {
    term: "dalrrd hemp permit application",
    tier: "Regulatory education",
    intent: "Hemp-segment applicant",
    // No guide targets this yet — a gap, not an oversight. A fifth guide
    // is worth writing once T-08's DALRRD verification email gets a reply.
  },

  // Solution-aware — actively comparing tools.
  {
    term: "cannabis seed to sale software south africa",
    tier: "Solution-aware",
    intent: "Actively comparing tools",
  },
  {
    term: "sahpra compliance software",
    tier: "Solution-aware",
    intent: "High intent, low competition today",
  },
  {
    term: "cannabis batch traceability system",
    tier: "Solution-aware",
    intent: "Feature-specific researcher",
  },
  {
    term: "offline farm data capture app",
    tier: "Solution-aware",
    intent: "Infrastructure-aware buyer — a KhulaGrow strength",
  },

  // Decision & comparison.
  {
    term: "khulagrow pricing",
    tier: "Decision & comparison",
    intent: "Branded — protect this territory",
  },
  {
    term: "khulagrow review",
    tier: "Decision & comparison",
    intent: "Branded — protect this territory",
  },
  {
    term: "does metrc work in south africa",
    tier: "Decision & comparison",
    intent: "It doesn't — be the page that explains why",
    guideSlug: "metrc-biotrack-trellis-south-africa",
  },
  {
    term: "groweriq alternative south africa",
    tier: "Decision & comparison",
    intent: "Direct comparison capture, once GrowerIQ's SA push is established",
  },
];

export const KEYWORD_TIER_ORDER: KeywordTier[] = [
  "Regulatory education",
  "Solution-aware",
  "Decision & comparison",
];

/** Whether the guide (if any) targeting this term is actually live yet. */
export function keywordStatus(k: KeywordTarget): "No guide yet" | "Draft" | "Published" {
  if (!k.guideSlug) return "No guide yet";
  const resource = getResource(k.guideSlug);
  return resource?.status === "published" ? "Published" : "Draft";
}
