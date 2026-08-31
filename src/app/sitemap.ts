import type { MetadataRoute } from "next";
import { publishedResources } from "@/lib/resources";

const SITE_URL = process.env.APP_URL ?? "https://khulagrow.smartpick.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const guides = publishedResources();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Only listed once at least one guide is live — an empty hub is not worth
    // sending a crawler to.
    ...(guides.length > 0
      ? ([
          {
            url: `${SITE_URL}/resources`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ] satisfies MetadataRoute.Sitemap)
      : []),
    // Drafts are deliberately excluded — see src/lib/resources.ts.
    ...guides.map((r) => ({
      url: `${SITE_URL}/resources/${r.slug}`,
      lastModified: new Date(r.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...["/privacy", "/terms", "/data", "/security", "/support"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
