import { ROBOTS_DISALLOW, SITE_URL } from "@/lib/seo.mjs";

export default function robots() {
  return {
    rules: [{
      userAgent: "*",
      // Public app entry points can be crawled to read their noindex tags.
      // Authentication and authorization remain independent of robots.txt.
      allow: "/",
      disallow: ROBOTS_DISALLOW,
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
