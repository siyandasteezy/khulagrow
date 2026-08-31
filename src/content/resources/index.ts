import type { ComponentType } from "react";
import Checklist, { SECTIONS as checklistSections } from "./sahpra-cultivation-licence-checklist";
import HempVsMed, { SECTIONS as hempSections } from "./hemp-permit-vs-medicinal-licence";
import Inspectors, { SECTIONS as inspectorSections } from "./what-sahpra-inspectors-check";
import Comparison, { SECTIONS as comparisonSections } from "./metrc-biotrack-trellis-south-africa";

export type Section = { id: string; label: string };

type Entry = { Body: ComponentType; sections: Section[] };

/**
 * Static slug → article map. Kept explicit rather than dynamically imported so
 * every guide is bundled at build time and a bad slug is a type error rather
 * than a runtime 404.
 */
export const ARTICLES: Record<string, Entry> = {
  "sahpra-cultivation-licence-checklist": { Body: Checklist, sections: checklistSections },
  "hemp-permit-vs-medicinal-licence": { Body: HempVsMed, sections: hempSections },
  "what-sahpra-inspectors-check": { Body: Inspectors, sections: inspectorSections },
  "metrc-biotrack-trellis-south-africa": { Body: Comparison, sections: comparisonSections },
};
