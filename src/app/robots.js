/**
 * Next.js App Router robots.js
 * Generates /robots.txt at build time.
 *
 * Strategy:
 *  - Allow public informational/marketing pages
 *  - Disallow all authenticated/private areas and API routes
 */
export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://prepzii.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/about",
          "/careers",
          "/contact",
          "/help",
          "/privacy",
          "/terms",
          "/subscriptions",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/test",
          "/test/",
          "/pyq",
          "/pyq/",
          "/analytics",
          "/analytics/",
          "/profile",
          "/profile/",
          "/community",
          "/community/",
          "/pro",
          "/pro/",
          "/history",
          "/history/",
          "/formula-books",
          "/formula-books/",
          "/admin",
          "/admin/",
          "/institute",
          "/institute/",
          "/onboarding",
          "/onboarding/",
          "/payment",
          "/payment/",
          "/notifications",
          "/notifications/",
          "/sign-in",
          "/sign-up",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
