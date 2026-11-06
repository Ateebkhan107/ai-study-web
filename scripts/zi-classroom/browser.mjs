import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ZI_BROWSER_PLAYWRIGHT || "playwright");
const origin = "http://127.0.0.1:3471";
const evidence = process.env.ZI_BROWSER_EVIDENCE;
const browser = await chromium.launch({
  executablePath: process.env.ZI_BROWSER_CHROMIUM,
  args: ["--disable-background-networking", "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"],
});

async function context(options) {
  const session = await browser.newContext(options);
  await session.route("**/*", (route) => (
    route.request().url().startsWith(origin + "/") ? route.continue() : route.abort()
  ));
  return session;
}

const openZi = (page) => page.getByRole("button", { name: "Open Zi study companion" }).click();
const button = (page, name) => page.getByRole("button", { name, exact: true });
const step = (page, label) => page.getByRole("status").filter({ hasText: label }).waitFor();
const composer = (page) => page.getByRole("textbox", { name: "Ask Zi anything" });
const ball = (page) => page.locator('circle[fill="#fef08a"]').getAttribute("cx");
async function chooseProjectile(page) {
  await button(page, "Visual Classroom").click();
  await page.getByRole("button", { name: /Projectile Motion/ }).click();
  await step(page, "Aim the launch");
}

