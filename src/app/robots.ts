import type { MetadataRoute } from "next";

const SITE_URL = process.env.APP_URL ?? "https://khulagrow.smartpick.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Authenticated app surfaces — nothing indexable behind these.
        disallow: [
          "/api/",
          "/dashboard",
          "/batches",
          "/tasks",
          "/log",
          "/more",
          "/farms",
          "/harvests",
          "/inventory",
          "/compliance",
          "/documents",
          "/reports",
          "/audit",
          "/billing",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
