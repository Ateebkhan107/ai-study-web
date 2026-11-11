import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = new URL("../../", import.meta.url);
let actor;
let queries;
let respond;
let rpcCalls;
let profileExam;

function query(table) {
  const calls = [];
  const builder = { then(resolve, reject) {
    const request = { table, calls };
    queries.push(request);
    return Promise.resolve().then(() => respond(request)).then(resolve, reject);
  } };
  for (const method of ["select", "eq", "in", "not", "or", "order", "limit", "range", "maybeSingle"]) {
    builder[method] = (...args) => {
      calls.push([method, ...args]);
      return builder;
    };
  }
  return builder;
}

const fixture = {
  auth: async () => ({ userId: actor, sessionClaims: { given_name: "Test" } }),
  profile: () => ({ examTrack: profileExam }),
  db: {
    from: query,
    rpc: async (name, args) => {
      rpcCalls.push({ name, args });
      return { data: { name: args.p_name, xp: 0, streak: 0, updated_at: "2026-11-01T00:00:00Z" } };
    },
  },
};
globalThis.__performanceRoutesFixture = fixture;
const mocks = {
  "@clerk/nextjs/server": "export const auth = () => globalThis.__performanceRoutesFixture.auth(); export const clerkClient = () => { throw Error('Unexpected Clerk profile read'); };",
  "@/lib/supabaseAdmin": "export const supabaseAdmin = globalThis.__performanceRoutesFixture.db;",
  "@/lib/accessControl": `export const FEATURES = { PYQ_ANALYTICS: 'PYQ_ANALYTICS' };
    export const getUserAccessContext = async () => globalThis.__performanceRoutesFixture.profile();
    export const canUseFeature = () => ({ allowed: true });
    export const getProfileAccessProfile = async () => globalThis.__performanceRoutesFixture.profile();
    export const normalizeExamTrack = (value) => value;`,
  "next/server": "export const NextResponse = Response;",
};
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (mocks[specifier]) return { url: `data:text/javascript,${encodeURIComponent(mocks[specifier])}`, shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const url = new URL(specifier.slice(2), src);
    return next(existsSync(fileURLToPath(url)) ? url.href : `${url.href}.js`, context);
  }
  return next(specifier, context);
} });

const { GET: stats } = await import("../../app/api/dashboard-stats/route.js");
const { GET: leaderboard } = await import("../../app/api/pyq/leaderboard/route.js");
const { GET: pyq } = await import("../../app/api/pyq/route.js");
const { GET: analytics } = await import("../../app/api/pyq/analytics/route.js");
const { GET: goals } = await import("../../app/api/daily-goals/route.js");
const { getUserNavigationAccess } = await import("../accessControl.js");
const { getAuthContext } = await import("../auth.js");
const { GET: formulaDeck } = await import("../../app/api/formula-cards/[subjectSlug]/[chapterSlug]/route.js");
const request = (path) => new Request(`https://prepzii.invalid${path}`);
const reply = (data) => ({ data, error: null });
const xpRow = { user_id: "owner", name: "XP name", xp: 68, streak: 4, pyq_solved: 10, correct_answers: 7, updated_at: "2026-11-01T00:00:00Z" };
const isCount = (calls) => calls.some(([method, , options]) => method === "select" && options?.count === "exact");

test.beforeEach(() => {
  actor = "owner";
  profileExam = "NEET";
  queries = [];
  rpcCalls = [];
  respond = ({ table }) => { throw new Error(`Unexpected query to ${table}`); };
});

test("navigation plan respects the profile track, active subscription and expiry", async () => {
  respond = ({ table, calls }) => {
    if (table === "user_profiles") return reply({ exam: "NEET", account_type: "STUDENT" });
    assert.equal(table, "subscriptions");
    assert.ok(calls.some(([method, column, value]) => method === "eq" && column === "exam_track" && value === "NEET"));
    return reply([
      { status: "active", plan: "ai_mode", expires_at: "2000-01-01T00:00:00Z" },
      { status: "active", plan: "quarterly", expires_at: "2099-01-01T00:00:00Z" },
    ]);
  };
  assert.equal((await getUserNavigationAccess("owner")).plan, "PRO");
  assert.deepEqual(queries.map(({ table }) => table), ["user_profiles", "subscriptions"]);
});

test("onboarding cannot be bypassed by an unavailable profile lookup", async () => {
  respond = () => ({ data: null, error: new Error("Database unavailable") });
  await assert.rejects(getAuthContext(), /Unable to verify onboarding status/);
  respond = () => reply(null);
  assert.equal((await getAuthContext()).onboardingComplete, false);
  respond = () => reply({ account_type: "STUDENT" });
  assert.equal((await getAuthContext()).onboardingComplete, true);
});

