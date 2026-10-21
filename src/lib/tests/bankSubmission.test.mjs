import test from "node:test";
import assert from "node:assert/strict";
import { createBankSubmissionGuard, findCompletedBankAttempt } from "./bankSubmission.server.js";

const fakeClient = (attempts, answers, failAnswers = false, instituteAttempts = []) => ({ from(table) {
  return { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
    then(resolve, reject) { return Promise.resolve(table === "test_attempts" ? { data: attempts } : table === "institute_test_attempts" ? { data: instituteAttempts } : failAnswers ? { error: new Error("read failed") } : { data: answers }).then(resolve, reject); } };
} });
const find = (attempts, answers, fail) => findCompletedBankAttempt({ client: fakeClient(attempts, answers, fail), userId: "owner", sessionId: "session", questionIds: ["q1", "q2"] });
test("existing-result reuse requires exactly one complete, distinct answer per question", async () => {
  const previous = [{ id: "saved", total_questions: 2 }];
  assert.equal(await find([], []), null);
  assert.equal(await find(previous, [{ question_id: "q1" }, { question_id: "q2" }]), "saved");
  for (const answers of [[], [{ question_id: "q1" }], [{ question_id: "q1" }, { question_id: "q1" }], [{ question_id: "q1" }, { question_id: "foreign" }], [{ question_id: "q1" }, { question_id: "q2" }, { question_id: "extra" }]]) {
    await assert.rejects(find(previous, answers), (e) => e.status === 409);
  }
  await assert.rejects(find([...previous, { id: "other" }], []), /conflicting/);
  await assert.rejects(find([{ id: "saved", total_questions: 3 }], [{ question_id: "q1" }, { question_id: "q2" }]), /incomplete/);
  await assert.rejects(find(previous, [], true), /read failed/);
});
test("institute retries require a completed association to the same saved attempt", async () => {
  for (const [associations, accepted] of [
    [[{ attempt_id: "saved", status: "SUBMITTED" }], true],
    [[{ attempt_id: null, status: "IN_PROGRESS" }], false],
    [[{ attempt_id: "different", status: "SUBMITTED" }], false],
    [[{ attempt_id: "saved", status: "SUBMITTED" }, { attempt_id: "other", status: "SUBMITTED" }], false],
  ]) {
    const work = findCompletedBankAttempt({ client: fakeClient([{ id: "saved", total_questions: 1 }], [{ question_id: "q" }], false, associations), userId: "owner", sessionId: "session", questionIds: ["q"] });
    if (accepted) assert.equal(await work, "saved");
    else await assert.rejects(work, /incomplete institute/);
  }
});
test("worker guard releases failed operations and serializes queued work", async () => {
  const guard = createBankSubmissionGuard(); const key = { userId: "owner", sessionId: "session" };
  let running = 0, peak = 0;
  const work = async () => { peak = Math.max(peak, ++running); await new Promise((r) => setTimeout(r, 1)); running--; };
  await Promise.all(Array.from({ length: 8 }, () => guard(key, work)));
  assert.equal(peak, 1);
  await assert.rejects(guard(key, async () => { throw new Error("failed"); }), /failed/);
  assert.equal(await guard(key, async () => "retry"), "retry");
});
test("guard separates owner/session keys and bounds queues without evicting active locks", async () => {
  const guard = createBankSubmissionGuard({ maxSessions: 1, maxQueuedPerSession: 1 });
  let release; const pending = guard({ userId: "owner", sessionId: "s" }, () => new Promise((r) => { release = r; }));
  await Promise.resolve();
  await assert.rejects(guard({ userId: "owner", sessionId: "s" }, () => {}), (e) => e.status === 429);
  await assert.rejects(guard({ userId: "other", sessionId: "s" }, () => {}), (e) => e.status === 429);
  release(); await pending;
  assert.equal(await guard({ userId: "other", sessionId: "s" }, () => "new"), "new");
});
test("separate worker guards are deliberately not a distributed uniqueness guarantee", async () => {
  const left = createBankSubmissionGuard(), right = createBankSubmissionGuard(); let running = 0, peak = 0;
  const work = async () => { peak = Math.max(peak, ++running); await new Promise((r) => setTimeout(r, 1)); running--; };
  await Promise.all([left({ userId: "owner", sessionId: "s" }, work), right({ userId: "owner", sessionId: "s" }, work)]);
  assert.equal(peak, 2);
});
