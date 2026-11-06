import test from "node:test";
import assert from "node:assert/strict";
import { createRequire, registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Compile the real JSX with Next's bundled Babel. Only surrounding app context
// (Clerk, navigation, rich math/logo rendering) is replaced, not the builder.
const require = createRequire(import.meta.url);
const babel = require("next/dist/compiled/babel/core");
const root = fileURLToPath(new URL("../../../", import.meta.url));
const data = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
const hooks = registerHooks({
  resolve(specifier, context, next) {
    const mocks = {
      "@clerk/nextjs": 'export const useUser=()=>({user:{id:"student-1"},isLoaded:true,isSignedIn:true});',
      "next/navigation": 'export const useRouter=()=>({push(){}}); export const usePathname=()=>globalThis.__ziTestPathname||"/zi"; export const useSearchParams=()=>new URLSearchParams();',
      "next/link": 'export default function Link(){return null}',
      "@/components/MathText": 'export default function MathText({children}){return children}',
      "@/components/Logo": 'export default function Logo(){return null}',
      "@/components/zi/ZiVisual": 'export default function Visual(){return null}',
      "@/components/zi/ZiSpeakButton": 'export default function Speak(){return null}',
      "@/lib/zi/pageContext": 'export const useZiPageContext=()=>({pageType:"unknown"})',
    };
    if (mocks[specifier]) return { url: data(mocks[specifier]), shortCircuit: true };
    let filename;
    if (specifier.startsWith("@/")) filename = path.join(root, specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:") && context.parentURL.includes("/src/")) filename = fileURLToPath(new URL(specifier, context.parentURL));
    if (filename) for (const suffix of ["", ".js", ".jsx"]) if (existsSync(filename + suffix) && path.extname(filename + suffix)) return next(pathToFileURL(filename + suffix).href, context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".jsx")) return { format: "module", source: babel.transformSync(readFileSync(new URL(url), "utf8"), {
      filename: fileURLToPath(url), babelrc: false, configFile: false,
      presets: [[require("next/dist/compiled/babel/preset-react"), { runtime: "automatic" }]],
    }).code, shortCircuit: true };
    return next(url, context);
  },
});
const { ZiTestBuilderForm, default: ZiTestBuilder } = await import("../ZiTestBuilder.jsx");
const { default: ZiLauncher } = await import("../ZiLauncher.jsx");
const { default: ZiMessages } = await import("../ZiMessages.jsx");
const { WorkspaceMessage } = await import("../ZiWorkspace.jsx");
const { rememberBuilderAction, readBuilderToken, clearBuilderToken } = await import("../testBuilderSession.js");
const draft = { type: "ai_test_builder", token: "opaque-token", config: { exam: "JEE Main", subject: "Physics", topic: "Rotational Motion", difficulty: "Medium", questionCount: 15, mode: "timed", durationMinutes: 30 }, missing: [], errors: [], confirmed: false, prompt: "Review the summary below.", availability: { state: "quota_blocked", generationEnabled: false, message: "AI generation is unavailable because the provider quota is blocked." } };
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
test("public builder renders no generation or execution controls", () => {
  const html = render(ZiTestBuilder, { action: { ...draft, confirmed: true } });
  assert.doesNotMatch(html, /Generate confirmed test|Continue reserved job|Private generation pilot/);
});
test("private confirmed pilot exposes explicit generation and status controls without a premature Start link", () => {
  const html = render(ZiTestBuilder, { action: { ...draft, confirmed: true, availability: { ...draft.availability, orchestrationEnabled: true } } });
  assert.match(html, /Generate confirmed test/); assert.match(html, /Resume status/);
  assert.doesNotMatch(html, /href=.*generatedTestId=/);
});
test("an unconfirmed pilot draft cannot render the generation button", () => {
  const html = render(ZiTestBuilder, { action: { ...draft, availability: { ...draft.availability, orchestrationEnabled: true } } });
  assert.doesNotMatch(html, /Generate confirmed test/);
});
test("shared controls render full summary, limits and quota message", () => {
  const html = render(ZiTestBuilderForm, { draft });
  for (const text of ["AI test configuration", "Rotational Motion", "15 questions", "30 minutes", 'min="5"', 'max="30"', "Confirm configuration", "quota is blocked"]) assert.ok(html.includes(text), text);
  assert.ok(!html.includes("Start Test")); assert.ok(!html.includes("Test Ready"));
});
test("floating Zi message path renders the shared configuration card", () => {
  const html = render(ZiMessages, { messages: [{ id: "1", role: "zi", text: draft.prompt, action: draft }] });
  assert.ok(html.includes('aria-label="AI test configuration"')); assert.ok(html.includes("Confirm configuration"));
});
test("workspace message path renders the same shared configuration card", () => {
  const html = render(WorkspaceMessage, { message: { id: "2", role: "zi", text: draft.prompt, action: draft } });
  assert.ok(html.includes('aria-label="AI test configuration"')); assert.ok(html.includes("Confirm configuration"));
});
test("missing settings and validation errors suppress confirmation", () => {
  for (const change of [{ missing: ["mode"] }, { errors: ["Invalid count"] }]) {
    const html = render(ZiTestBuilderForm, { draft: { ...draft, ...change } });
    assert.ok(!html.includes("Confirm configuration"));
  }
});
test("confirmed configuration never promises a saved test or start action", () => {
  const html = render(ZiTestBuilderForm, { draft: { ...draft, confirmed: true } });
  assert.ok(html.includes("No test has been created")); assert.ok(!html.includes("Start Test"));
});
test("busy controls prevent repeated submissions and errors are accessible", () => {
  const html = render(ZiTestBuilderForm, { draft, busy: true, error: "Please sign in again." });
  assert.ok(html.includes('disabled=""')); assert.ok(html.includes('role="alert"')); assert.ok(html.includes("Saving…"));
});
test("both surfaces share tokens while separating students", () => {
  rememberBuilderAction("student-1", draft);
  assert.equal(readBuilderToken("student-1"), draft.token); assert.equal(readBuilderToken("other"), undefined);
  clearBuilderToken("student-1"); assert.equal(readBuilderToken("student-1"), undefined);
});
test.after(() => hooks.deregister());

test("accounting outages and held trials do not display a false exhaustion upsell", () => {
  globalThis.__ziTestPathname="/dashboard";
  try {
  for (const usage of [{ used: 0, pending: 0, remaining: 0, available: false }, { used: 2, pending: 1, remaining: 0, available: true }]) {
    const html = render(ZiLauncher, { plan: "FREE", ziFreeUsage: usage });
    assert.doesNotMatch(html, /used all 3 free trial prompts/);
  }
  const exhausted = render(ZiLauncher, { plan: "FREE", ziFreeUsage: { used: 3, pending: 0, remaining: 0, available: true } });
  assert.match(exhausted, /used all 3 free trial prompts/);
  } finally { delete globalThis.__ziTestPathname; }
});
