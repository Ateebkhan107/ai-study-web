/**
 * Next.js App Router sitemap.js
 * Generates /sitemap.xml at build time.
 *
 * Only public, non-authenticated pages are listed.
 * Private dashboard/app routes are intentionally excluded.
 *
 * lastModified is intentionally omitted — hardcoded dates are inaccurate
 * and Google ignores them when they don't match the HTTP Last-Modified header.
 */
export default function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.prepzii.com";

  return [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jee`,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/neet`,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/jee/pyq`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/neet/pyq`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jee/mock-tests`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/neet/mock-tests`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/subscriptions`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
