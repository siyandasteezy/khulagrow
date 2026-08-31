import { z } from "zod";

/**
 * Acquisition attribution (tracker task T-06).
 *
 * The plan's KPIs are about *where* a trial came from — partnership-sourced
 * trials in particular — so the landing URL's UTM parameters and the referring
 * host are captured on the client, kept in sessionStorage across the visit, and
 * posted once at registration. No third-party analytics and no cookies: only
 * fields the visitor's own browser already sent, stored against their account.
 */

export const SIGNUP_STORAGE_KEY = "kg_attribution";

export const attributionSchema = z.object({
  source: z.string().max(120).optional(),
  medium: z.string().max(120).optional(),
  campaign: z.string().max(120).optional(),
  referrer: z.string().max(300).optional(),
  landingPath: z.string().max(300).optional(),
});

export type Attribution = z.infer<typeof attributionSchema>;

/** Grouping used by the measurement panel. */
export type Channel = "Partnership" | "Content" | "Social" | "Search" | "Direct" | "Other";

const PARTNER_MEDIUMS = ["partner", "partnership", "referral", "consultant"];
const SOCIAL_HOSTS = ["linkedin.", "facebook.", "instagram.", "x.com", "twitter.", "t.co"];
const SEARCH_HOSTS = ["google.", "bing.", "duckduckgo.", "yahoo.", "ecosia."];

/**
 * Buckets a signup into one of the plan's channels. Explicit UTM tagging wins;
 * the referrer host is the fallback so untagged links still land somewhere
 * useful instead of all collapsing into "Direct".
 */
export function channelOf(u: {
  signupSource?: string | null;
  signupMedium?: string | null;
  signupReferrer?: string | null;
  signupLandingPath?: string | null;
}): Channel {
  const medium = (u.signupMedium ?? "").toLowerCase();
  const source = (u.signupSource ?? "").toLowerCase();
  const referrer = (u.signupReferrer ?? "").toLowerCase();
  const landing = (u.signupLandingPath ?? "").toLowerCase();

  if (PARTNER_MEDIUMS.some((m) => medium.includes(m) || source.includes(m))) return "Partnership";
  if (medium.includes("social") || SOCIAL_HOSTS.some((h) => referrer.includes(h))) return "Social";
  if (medium.includes("organic") || SEARCH_HOSTS.some((h) => referrer.includes(h))) return "Search";
  // Landed straight on a guide — the content engine did the work, even untagged.
  if (landing.startsWith("/resources")) return "Content";
  if (medium.includes("content") || medium.includes("email")) return "Content";
  if (!source && !medium && !referrer) return "Direct";
  return "Other";
}

/**
 * Reads attribution off a landing URL. Exported so both the client capture and
 * any server-side use share one definition of what counts.
 */
export function readAttribution(href: string, documentReferrer: string): Attribution {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return {};
  }
  const q = url.searchParams;
  const trim = (v: string | null) => (v ? v.slice(0, 120) : undefined);

  let referrer: string | undefined;
  if (documentReferrer) {
    try {
      const ref = new URL(documentReferrer);
      // Same-site navigation isn't a referral — only record external hosts.
      if (ref.host !== url.host) referrer = ref.host;
    } catch {
      /* malformed referrer — ignore */
    }
  }

  const attribution: Attribution = {
    source: trim(q.get("utm_source")),
    medium: trim(q.get("utm_medium")),
    campaign: trim(q.get("utm_campaign") ?? q.get("ref")),
    referrer,
    landingPath: url.pathname.slice(0, 300),
  };

  // Drop empty keys so an untagged visit stores nothing but the landing path.
  return Object.fromEntries(
    Object.entries(attribution).filter(([, v]) => v)
  ) as Attribution;
}
