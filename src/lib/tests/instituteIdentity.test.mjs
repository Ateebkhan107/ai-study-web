import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const instituteA = { id: "institute-a", slug: "academy-a", owner_user_id: "owner", status: "ACTIVE" };
const instituteB = { id: "institute-b", slug: "academy-b", owner_user_id: "another-owner", status: "ACTIVE" };
const enrollment = (fields = {}) => ({
  id: "membership", institute_id: instituteA.id, user_id: "student",
  email: "student@example.invalid", role: "STUDENT", status: "ACTIVE", ...fields,
});

let identity, profile, memberships, institutes, calls;
function query(table) {
  let operation = "read";
  let payload;
  let conflict;
  const filters = {};
  function execute(single) {
    calls.push({ table, operation, filters: { ...filters }, payload });
    const rows = table === "institutes" ? institutes : memberships;
    if (operation === "insert") {
      const row = { id: `created-${rows.length}`, ...payload };
      rows.push(row);
      return { data: row, error: null };
    }
    if (operation === "upsert") {
      assert.equal(conflict?.ignoreDuplicates, true);
      assert.equal(conflict?.onConflict, "institute_id,email");
      if (memberships.some((row) => row.institute_id === payload.institute_id && row.email === payload.email)) {
        return { data: null, error: null };
      }
      const row = enrollment({ ...payload, id: "staged" });
      memberships.push(row);
      return { data: row, error: null };
    }
    assert.equal(operation, "read");
    const matching = rows.filter((row) => Object.entries(filters).every(([key, value]) => key === "emailPattern"
      ? row.email?.toLowerCase() === value.replaceAll("\\_", "_")
      : row[key] === value))
      .map((row) => table === "institute_members"
        ? { ...row, institutes: institutes.find(({ id }) => id === row.institute_id) }
        : row);
    return { data: single ? matching[0] ?? null : matching, count: matching.length, error: null };
  }
  return {
    select() { return this; },
    eq(key, value) { filters[key] = value; return this; },
    ilike(key, value) { assert.equal(key, "email"); filters.emailPattern = value; return this; },
    insert(value) { operation = "insert"; payload = value; return this; },
    upsert(value, options) { operation = "upsert"; payload = value; conflict = options; return this; },
    maybeSingle: async () => execute(true),
    single: async () => execute(true),
    then(resolve, reject) { return Promise.resolve(execute(false)).then(resolve, reject); },
  };
}

globalThis.__prepziiIdentityTest = {
  auth: () => ({ userId: identity }),
  profile: () => profile,
  admin: { from: query },
};
const aliasRoot = new URL("../../", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, next) {
    const mocks = {
      "@clerk/nextjs/server": 'export const auth = async () => globalThis.__prepziiIdentityTest.auth(); export const currentUser = async () => globalThis.__prepziiIdentityTest.profile(); export const clerkClient = () => { throw new Error("Unexpected Clerk account lookup"); };',
      "next/server": "export const NextResponse = Response;",
      "@/lib/supabaseAdmin": "export const supabaseAdmin = globalThis.__prepziiIdentityTest.admin;",
      "@/lib/auth": 'export const ACCOUNT_TYPES = { STUDENT: "STUDENT", INSTITUTE_ADMIN: "INSTITUTE_ADMIN" };',
    };
    if (mocks[specifier]) return { url: `data:text/javascript,${encodeURIComponent(mocks[specifier])}`, shortCircuit: true };
    if (specifier.startsWith("@/lib/")) return next(new URL(`${specifier.slice(2)}.js`, aliasRoot).href, context);
    return next(specifier, context);
  },
});
const { getInstituteContext } = await import("../instituteAuth.js");
const { getActiveInstituteMemberships } = await import("../accessControl.js");
const { GET: list, POST: create } = await import("../../app/api/institutes/route.js");
const { POST: addStudent } = await import("../../app/api/institutes/[slug]/students/route.js");

