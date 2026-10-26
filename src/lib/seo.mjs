// Search identity is independent of app/auth redirect environment variables.
export const SITE_URL = "https://www.prepzii.com";
export const INDEXABLE = { index: true, follow: true };
export const NOINDEX = { index: false, follow: true };

export function publicMetadata({ title, description, path }) {
  const url = new URL(path, SITE_URL).href;
  return {
    title: { absolute: `${title} | PrepZii` },
    description,
    alternates: { canonical: url },
    robots: INDEXABLE,
    openGraph: {
      type: "website",
      siteName: "PrepZii",
      title: `${title} | PrepZii`,
      description,
      url,
      images: [{ url: `${SITE_URL}/images/branding/prepzii-logo-dark.png` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | PrepZii`,
      description,
      images: [`${SITE_URL}/images/branding/prepzii-logo-dark.png`],
    },
  };
}

export function formulaExam(value) {
  return String(value || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
}

export function formulaPath(subjectSlug, chapterSlug, exam = "JEE") {
  const path = `/formula-cards/${encodeURIComponent(subjectSlug)}${chapterSlug ? `/${encodeURIComponent(chapterSlug)}` : ""}`;
  // JEE is the existing default. NEET selects a distinct subject/deck.
  return `${path}${formulaExam(exam) === "NEET" ? "?exam=NEET" : ""}`;
}

// Deliberately curated: no private routes or unreviewed deck expansion.
export const PUBLIC_SITEMAP_PATHS = [
  "/", "/pricing", "/jee", "/neet", "/jee/pyq", "/neet/pyq",
  "/jee/mock-tests", "/neet/mock-tests", "/about", "/careers",
  "/contact", "/help", "/privacy", "/terms",
];

export const ROBOTS_DISALLOW = [
  "/api/", "/admin", "/institute", "/onboarding", "/subscriptions",
  "/formula-books", "/test/", "/pyq/", "/analytics", "/profile",
  "/battle", "/community/", "/payment", "/go/",
];
