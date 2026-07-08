export const STAGE_LABELS: Record<string, string> = {
  GERMINATION: "Germination",
  CLONE: "Clone",
  SEEDLING: "Seedling",
  VEGETATIVE: "Vegetative",
  FLOWERING: "Flowering",
  HARVESTED: "Harvested",
  DESTROYED: "Destroyed",
};

export const STAGE_COLORS: Record<string, string> = {
  GERMINATION: "bg-amber-100 text-amber-800",
  CLONE: "bg-teal-100 text-teal-800",
  SEEDLING: "bg-lime-100 text-lime-800",
  VEGETATIVE: "bg-green-100 text-green-800",
  FLOWERING: "bg-purple-100 text-purple-800",
  HARVESTED: "bg-blue-100 text-blue-800",
  DESTROYED: "bg-red-100 text-red-800",
};

export const HEALTH_LABELS: Record<string, string> = {
  HEALTHY: "Healthy",
  NEEDS_ATTENTION: "Needs attention",
  PEST: "Pest",
  DISEASE: "Disease",
  NUTRIENT_DEFICIENCY: "Nutrient deficiency",
  QUARANTINE: "Quarantine",
  DEAD: "Dead",
};

export const HEALTH_COLORS: Record<string, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  NEEDS_ATTENTION: "bg-amber-100 text-amber-800",
  PEST: "bg-orange-100 text-orange-800",
  DISEASE: "bg-red-100 text-red-800",
  NUTRIENT_DEFICIENCY: "bg-yellow-100 text-yellow-800",
  QUARANTINE: "bg-fuchsia-100 text-fuchsia-800",
  DEAD: "bg-gray-200 text-gray-700",
};

export const INPUT_TYPE_LABELS: Record<string, string> = {
  IRRIGATION: "Irrigation",
  NUTRIENT: "Nutrients",
  FERTILIZER: "Fertilizer",
  PESTICIDE: "Pesticide",
  FUNGICIDE: "Fungicide",
  GROWING_MEDIA: "Growing media",
  LABOUR: "Labour",
  EQUIPMENT: "Equipment",
  OTHER: "Other",
};

export const INPUT_TYPE_ICONS: Record<string, string> = {
  IRRIGATION: "💧",
  NUTRIENT: "🧪",
  FERTILIZER: "🌱",
  PESTICIDE: "🐛",
  FUNGICIDE: "🍄",
  GROWING_MEDIA: "🪴",
  LABOUR: "👷",
  EQUIPMENT: "🔧",
  OTHER: "📦",
};

export const AREA_TYPE_LABELS: Record<string, string> = {
  BLOCK: "Block",
  TUNNEL: "Tunnel",
  ROOM: "Room",
  GREENHOUSE: "Greenhouse",
  FIELD: "Field",
};

export const WASTE_REASON_LABELS: Record<string, string> = {
  DISEASED: "Diseased",
  PEST_INFESTED: "Pest infested",
  MALE_PLANT: "Male plant",
  HERMAPHRODITE: "Hermaphrodite",
  FAILED_QC: "Failed QC",
  DAMAGED: "Damaged",
  EXPIRED: "Expired",
  OTHER: "Other",
};

export const LOT_STATUS_LABELS: Record<string, string> = {
  DRYING: "Drying",
  CURING: "Curing",
  IN_STORAGE: "In storage",
  PROCESSING: "Processing",
  PACKAGED: "Packaged",
  SHIPPED: "Shipped",
  DESTROYED: "Destroyed",
};

export const PRODUCT_LABELS: Record<string, string> = {
  FLOWER: "Flower",
  TRIM: "Trim",
  BIOMASS: "Biomass",
  EXTRACT: "Extract",
  SEEDS: "Seeds",
  CLONES: "Clones",
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  LICENCE: "Licence",
  SOP: "SOP",
  CERTIFICATE: "Certificate",
  PERMIT: "Permit",
  LAB_RESULT: "Lab result",
  INSURANCE: "Insurance",
  OTHER: "Other",
};

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  SUPERVISOR: "Supervisor",
  INSPECTOR: "Inspector",
  WORKER: "Worker",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-amber-100 text-amber-800",
  URGENT: "bg-red-100 text-red-800",
};

export function fmtGrams(g: number | null | undefined): string {
  if (g == null) return "—";
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
  return `${g.toFixed(0)} g`;
}

export function fmtRands(r: number | null | undefined): string {
  if (r == null) return "—";
  return `R ${r.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}