test("analytics rejects the other track before reading attempts", async () => {
  const response = await analytics(request("/api/pyq/analytics?track=JEE"));
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "EXAM_TRACK_MISMATCH");
  assert.equal(queries.length, 0);
});

test("PYQ requests with no exam still scope exact paper lookups to the actor's track", async () => {
  respond = ({ table, calls }) => {
    assert.equal(table, "pyq_questions");
    assert.ok(calls.some(([method, column, value]) => method === "eq" && column === "exam" && value === "NEET"));
    return reply([]);
  };
  const result = await pyq(request("/api/pyq?mode=full&exam_id=other-paper&subject=Physics"));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), []);
});

test("withdrawn cards disappear from the deck and database outages do not resurrect seeds", async () => {
  const chapter = { id: "jee-physics-unit-and-dimensions" };
  const card = { id: "jee-physics-unit-and-dimensions-unit-definition", is_active: true };
  let published = true;
  let failed = false;
  respond = ({ table, calls }) => {
    if (table === "formula_subjects") return reply([{ id: "jee-physics", slug: "physics" }]);
    if (table === "formula_chapters") return reply([chapter]);
    assert.equal(table, "formula_cards");
    assert.ok(calls.some(([method, column, value]) => method === "eq" && column === "is_active" && value === true));
    if (failed) return { error: new Error("Database unavailable") };
    return reply(published ? [card] : []);
  };
  const getDeck = () => formulaDeck(request("/api/formula-cards/physics/unit-and-dimensions"), {
    params: Promise.resolve({ subjectSlug: "physics", chapterSlug: "unit-and-dimensions" }),
  });
  const first = await getDeck();
  assert.equal(first.headers.get("cache-control"), "no-store");
  assert.deepEqual(await first.json(), { cards: [card] });
  published = false;
  assert.deepEqual(await (await getDeck()).json(), { cards: [] });
  failed = true;
  assert.equal((await getDeck()).status, 503);
});

test("rank failure preserves XP, accuracy and streak and does not share a private cache", async () => {
  respond = ({ calls }) => isCount(calls) ? { error: new Error("Rank unavailable") } : reply(xpRow);
  const response = await stats();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), {
    accuracy: 70, rank: null, rankUnavailable: true, streak: 4, xp: 68,
    position: { user_id: "owner", name: "XP name", xp: 68 },
  });
});

test("dashboard stats and leaderboard together compute the existing exact rank once", async () => {
  respond = ({ table, calls }) => {
    if (table === "user_profiles") return reply({ full_name: "Profile Name" });
    if (isCount(calls)) return { count: 17 };
    if (calls.some(([method]) => method === "limit")) return reply([{ ...xpRow, user_id: "top-user", xp: 240 }]);
    return reply(xpRow);
  };
  const [statsResult, boardResult] = await Promise.all([stats(), leaderboard(request("/api/pyq/leaderboard?view=top"))]);
  assert.equal((await statsResult.json()).rank, 18);
  const { rows, displayName } = await boardResult.json();
  assert.equal(rows[0].rank, 1);
  assert.equal(displayName, "Profile Name");
  const counts = queries.filter(({ calls }) => isCount(calls));
  assert.equal(counts.length, 1);
  assert.ok(counts[0].calls.some(([method, value]) => method === "or" && value === "xp.gt.68,and(xp.eq.68,updated_at.lt.2026-11-01T00:00:00Z)"));
});

test("stats use Clerk identity and initialize only missing XP rows when enabled", async () => {
  actor = null;
  assert.equal((await stats(request("/api/dashboard-stats?userId=victim"))).status, 401);
  assert.equal(queries.length, 0);
  actor = "owner";
  const previous = process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED;
  process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED = "true";
  try {
    respond = ({ calls }) => isCount(calls) ? { count: 19 } : reply(null);
    const response = await stats(request("/api/dashboard-stats?userId=victim"));
    assert.equal((await response.json()).position.user_id, "owner");
    assert.deepEqual(rpcCalls, [{ name: "prepzii_init_xp", args: { p_user: "owner", p_name: "Test" } }]);
    assert.ok(queries[0].calls.some(([method, column, value]) => method === "eq" && column === "user_id" && value === "owner"));
  } finally {
    if (previous === undefined) delete process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED;
    else process.env.PREPZII_INTEGRITY_CONTRACT_ENABLED = previous;
  }
});

