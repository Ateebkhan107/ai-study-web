// Run against a local production build: node scripts/seo/verify.mjs [origin].
import assert from "node:assert/strict";
import { PUBLIC_SITEMAP_PATHS, SITE_URL } from "../../src/lib/seo.mjs";

const origin = process.argv[2] || "http://localhost:3471";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(origin).hostname), "Local verification only");
let failures = 0;
const results = [];
async function check(label, fn) {
  try { await fn(); results.push({ check: label, status: "PASS" }); }
  catch (error) { failures++; results.push({ check: label, status: "FAIL", reason: error.message }); }
}
async function read(path) {
  const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(60000) });
  return { response, html: await response.text() };
}
function tags(html) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag).find((tag) => tag.includes('rel="canonical"'));
  return {
    canonical: canonicalTag?.match(/href="([^"]*)"/)?.[1].replaceAll("&amp;", "&"),
    robots: meta.filter((tag) => ["robots", "googlebot"].includes(tag.name)),
    title: html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1],
    description: meta.find((tag) => tag.name === "description")?.content,
  };
}

for (const path of PUBLIC_SITEMAP_PATHS) await check(`anonymous public metadata ${path}`, async () => {
  const { response, html } = await read(path);
  assert.equal(response.status, 200);
  const metadata = tags(html);
  // Next.js serializes the origin-only home canonical without a final slash.
  assert.equal(new URL(metadata.canonical).href, new URL(path, SITE_URL).href);
  assert.ok(metadata.description);
  assert.equal((metadata.title?.match(/PrepZii/g) || []).length, 1);
  assert.ok(metadata.robots.some((tag) => /\bindex\b/.test(tag.content)));
  assert.ok(metadata.robots.every((tag) => !/noindex/.test(tag.content)));
  assert.match(html, /<h1\b/);
});

await check("public sitemap and robots agree", async () => {
  const { response, html } = await read("/sitemap.xml");
  assert.equal(response.status, 200);
  const urls = [...html.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
  assert.deepEqual(urls.sort(), PUBLIC_SITEMAP_PATHS.map((path) => new URL(path, SITE_URL).href).sort());
  const { html: robots } = await read("/robots.txt");
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
  assert.ok(!/^Disallow: \/(?:dashboard|test|pyq|sign-in|sign-up)$/m.test(robots));
  assert.match(robots, /Disallow: \/test\//);
});

for (const path of ["/dashboard", "/test", "/pyq", "/pro", "/sign-in", "/sign-up", "/history", "/notifications", "/zi", "/feedback", "/report-bug"]) {
  await check(`app/utility noindex ${path}`, async () => {
    const { response, html } = await read(path);
    assert.equal(response.status, 200);
    const metadata = tags(html);
    assert.ok(metadata.robots.some((tag) => /noindex/.test(tag.content)));
    assert.ok(metadata.robots.every((tag) => !/(^|,\s*)index(,|$)/.test(tag.content)));
    assert.equal(metadata.canonical, undefined);
  });
}

for (const [path, canonical] of [
  ["/formula-cards", "/formula-cards"],
  ["/formula-cards/physics?exam=JEE&utm_source=audit", "/formula-cards/physics"],
  ["/formula-cards/physics?exam=NEET&utm_source=audit", "/formula-cards/physics?exam=NEET"],
  ["/formula-cards/biology?exam=NEET", "/formula-cards/biology?exam=NEET"],
  ["/formula-cards/physics/unit-and-dimensions?exam=JEE", "/formula-cards/physics/unit-and-dimensions"],
]) await check(`formula canonical ${path}`, async () => {
  const { response, html } = await read(path);
  assert.equal(response.status, 200);
  const metadata = tags(html);
  assert.equal(metadata.canonical, new URL(canonical, SITE_URL).href);
  assert.equal((metadata.title?.match(/PrepZii/g) || []).length, 1);
  assert.ok(metadata.description);
  assert.ok(metadata.robots.every((tag) => !/noindex/.test(tag.content)));
});

for (const path of ["/analytics", "/profile", "/subscriptions", "/test/session", "/pyq/session", "/admin", "/institute", "/formula-books/test"]) await check(`anonymous protection ${path}`, async () => {
  const { response } = await read(path);
  assert.ok([301, 302, 303, 307, 308, 401, 403, 404].includes(response.status), `Unexpected status ${response.status}`);
});

await check("invalid formula chapter stays 404", async () => {
  const { response } = await read("/formula-cards/physics/seo-missing-chapter");
  assert.equal(response.status, 404);
});
await check("practice CTA and slash redirects unchanged", async () => {
  for (const [path, destination] of [["/go/jee/pyq", "/pyq"], ["/go/neet/mock-tests", "/test"], ["/jee/pyq/", "/jee/pyq"]]) {
    const { response } = await read(path);
    assert.ok([307, 308].includes(response.status));
    assert.equal(new URL(response.headers.get("location"), origin).pathname, destination);
  }
});

for (const result of results) console.log(JSON.stringify(result));
console.log(JSON.stringify({ passed: results.length - failures, failed: failures }));
process.exitCode = failures ? 1 : 0;
