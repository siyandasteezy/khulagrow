/**
 * Social proof — the biggest trust gap the brand audit flagged.
 *
 * These arrays are intentionally empty. Nothing on this file may be filled in
 * with an invented farm, person or number: every entry must be a real customer
 * who has given written permission to be named. An empty array simply hides
 * its section on the homepage, so shipping with nothing here is safe.
 *
 *   TESTIMONIALS  → tracker task T-07 (one named customer quote)
 *   CASE_STUDIES  → tracker task T-12 (2–3 named farm case studies)
 *   FIELD_PHOTOS  → tracker task T-11 (real cultivation-environment imagery)
 */

export type Testimonial = {
  /** Exactly what they said — don't tidy it up. */
  quote: string;
  /** Person's name, as they agreed to be credited. */
  name: string;
  /** Their role, e.g. "Cultivation Manager". */
  role: string;
  /** Farm or company name. */
  farm: string;
  /** Province or town — grounds it locally. */
  location?: string;
  /** Optional headshot in /public/proof/. */
  photo?: string;
};

export type CaseStudy = {
  slug: string;
  farm: string;
  location: string;
  /** One-line summary of the change, e.g. "From notebooks to an inspection-ready pack". */
  headline: string;
  /** What their record-keeping looked like before KhulaGrow. */
  before: string;
  /** What it looks like now. */
  after: string;
  /** Two or three concrete, verifiable outcomes. No invented percentages. */
  outcomes: string[];
  /** Optional pull-quote from the farm. */
  quote?: { text: string; attribution: string };
  /** Optional photo in /public/proof/. */
  photo?: string;
};

export type FieldPhoto = {
  /** Path under /public — e.g. "/field/tunnel-logging.jpg". */
  src: string;
  /** Real description of what's happening. Required — it is the alt text. */
  alt: string;
  /** Short caption shown under the image. */
  caption?: string;
};

export const TESTIMONIALS: Testimonial[] = [];

export const CASE_STUDIES: CaseStudy[] = [];

export const FIELD_PHOTOS: FieldPhoto[] = [];
