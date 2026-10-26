import test from "node:test";
import assert from "node:assert/strict";
import { formulaExam, formulaPath, INDEXABLE, publicMetadata, PUBLIC_SITEMAP_PATHS, ROBOTS_DISALLOW, SITE_URL } from "../seo.mjs";
import { buildLandingMetadata, SEO_PAGES } from "../seoLandingPages.js";

test("canonical identity ignores preview/local app configuration", () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL;
  try {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const metadata = publicMetadata({ title: "Physics revision", description: "Study cards", path: "/formula-cards/physics" });
    assert.equal(metadata.alternates.canonical, "https://www.prepzii.com/formula-cards/physics");
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.title.absolute, "Physics revision | PrepZii");
    assert.deepEqual(metadata.robots, INDEXABLE);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = previous;
  }
});

test("formula canonicalization retains distinct NEET resources and consolidates the JEE default", () => {
  assert.equal(formulaExam(undefined), "JEE");
  assert.equal(formulaExam("neet"), "NEET");
  assert.equal(formulaExam("unknown"), "JEE");
  assert.equal(formulaPath("physics", null, "JEE"), "/formula-cards/physics");
  assert.equal(formulaPath("physics", "unit-and-dimensions", "NEET"), "/formula-cards/physics/unit-and-dimensions?exam=NEET");
  assert.equal(formulaPath("biology", null, "NEET"), "/formula-cards/biology?exam=NEET");
});

test("sitemap excludes account, application and unreviewed resources", () => {
  assert.equal(new Set(PUBLIC_SITEMAP_PATHS).size, PUBLIC_SITEMAP_PATHS.length);
  for (const path of PUBLIC_SITEMAP_PATHS) {
    assert.equal(new URL(path, SITE_URL).origin, SITE_URL);
    assert.doesNotMatch(path, /^\/(subscriptions|admin|api|test|pyq|dashboard|payment|formula-books|formula-cards)(\/|$)/);
    assert.ok(!ROBOTS_DISALLOW.some((blocked) => path.startsWith(blocked)));
  }
});

test("robots permits harmless app entry points to expose noindex while blocking private descendants", () => {
  for (const path of ["/dashboard", "/test", "/pyq", "/pro", "/history", "/notifications", "/zi", "/sign-in", "/sign-up"]) {
    assert.ok(!ROBOTS_DISALLOW.some((blocked) => path.startsWith(blocked)), path);
  }
  for (const path of ["/test/session", "/pyq/session", "/admin", "/institute", "/subscriptions", "/api/profile"]) {
    assert.ok(ROBOTS_DISALLOW.some((blocked) => path.startsWith(blocked)), path);
  }
});

test("exam discovery links are public and actual practice CTAs retain the track redirect", () => {
  for (const page of Object.values(SEO_PAGES)) {
    const metadata = buildLandingMetadata(page);
    assert.equal(metadata.alternates.canonical, new URL(page.path, SITE_URL).href);
    assert.deepEqual(metadata.robots, INDEXABLE);
    assert.equal((metadata.title.absolute.match(/PrepZii/g) || []).length, 1);
    assert.match(page.primaryCta.href, /^\/go\/(jee|neet)\//);
    for (const card of page.linkCards || []) assert.ok(!card.href.startsWith("/go/"));
  }
  assert.equal(SEO_PAGES.jee.secondaryCta.href, "/jee/pyq");
  assert.equal(SEO_PAGES.neet.secondaryCta.href, "/neet/pyq");
});