function setEmail(address, status = "verified") {
  profile = { primaryEmailAddress: { emailAddress: address, verification: { status } } };
}
const jsonRequest = (body) => new Request("https://prepzii.invalid/api/institutes", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const params = { params: Promise.resolve({ slug: instituteA.slug }) };

test.beforeEach(() => {
  identity = "student";
  setEmail("student@example.invalid");
  memberships = [];
  institutes = [{ ...instituteA }, { ...instituteB }];
  calls = [];
});
test.after(() => { hooks.deregister(); delete globalThis.__prepziiIdentityTest; });

async function assertDenied(slug = instituteA.slug) {
  assert.equal((await getInstituteContext(slug)).error?.status, 403);
  assert.deepEqual(await getActiveInstituteMemberships(identity, profile?.primaryEmailAddress?.emailAddress), []);
  assert.deepEqual((await (await list()).json()).institutes, []);
  assert.ok(calls.every(({ operation }) => operation === "read"));
  assert.ok(calls.filter(({ table }) => table === "institute_members")
    .every(({ filters }) => filters.user_id === identity && !Object.hasOwn(filters, "email")));
}

test("canonical owners retain current, consumer legacy, and membership-less access", async () => {
  identity = "owner";
  for (const rows of [[], [enrollment({ user_id: identity, role: "COACHING_ADMIN" })], [enrollment({ user_id: identity, role: "OWNER" })]]) {
    memberships = rows;
    const access = await getInstituteContext(instituteA.slug);
    assert.equal(access.role, "COACHING_ADMIN");
    assert.equal(access.member?.id ?? null, rows[0]?.id ?? null);
    assert.equal((await (await list()).json()).institutes[0].role, "COACHING_ADMIN");
  }
  assert.ok(calls.every(({ operation }) => operation === "read"));
});

test("canonical ownership cannot override suspended, inactive, removed, or pending memberships", async () => {
  identity = "owner";
  for (const role of ["OWNER", "COACHING_ADMIN"]) {
    for (const status of ["SUSPENDED", "INACTIVE", "REMOVED", "PENDING"]) {
      memberships = [enrollment({ user_id: identity, role, status })];
      await assertDenied();
    }
  }
  memberships = [
    enrollment({ user_id: identity, role: "OWNER", status: "SUSPENDED" }),
    enrollment({ user_id: identity, role: "COACHING_ADMIN" }),
  ];
  await assertDenied();
});

for (const scenario of [
  { name: "pending student with a verified matching email", userId: null, status: "PENDING", email: "student@example.invalid" },
  { name: "mismatched invitation recipient", userId: null, status: "PENDING", email: "other@example.invalid" },
  { name: "unverified matching email", userId: null, status: "PENDING", email: "student@example.invalid", verified: "unverified" },
  { name: "matching email already bound to another Clerk ID", userId: "different-user", status: "ACTIVE", email: "student@example.invalid" },
  { name: "expired invitation with an unbound pending row", userId: null, status: "PENDING", email: "student@example.invalid" },
  { name: "revoked invitation with an unbound pending row", userId: null, status: "PENDING", email: "student@example.invalid" },
]) {
  test(`consumer reads cannot grant access for ${scenario.name}`, async () => {
    memberships = [enrollment({ user_id: scenario.userId, status: scenario.status })];
    setEmail(scenario.email, scenario.verified);
    await assertDenied();
  });
}

test("valid membership stays bound to the Clerk ID across repeated login and email changes", async () => {
  memberships = [enrollment()];
  setEmail("changed@example.invalid", "unverified");
  for (let attempt = 0; attempt < 2; attempt++) {
    assert.equal((await getInstituteContext(instituteA.slug)).member.id, "membership");
    assert.equal((await getActiveInstituteMemberships(identity))[0].role, "STUDENT");
  }
  assert.ok(calls.every(({ operation }) => operation === "read"));
});

test("unauthenticated requests never query the service-role client", async () => {
  identity = null;
  assert.equal((await getInstituteContext(instituteA.slug)).error.status, 401);
  assert.equal((await list()).status, 401);
  assert.deepEqual(await getActiveInstituteMemberships(identity), []);
  assert.deepEqual(calls, []);
});

test("another institute's active membership cannot authorize a selected slug or a service-role write", async () => {
  memberships = [enrollment({ institute_id: instituteB.id, role: "COACHING_ADMIN" })];
  assert.equal((await getInstituteContext(instituteA.slug)).error.status, 403);
  assert.equal((await addStudent(jsonRequest({ email: "other@example.invalid" }), params)).status, 403);
  assert.deepEqual((await (await list()).json()).institutes.map(({ id }) => id), [instituteB.id]);
  assert.ok(calls.every(({ operation }) => operation === "read"));
});

test("student onboarding stages one unbound record on repeated adds", async () => {
  identity = "owner";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await addStudent(jsonRequest({ email: "Student@example.invalid" }), params);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).member.status, "PENDING");
  }
  assert.equal(memberships.length, 1);
  assert.equal(memberships[0].user_id, null);
  assert.equal(memberships[0].email, "student@example.invalid");
});

test("student onboarding cannot replace an active identity or reactivate a removed member", async () => {
  identity = "owner";
  const existing = enrollment({ user_id: "different-user", email: "Legacy_Student@example.invalid" });
  memberships = [existing];
  const request = () => jsonRequest({ email: existing.email.toLowerCase() });
  assert.equal((await addStudent(request(), params)).status, 200);
  assert.equal(memberships.length, 1);
  assert.equal(memberships[0].user_id, "different-user");
  existing.status = "REMOVED";
  assert.equal((await addStudent(request(), params)).status, 409);
  assert.equal(memberships[0].status, "REMOVED");
});

test("new institute provisioning keeps the signed-in creator's owner membership", async () => {
  identity = "new-owner";
  setEmail("owner@example.invalid");
  const response = await create(jsonRequest({ name: "Fresh Academy" }));
  assert.equal(response.status, 201);
  const { institute } = await response.json();
  assert.equal(institute.owner_user_id, identity);
  assert.equal((await getInstituteContext(institute.slug)).role, "COACHING_ADMIN");
  assert.equal(memberships.length, 1);
  assert.equal(memberships[0].user_id, identity);
});
