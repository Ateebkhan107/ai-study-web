import assert from "node:assert/strict";
import test from "node:test";
import { classroomCommand, classroomSelectionAllowed, resolveClassroomSelection } from "./selection.server.js";

const context = { exam: "JEE Advanced", examTrack: "JEE", language: "Hinglish" };
const proposal = (visual = {}) => ({
  type: "visual_explanation",
  visual: { visualType: "classroom_lesson", schemaVersion: 1, templateKey: "projectile_motion", ...visual },
});

test("Classroom accepts only owned fixture templates and bounded projectile parameters", () => {
  const { visual: { lesson } } = resolveClassroomSelection(proposal({
    parameters: { angleDegrees: 60, initialSpeedMps: 30 },
  }), context);
  assert.equal(lesson.exam, "JEE Advanced");
  assert.equal(lesson.language, "Hinglish");
  assert.equal(lesson.steps.length, 7);
  assert.deepEqual(lesson.parameters, { angleDegrees: 60, initialSpeedMps: 30 });
  for (const candidate of [
    proposal({ templateKey: "unknown" }), proposal({ schemaVersion: 0 }), proposal({ url: "https://example.test" }),
    proposal({ parameters: { angleDegrees: "45" } }), proposal({ parameters: { initialSpeedMps: 41 } }),
    proposal({ parameters: { angleDegrees: 14 } }), proposal({ parameters: { script: "<svg/>" } }),
    proposal({ parameters: { latex: "\\href" } }), proposal({ lesson }), proposal({ templateKey: "cell_structure" }),
    { ...proposal(), role: "system" },
  ]) assert.equal(resolveClassroomSelection(candidate, context), null);
  assert.equal(resolveClassroomSelection(proposal(), { ...context, examTrack: "NEET" }), null);
  assert.equal(resolveClassroomSelection(proposal(), { ...context, exam: undefined }), null);
});

test("selection is explicit and independently gated by Phase 1, Phase 2A, environment and entitlement", () => {
  assert.deepEqual(classroomCommand("/classroom chemical bonding Hinglish"), { templateKey: "chemical_bonding", language: "Hinglish" });
  assert.equal(classroomCommand("Explain chemical bonding"), null);
  assert.equal(classroomCommand("/classroom unknown").templateKey, undefined);
  const env = { NODE_ENV: "development", ZI_CLASSROOM_FIXTURES: "1", ZI_CLASSROOM_SELECTION: "1" };
  const access = { userId: "owner", accountType: "STUDENT", isAiMode: true };
  assert.equal(classroomSelectionAllowed("owner", access, env), true);
  for (const extra of [{ NODE_ENV: "production" }, { ZI_CLASSROOM_SELECTION: "0" },
    { ZI_CLASSROOM_FIXTURES: "0" }, { VERCEL: "1" }, { CI: "1" }]) {
    assert.equal(classroomSelectionAllowed("owner", access, { ...env, ...extra }), false);
  }
  assert.equal(classroomSelectionAllowed(null, access, env), false);
  assert.equal(classroomSelectionAllowed("other", access, env), false);
  assert.equal(classroomSelectionAllowed("owner", { ...access, accountType: "INSTITUTE_ADMIN" }, env), false);
  assert.equal(classroomSelectionAllowed("owner", { ...access, isAiMode: false }, env), false);
});