test("daily goals distinguish a successful empty set from a database failure", async () => {
  respond = ({ table }) => reply(table === "user_profiles" ? { exam: "JEE" } : []);
  const empty = await goals();
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), { goals: [] });
  respond = ({ table }) => table === "user_profiles" ? reply({ exam: "JEE" }) : { error: new Error("Unavailable") };
  assert.equal((await goals()).status, 500);
});

test("NEET random paper skips incomplete candidates with metadata and reveals only owned attempts", async () => {
  const complete = [["Physics", 45], ["Chemistry", 45], ["Biology", 90]].flatMap(([subject, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${subject}-${index}`, exam_id: "valid", subject, display_order: index, correct_option: "A",
    }))
  );
  respond = ({ table, calls }) => {
    if (table === "pyq_exams") return reply([{ id: "first" }, { id: "second" }, { id: "valid" }]);
    if (table === "pyq_attempts") {
      assert.ok(calls.some(([method, column, value]) => method === "eq" && column === "user_id" && value === "owner"));
      const [, , ids] = calls.find(([method]) => method === "in");
      return reply(ids.includes("Physics-0") ? [{ question_id: "Physics-0" }] : []);
    }
    const singlePaper = calls.find(([method, column]) => method === "eq" && column === "exam_id");
    return reply(!singlePaper || singlePaper[2] === "valid" ? complete : []);
  };
  const random = Math.random;
  Math.random = () => 0.999;
  try {
    const result = await pyq(request("/api/pyq?exam=NEET&mode=random&userId=victim"));
    assert.equal(result.status, 200);
    const questions = await result.json();
    assert.equal(questions.length, 180);
    assert.equal(questions.filter((question) => question.subject === "Biology").length, 90);
    assert.deepEqual(questions.filter((question) => question.answer_revealed).map((question) => question.id), ["Physics-0"]);
    const bankQueries = queries.filter(({ table }) => table === "pyq_questions");
    assert.equal(bankQueries.length, 3);
    assert.ok(bankQueries[1].calls.some(([method, columns]) => method === "select" && !columns.includes("correct_option")));
    assert.ok(!bankQueries.some(({ calls }) => calls.some(([method, , value]) => method === "eq" && value === "second")));
  } finally { Math.random = random; }
});

test("NEET analytics scopes pages to Clerk user and preserves JEE exclusion and chapter totals", async () => {
  const row = (correct) => ({ is_correct: correct, attempted_at: "2026-11-01T00:00:00Z", pyq_questions: { exam: "AIPMT", subject: "Biology", chapter: "Cells" } });
  respond = ({ table, calls }) => {
    assert.equal(table, "pyq_attempts");
    assert.deepEqual(calls.find(([method]) => method === "eq"), ["eq", "user_id", "owner"]);
    assert.deepEqual(calls.find(([method]) => method === "or"), ["or", "exam.ilike.*NEET*,exam.ilike.*AIPMT*", { referencedTable: "pyq_questions" }]);
    const [, from] = calls.find(([method]) => method === "range");
    return reply(from === 0 ? Array.from({ length: 500 }, () => row(true)) : [row(false)]);
  };
  const response = await analytics(request("/api/pyq/analytics?track=NEET&userId=victim"));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.attempted, 501);
  assert.equal(result.correctAnswers, 500);
  assert.equal(result.chapters[0].incorrect, 1);
  assert.equal(queries.length, 2);
});

test("JEE random papers use either Maths label and sample 75 from a complete 90-question source", async () => {
  profileExam = "JEE";
  for (const math of ["Maths", "Mathematics"]) {
    const source = ["Physics", "Chemistry", math].flatMap((subject) =>
      Array.from({ length: 30 }, (_, index) => ({
        id: `${subject}-${index}`, exam_id: "jee-paper", subject, display_order: index,
        question_type: index < 20 ? "MCQ" : "NUMERICAL",
      }))
    );
    respond = ({ table }) => reply(table === "pyq_exams" ? [{ id: "jee-paper" }] : table === "pyq_questions" ? source : []);
    const result = await pyq(request("/api/pyq?exam=JEE&mode=random"));
    assert.equal(result.status, 200);
    const questions = await result.json();
    assert.equal(questions.length, 75);
    for (const subject of ["Physics", "Chemistry", math]) {
      const selected = questions.filter((question) => question.subject === subject);
      assert.equal(selected.length, 25);
      assert.equal(selected.filter((question) => question.question_type === "NUMERICAL").length, 5);
    }
  }
});

test.after(() => {
  hooks.deregister();
  delete globalThis.__performanceRoutesFixture;
});