try {
  const desktop = await context({ viewport: { width: 1360, height: 850 } });
  const page = await desktop.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  const outbound = [];
  let chatRequests = 0;
  page.on("pageerror", (error) => { errors.push(error.message); console.error(error.message); });
  page.on("console", (message) => {
    if (message.type() === "error") console.error("Browser console:", message.text());
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(origin + "/")) outbound.push(request.url());
    if (request.url() === origin + "/api/zi/chat") chatRequests++;
  });
  await page.goto(origin + "/dashboard");
  await openZi(page);
  if (process.argv.includes("--disabled")) {
    await page.getByRole("dialog", { name: "Zi assistant panel" }).waitFor();
    assert.equal(await button(page, "Visual Classroom").count(), 0);
    const denied = await page.request.post(origin + "/api/zi/chat", {
      data: { messages: [{ role: "user", content: "/classroom projectile motion" }] },
    });
    assert.equal(denied.status(), 403);
    console.log("PASS: ordinary Zi opens, Classroom entry is absent and selection is denied by the real route");
  } else {
    await composer(page).fill("My unsent draft");
    await composer(page).evaluate((node) => { window.classroomTestComposer = node; });
    assert.equal(await page.locator("script[src*=classroom]").count(), 0);
    const start = performance.now();
    try {
      await chooseProjectile(page);
    } catch (error) {
      console.error(await page.locator("body").innerText());
      throw error;
    }
    const coldOpenMs = Math.round(performance.now() - start);

    const next = button(page, "Next");
    await next.click();
    await step(page, "Split the velocity");
    assert.equal(await page.locator(".katex").count(), 1);
    await next.click();
    await next.click();
    await step(page, "Trace the flight");
    const slider = page.getByRole("slider", { name: "Adjust Launch angle" });
    await slider.fill("57");
    await button(page, "Play").click();
    await page.waitForFunction(() => Number(document.querySelector('circle[fill="#fef08a"]')?.getAttribute("cx")) > 60);
    await button(page, "Pause").click();
    const pausedAt = await ball(page);

    await button(page, "Expand").click();
    const full = page.getByRole("dialog", { name: "Zi Visual Classroom" });
    await full.waitFor();
    assert.equal(await full.evaluate((node) => node.matches(":modal")), true);
    assert.equal(await page.evaluate(() => document.getElementById("zi-composer") === window.classroomTestComposer), true);
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "hidden");
    assert.equal(await ball(page), pausedAt);
    assert.equal(await slider.inputValue(), "57");
    assert.equal(await button(page, "Exit full screen").evaluate((node) => node === document.activeElement), true);
    assert.equal(await button(page, "Play").evaluate((node) => node.getBoundingClientRect().bottom <= innerHeight), true);
    if (evidence) await page.screenshot({ path: join(evidence, "classroom-desktop.png") });
    await page.locator('a[href="/dashboard"]').evaluate((node) => node.focus());
    assert.equal(await full.evaluate((node) => node.contains(document.activeElement)), true);
    await page.keyboard.press("Tab");
    assert.equal(await full.evaluate((node) => node.contains(document.activeElement)), true);
    await page.keyboard.press("Escape");
    await button(page, "Expand").waitFor();
    assert.equal(await button(page, "Expand").evaluate((node) => node === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
    assert.equal(await ball(page), pausedAt);

    await button(page, "Play").click();
    await page.waitForFunction((position) =>
      Number(document.querySelector('circle[fill="#fef08a"]')?.getAttribute("cx")) > Number(position) + 4, pausedAt);
    await button(page, "Pause").click();
    await button(page, "Replay").click();
    await page.waitForFunction((position) => {
      const x = Number(document.querySelector('circle[fill="#fef08a"]')?.getAttribute("cx"));
      return x >= 50 && x < Number(position);
    }, pausedAt);
    await button(page, "Chat").click();
    assert.equal(await composer(page).inputValue(), "My unsent draft");
    await button(page, "Whiteboard").click();
    await step(page, "Trace the flight");
    assert.equal(await button(page, "Play").isEnabled(), true);
    assert.equal(chatRequests, 0);

    await button(page, "Expand").click();
    await button(page, "Chat").click();
    await button(page, "Play").click();
    await composer(page).fill("Why is horizontal speed constant?");
    await button(page, "Send message to Zi").click();
    await page.getByText(/Mock Zi: Let’s start/).waitFor();
    assert.equal(await button(page, "Play").isDisabled(), true);
    await page.keyboard.press("Escape");
    await button(page, "Chat").click();
    await page.getByText(/The horizontal velocity stays constant/).waitFor();
    assert.equal(chatRequests, 1);
    assert.equal(await button(page, "Reset Preferences").count(), 0);
    await page.getByText("Why is horizontal speed constant?", { exact: true }).waitFor();
    await button(page, "Whiteboard").click();
    await step(page, "Trace the flight");
    assert.equal(await slider.inputValue(), "57");
    await button(page, "Previous").click();
    await step(page, "Add gravity");
    await button(page, "Reset").click();
    await step(page, "Aim the launch");
    assert.equal(await slider.inputValue(), "45");

    const timings = await next.evaluate(async (node) => {
      const values = [];
      for (let index = 0; index < 12; index++) {
        const target = index % 2 === 0 ? node : Array.from(document.querySelectorAll(".zi-board-actions button"))
          .find((button) => button.textContent.includes("Previous"));
        const start = performance.now();
        target.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        values.push(performance.now() - start);
      }
      return values.sort((a, b) => a - b);
    });

    await button(page, "Lessons").click();
    await page.getByLabel("Explanation language").selectOption("Hinglish");
    await page.getByRole("button", { name: /Chemical Bonding/ }).click();
    await page.getByText(/Neutral sodium ka ek/).waitFor();
    await next.click();
    await step(page, "Represent electron transfer");
    await page.getByText("Cl⁻ · 8 outer electrons", { exact: true }).waitFor();
    await next.click();
    await step(page, "Connect ions to a lattice");
    await next.click();
    await step(page, "Compare a covalent bond");
    await page.getByText("Shared electron pair · H₂", { exact: true }).waitFor();

    await button(page, "Lessons").click();
    await page.getByRole("button", { name: /Cell Structure/ }).click();
    await button(page, "Mitochondria").click();
    await step(page, "Mitochondria");
    await page.getByText("Mitochondria · schematic, not to scale", { exact: true }).waitFor();
    await page.keyboard.press("Escape");
    await openZi(page);
    await step(page, "Mitochondria");
    await button(page, "Chat").click();
    await composer(page).fill("/classroom projectile motion Hinglish");
    await button(page, "Send message to Zi").click();
    await button(page, "Open whiteboard").waitFor();
    await composer(page).fill("Follow-up draft");
    await button(page, "Open whiteboard").click();
    await step(page, "Aim the launch");
    await page.getByText(/Object ek speed aur direction/).waitFor();
    await next.click();
    await button(page, "Expand").click();
    await step(page, "Split the velocity");
    await page.keyboard.press("Escape");
    await step(page, "Split the velocity");
    await button(page, "Chat").click();
    assert.equal(await composer(page).inputValue(), "Follow-up draft");
    await page.getByText(/The horizontal velocity stays constant/).waitFor();
    assert.equal(chatRequests, 2);
    await page.keyboard.press("Escape");
    await page.getByRole("link", { name: "Protected solving route" }).click();
    await page.waitForURL("**/test/session");
    assert.equal(await page.getByRole("button", { name: "Open Zi study companion" }).count(), 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(outbound, []);
    console.log(`PASS: real chat route, intercepted provider, marker spoofing, server-authorized Classroom action, three fixtures, focus and state preservation. First open ${coldOpenMs} ms; warm step-to-two-frames p95 ${Math.round(timings.at(-1))} ms; 2 chat requests and 0 external requests.`);
    await desktop.close();

    for (const width of [320, 390]) {
      const mobile = await context({ viewport: { width, height: 740 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      const small = await mobile.newPage();
      await small.goto(origin + "/dashboard");
      await openZi(small);
      await chooseProjectile(small);
      assert.equal(await button(small, "Play").isDisabled(), true);
      assert.equal(await button(small, "Replay").isDisabled(), true);
      await button(small, "Expand").click();
      const dimensions = await small.getByRole("dialog", { name: "Zi Visual Classroom" }).evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
        inner: node.clientWidth,
        scroll: node.scrollWidth,
        viewport: window.innerWidth,
        viewportHeight: window.visualViewport.height,
        minButton: Math.min(...Array.from(node.querySelectorAll(".zi-board-actions button"), (item) => item.getBoundingClientRect().height)),
      }));
      assert.equal(dimensions.width, width);
      assert.equal(Math.round(dimensions.height), Math.round(dimensions.viewportHeight), JSON.stringify(dimensions));
      assert.equal(dimensions.viewport, width);
      assert.ok(dimensions.scroll <= dimensions.inner + 1);
      assert.ok(dimensions.minButton >= 44);
      if (evidence) await small.screenshot({ path: join(evidence, `classroom-${width}.png`) });
      await button(small, "Chat").tap();
      await composer(small).fill("Mobile draft");
      assert.equal(await small.getByRole("article", { name: "Lesson whiteboard" }).isVisible(), false);
      await button(small, "Whiteboard").tap();
      await step(small, "Aim the launch");
      await button(small, "Exit full screen").tap();
      await button(small, "Chat").tap();
      assert.equal(await composer(small).inputValue(), "Mobile draft");
      console.log(`PASS: ${width}px touch layout, reduced motion, 44px playback targets and mobile draft preservation`);
      await mobile.close();
    }
  }
} finally {
  await browser.close();
}
