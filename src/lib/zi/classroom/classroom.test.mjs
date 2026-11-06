import assert from "node:assert/strict";
import test from "node:test";
import { getClassroomFixtureOwner } from "./availability.server.js";
import { classroomFixtures } from "./fixtures.js";
import { angleSchema, formulas, templateScenes, validateClassroomLesson } from "./lessonSchema.js";
import { initialPlayback, playbackReducer } from "./playback.js";
import { calculateProjectile, GRAVITY } from "./projectile.js";

const projectile = classroomFixtures.find((lesson) => lesson.templateKey === "projectile_motion");

test("fixture access requires an authenticated identity and explicit local development opt-in", () => {
  const dev = { NODE_ENV: "development", ZI_CLASSROOM_FIXTURES: "1" };
  assert.equal(getClassroomFixtureOwner("student", dev), "student");
  for (const env of [{}, { NODE_ENV: "development" }, { ...dev, NODE_ENV: "production" },
    { ...dev, VERCEL: "1" }, { ...dev, CI: "1" }]) {
    assert.equal(getClassroomFixtureOwner("student", env), null);
  }
  assert.equal(getClassroomFixtureOwner(null, dev), null);
});

test("each template has complete English and Hinglish fixtures with only known scenes and formulas", () => {
  assert.equal(classroomFixtures.length, 6);
  assert.equal(new Set(classroomFixtures.map(({ lessonId }) => lessonId)).size, 6);
  for (const [templateKey, scenes] of Object.entries(templateScenes)) {
    const variants = classroomFixtures.filter((lesson) => lesson.templateKey === templateKey);
    assert.deepEqual(variants.map(({ language }) => language), ["English", "Hinglish"]);
    for (const variant of variants) {
      assert.deepEqual(validateClassroomLesson(variant), variant);
      assert.deepEqual(variant.steps.map(({ sceneKey }) => sceneKey), scenes);
      for (const step of variant.steps) {
        for (const key of step.formulaKeys ?? []) assert.ok(formulas[key]);
      }
    }
    assert.notEqual(variants[0].steps[0].explanation, variants[1].steps[0].explanation);
  }
});

test("lesson validation rejects version, template, shape, bounds and registry violations", () => {
  const invalid = [
    { schemaVersion: 2 }, { templateKey: "custom" }, { script: "alert(1)" },
    { exam: "other" }, { subject: "Biology" },
    { parameters: { angleDegrees: "45", initialSpeedMps: 20 } },
    { parameters: { angleDegrees: 12, initialSpeedMps: 20 } },
    { parameters: { angleDegrees: 45, initialSpeedMps: Infinity } },
    { parameters: { angleDegrees: 45, initialSpeedMps: 20, css: "color:red" } },
    { steps: [] }, { steps: Array(9).fill(projectile.steps[0]) },
    { steps: projectile.steps.toReversed() },
    { steps: [projectile.steps[0], { ...projectile.steps[1], id: projectile.steps[0].id }] },
  ];
  for (const change of invalid) assert.equal(validateClassroomLesson({ ...projectile, ...change }), null);
  for (const change of [
    { sceneKey: "custom" }, { formulaKeys: ["range"] }, { formulaKeys: ["constructor"] },
    { animation: { type: "eval", durationMs: 600 } },
    { animation: { type: "motion_path", durationMs: 600 } },
    { animation: { type: "progressive_reveal", durationMs: 3001 } },
    { animation: { type: "none", durationMs: 1 } },
    { title: "x".repeat(101) }, { explanation: "x".repeat(601) },
    { textColor: "orange" },
  ]) {
    assert.equal(validateClassroomLesson({ ...projectile, steps: [{ ...projectile.steps[0], ...change }] }), null);
  }
  for (const value of [15, 75]) assert.ok(angleSchema.safeParse(value).success);
  for (const value of [14, 76, 44.5, "45", NaN]) assert.ok(!angleSchema.safeParse(value).success);
});

test("lesson fields reject executable content, links and arbitrary markup", () => {
  for (const explanation of [
    "<script>alert(1)</script>", '<svg onload="alert(1)">', "javascript:alert(1)",
    "https://example.invalid/a", "![diagram](//example.invalid/a)", "www.example.invalid",
    "[go](data:text/html,abc)", String.raw`\href{https://example.invalid}{link}`, "<div>unsafe</div>",
  ]) {
    assert.equal(validateClassroomLesson({
      ...projectile, steps: [{ ...projectile.steps[0], explanation }],
    }), null);
  }
});

function near(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}

test("projectile numbers match the level-ground closed forms", () => {
  const model = calculateProjectile(45, 20);
  near(model.flightTime, 2.8832, 0.0001);
  near(model.range, 400 / GRAVITY);
  near(model.height, 100 / GRAVITY);
  near(model.vx, model.vy);
  near(model.atTime(model.apexTime).vy, 0);
  near(model.atTime(model.apexTime).y, model.height);
  near(model.atTime(model.flightTime).y, 0);
  near(model.atTime(model.flightTime).x, model.range);
});

test("projectile endpoints and complementary ranges hold across the full slider domain", () => {
  for (let angle = 15; angle <= 75; angle++) {
    for (const speed of [5, 20, 40]) {
      const model = calculateProjectile(angle, speed);
      assert.ok(model.height > 0);
      near(model.atTime(0).y, 0);
      near(model.atTime(model.flightTime).y, 0);
      near(model.atTime(model.apexTime).vy, 0);
      near(model.range, calculateProjectile(90 - angle, speed).range);
    }
  }
});

test("playback resumes, clamps, replays and resets without mutable timers in the reducer", () => {
  let state = playbackReducer(initialPlayback, { type: "select", step: 3 });
  const durationMs = 800;
  const dispatch = (type, deltaMs) => { state = playbackReducer(state, { type, durationMs, deltaMs }); };
  dispatch("play");
  dispatch("tick", 280);
  dispatch("pause");
  dispatch("tick", 300);
  assert.deepEqual(state, { step: 3, elapsedMs: 280, playing: false });
  dispatch("play");
  dispatch("tick", 1000);
  assert.deepEqual(state, { step: 3, elapsedMs: 800, playing: false });
  dispatch("replay");
  assert.deepEqual(state, { step: 3, elapsedMs: 0, playing: true });
  dispatch("reset");
  assert.deepEqual(state, initialPlayback);
});
