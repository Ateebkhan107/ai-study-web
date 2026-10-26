import { PUBLIC_SITEMAP_PATHS, SITE_URL } from "@/lib/seo.mjs";

export default function sitemap() {
  // No guessed lastModified dates or database access during sitemap builds.
  return PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: new URL(path, SITE_URL).href,
  }));
}
