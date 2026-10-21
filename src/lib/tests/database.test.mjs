import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

// Explicit opt-in, hard-coded LOCAL Unix socket/fixture database; never reads
// Supabase URLs, passwords or production connection strings.
const fixtureDatabase = process.env.ZI_PHASE5_FIXTURE_DB || "zi_phase5_remediation_fixture";
if (!/^zi_phase5_remediation_fixture(?:_[0-9]+)?$/.test(fixtureDatabase)) throw new Error("Not a remediation fixture database");
const enabled = process.env.ZI_PHASE5_LOCAL_DB === "1";
function sql(statement) {
  return new Promise((resolve, reject) => {
    const child = spawn("psql", ["-X", "-h", "/tmp", "-p", "55435", "-d", fixtureDatabase, "-v", "ON_ERROR_STOP=1", "-Atq"], { env: { PATH: process.env.PATH, USER: process.env.USER } });
    let out = "", err = "";
    child.stdout.on("data", (chunk) => { out += chunk; }); child.stderr.on("data", (chunk) => { err += chunk; });
    child.on("error", reject); child.on("close", (code) => code ? reject(new Error(err)) : resolve(out.trim())); child.stdin.end(statement);
  });
}
const quote = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
const config = { exam: "JEE Main", subject: "Physics", chapter: "Rotational Motion", difficulty: "Medium", questionCount: 5 };
const questions = Array.from({ length: 5 }, (_, i) => ({ statement: `LOCAL FIXTURE ${i}: a deliberately synthetic question for database integrity checks only.`, exam: "JEE Main", subject: "Physics", topic: i < 3 ? "Torque" : "Rolling", chapter: "Rotational Motion", options: ["Fixture A", "Fixture B", "Fixture C", "Fixture D"], correctAnswer: 0, explanation: ["Local fixture step one.", "Local fixture step two."], questionType: "MCQ", sourceType: "AI_GENERATED", validation: { status: "passed_implemented_checks", validationVersion: "zi-questions-v1.1" } }));
const store = (key, mode = "timed", duration = "5", qs = questions) => `set role service_role; select zi_store_generated_test('owner','${key}',${quote(config)},'${mode}',${duration},'zi-questions-v1.1',${quote(qs)});`;

test("Phase 5 migration on isolated local PostgreSQL", { skip: !enabled }, async (t) => {
  await sql(readFileSync(new URL("./fixtures/baseline.sql", import.meta.url), "utf8"));
  await sql("do $$ begin if not exists(select from pg_roles where rolname='zi_fixture_acl_parent') then create role zi_fixture_acl_parent; end if; end $$; grant zi_fixture_acl_parent to authenticated,service_role; alter default privileges in schema public grant all on tables to anon,authenticated,service_role,zi_fixture_acl_parent; alter default privileges in schema public grant execute on functions to service_role,authenticated,zi_fixture_acl_parent;");
  await sql(readFileSync(new URL("../../../db/migrations/20261016_zi_generated_tests.sql", import.meta.url), "utf8"));
  let testId, sessionId, ids;
  await t.test("migration installs RLS, foreign keys, and restrictive privileges", async () => {
    assert.equal(await sql("select count(*) from pg_class where relname in ('zi_generated_tests','zi_generated_questions','zi_generated_sessions') and relrowsecurity;"), "3");
    assert.equal(await sql("select has_table_privilege('anon','zi_generated_questions','SELECT');"), "f");
    assert.equal(await sql("select has_function_privilege('authenticated','zi_start_generated_test(text,uuid)','EXECUTE');"), "f");
    await assert.rejects(sql("set role authenticated; select content from zi_generated_questions;"), /permission denied/);
    assert.equal(await sql("select count(*) from pg_constraint where contype='f' and conrelid in ('zi_generated_questions'::regclass,'zi_generated_sessions'::regclass);"), "3");
  });
  await t.test("default ACLs are stripped and only intended effective grants remain", async () => {
    assert.equal(await sql("select has_table_privilege('service_role','zi_generated_questions','INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER');"), "f");
    for (const role of ["anon", "authenticated", "service_role", "zi_fixture_acl_parent"]) {
      assert.equal(await sql(`select has_function_privilege('${role}','zi_validate_generated_answers(uuid,jsonb)','EXECUTE');`), "f");
    }
    assert.equal(await sql("select has_table_privilege('zi_fixture_acl_parent','zi_generated_questions','SELECT,INSERT,UPDATE,DELETE');"), "f");
    assert.equal(await sql("select count(*) from pg_proc where proname like 'zi_%' and prosecdef and proowner=current_user::regrole::oid and proconfig=array['search_path=pg_catalog, pg_temp'];"), "6");
    await assert.rejects(sql("set role service_role; select zi_validate_generated_answers(gen_random_uuid(),'{}');"), /permission denied/);
  });
  await t.test("effective ACL verification catches privileges inherited from another role", async () => {
    const migration = readFileSync(new URL("../../../db/migrations/20261016_zi_generated_tests.sql", import.meta.url), "utf8");
    const verify = migration.slice(migration.indexOf("do $verify_acl$"), migration.indexOf("end $verify_acl$;") + "end $verify_acl$;".length);
    await assert.rejects(sql(`begin; grant select on zi_generated_questions to zi_fixture_acl_parent; ${verify} commit;`), /Unexpected effective table privileges/);
    await assert.rejects(sql(`begin; grant execute on function zi_validate_generated_answers(uuid,jsonb) to zi_fixture_acl_parent; ${verify} commit;`), /Unexpected effective function privileges/);
  });
  await t.test("PostgreSQL 17 MAINTAIN grants cannot bypass the private-table postcondition", async () => {
    const migration = readFileSync(new URL("../../../db/migrations/20261016_zi_generated_tests.sql", import.meta.url), "utf8");
    const verify = migration.slice(migration.indexOf("do $verify_acl$"), migration.indexOf("end $verify_acl$;") + "end $verify_acl$;".length);
    const version = Number(await sql("select current_setting('server_version_num');"));
    if (version >= 170000) {
      assert.equal(await sql("select has_table_privilege('anon','zi_generated_questions','MAINTAIN');"), "f");
      assert.equal(await sql("select has_table_privilege('service_role','zi_generated_questions','MAINTAIN');"), "f");
      await assert.rejects(sql(`begin; grant maintain on zi_generated_questions to zi_fixture_acl_parent; ${verify} commit;`), /Unexpected effective table privileges/);
    }
  });
  await t.test("column-only inherited grants are detected even without table-level SELECT or UPDATE", async () => {
    const migration = readFileSync(new URL("../../../db/migrations/20261016_zi_generated_tests.sql", import.meta.url), "utf8");
    const verify = migration.slice(migration.indexOf("do $verify_acl$"), migration.indexOf("end $verify_acl$;") + "end $verify_acl$;".length);
    for (const privilege of ["select", "update"]) {
      await assert.rejects(sql(`begin; grant ${privilege}(content) on zi_generated_questions to zi_fixture_acl_parent; ${verify} commit;`), /Unexpected effective table privileges/);
    }
  });
  await t.test("private ACL reset removes explicit column grants and restores intended server grants", async () => {
    const migration = readFileSync(new URL("../../../db/migrations/20261016_zi_generated_tests.sql", import.meta.url), "utf8");
    const resetAndVerify = migration.slice(migration.indexOf("do $reset_acl$"));
    await sql(`begin; grant select(content),update(content) on zi_generated_questions to zi_fixture_acl_parent; ${resetAndVerify}`);
    assert.equal(await sql("select has_any_column_privilege('authenticated','zi_generated_questions','SELECT,INSERT,UPDATE,REFERENCES');"), "f");
    assert.equal(await sql("select has_any_column_privilege('service_role','zi_generated_questions','INSERT,UPDATE,REFERENCES');"), "f");
    assert.equal(await sql("select has_table_privilege('service_role','zi_generated_questions','SELECT');"), "t");
    assert.equal(await sql("select has_function_privilege('service_role','zi_start_generated_test(text,uuid)','EXECUTE');"), "t");
  });
  await t.test("application membership in the proposed owner is rejected before DDL", async () => {
    const migration = readFileSync(new URL("../../../db/migrations/20261016_zi_generated_tests.sql", import.meta.url), "utf8");
    const guard = migration.slice(migration.indexOf("do $owner_guard$"), migration.indexOf("end $owner_guard$;") + "end $owner_guard$;".length);
    // Role membership changes are local and rolled back by the failed transaction.
    await assert.rejects(sql(`begin; do $$ begin execute format('grant %I to authenticated',current_user); end $$; ${guard} commit;`), /Unsafe migration owner/);
    await assert.rejects(sql(`begin; grant service_role to anon; ${guard} commit;`), /Unsafe browser role/);
  });
  await t.test("storage is atomic, ordered and idempotent without shared-bank writes", async () => {
    const saved = await Promise.all(Array.from({ length: 5 }, () => sql(store("creation-fixture-key-1"))));
    assert.equal(new Set(saved).size, 1); testId = saved[0];
    ids = (await sql(`select id from zi_generated_questions where test_id='${testId}' order by question_order;`)).split("\n");
    assert.equal(ids.length, 5); assert.equal(await sql("select count(*) from questions;"), "0");
    assert.equal(await sql("select count(*) from test_questions;"), "0");
  });
  await t.test("invalid later question rolls back the entire test", async () => {
    const bad = structuredClone(questions); bad[4].validation.status = "rejected";
    await assert.rejects(sql(store("invalid-storage-fixture", "timed", "5", bad)), /Unvalidated question/);
    assert.equal(await sql("select count(*) from zi_generated_tests;"), "1");
  });
  await t.test("constraints reject missing keys, invalid options, ordering, and timing", async () => {
    await assert.rejects(sql(store("missing-duration-fixture", "timed", "null")), /check constraint/);
    const bad = structuredClone(questions); bad[0].correctAnswer = null;
    await assert.rejects(sql(store("missing-key-fixture", "timed", "5", bad)), /check constraint/);
    const badOptions = structuredClone(questions); badOptions[0].options.pop();
    await assert.rejects(sql(store("missing-option-fixture", "timed", "5", badOptions)), /check constraint/);
    await assert.rejects(sql(`insert into zi_generated_questions(test_id,question_order,content,validation) select test_id,question_order,content,validation from zi_generated_questions limit 1;`), /unique constraint/);
    await assert.rejects(sql(`insert into zi_generated_sessions(session_id,test_id,owner_id,started_at) values(gen_random_uuid(),'${testId}','intruder',now());`), /foreign key constraint/);
  });
  await t.test("ownership prevents starting another student's test", async () => {
    await assert.rejects(sql(`set role service_role; select zi_start_generated_test('intruder','${testId}');`), /Not found/);
  });
  await t.test("concurrent duplicate Start clicks create exactly one resumable session", async () => {
    const starts = await Promise.all(Array.from({ length: 8 }, () => sql(`set role service_role; select zi_start_generated_test('owner','${testId}')->>'session_id';`)));
    assert.equal(new Set(starts).size, 1); sessionId = starts[0];
    assert.equal(await sql("select count(*) from test_sessions;"), "1");
    assert.equal(await sql(`select result is null and deadline_at is not null from zi_generated_sessions where session_id='${sessionId}';`), "t");
  });
  await t.test("SQL NULL and non-object submitted results cannot bypass CHECK", async () => {
    for (const result of ["NULL", "'null'::jsonb", "'[]'::jsonb", "'1'::jsonb"]) {
      await assert.rejects(sql(`update zi_generated_sessions set submitted_at=now(),result=${result} where session_id='${sessionId}';`), /zi_generated_sessions_submission_state_check/);
    }
    await assert.rejects(sql(`update zi_generated_sessions set result='{}' where session_id='${sessionId}';`), /zi_generated_sessions_submission_state_check/);
    assert.equal(await sql(`select submitted_at is null and result is null from zi_generated_sessions where session_id='${sessionId}';`), "t");
  });
  const snapshot = () => ({ [ids[0]]: 0, [ids[1]]: 1, [ids[2]]: null });
  await t.test("saves answer A and null distinctly and resume preserves timing/answers", async () => {
    const saved = JSON.parse(await sql(`select zi_save_generated_answers('owner','${sessionId}',0,${quote(snapshot())});`));
    assert.equal(saved.revision, 1);
    const resumed = JSON.parse(await sql(`select zi_start_generated_test('owner','${testId}');`));
    assert.deepEqual(resumed.answers, snapshot()); assert.equal(resumed.revision, 1);
  });
  await t.test("stale writes, foreign IDs, booleans and other owners are rejected", async () => {
    await assert.rejects(sql(`select zi_save_generated_answers('owner','${sessionId}',0,'{}');`), /Stale revision/);
    for (const bad of [{ "00000000-0000-4000-8000-000000000000": 0 }, { [ids[0]]: false }, { [ids[0]]: "0" }, { [ids[0]]: 4 }]) await assert.rejects(sql(`select zi_save_generated_answers('owner','${sessionId}',1,${quote(bad)});`), /Invalid answers/);
    await assert.rejects(sql(`select zi_submit_generated_test('intruder','${sessionId}',1,'{}');`), /Not found/);
  });
  await t.test("concurrent submissions produce one result, accurate negatives and unanswered counts", async () => {
    const submissions = await Promise.all(Array.from({ length: 8 }, () => sql(`select zi_submit_generated_test('owner','${sessionId}',1,${quote(snapshot())});`)));
    assert.equal(submissions.map(JSON.parse).filter((r) => r.created).length, 1);
    const result = JSON.parse(await sql(`select result from zi_generated_sessions where session_id='${sessionId}';`));
    assert.equal(result.score, 3); assert.equal(result.total_marks, 20); assert.equal(result.unanswered, 3);
    assert.equal(result.correct_answers, 1); assert.equal(result.wrong_answers, 1); assert.equal(result.accuracy, 50);
    assert.deepEqual(result.topic_performance.Torque, { total: 3, correct: 1, incorrect: 1, unanswered: 1 });
    assert.equal(await sql("select count(*) from test_attempts;"), "0"); assert.equal(await sql("select count(*) from user_answers;"), "0");
  });
  await t.test("timed expiry ignores late final snapshots and late autosaves", async () => {
    const tid = await sql(store("expiry-fixture-creation"));
    const sid = await sql(`select zi_start_generated_test('owner','${tid}')->>'session_id';`);
    const qid = await sql(`select id from zi_generated_questions where test_id='${tid}' order by question_order limit 1;`);
    await sql(`select zi_save_generated_answers('owner','${sid}',0,${quote({ [qid]: 1 })}); update zi_generated_sessions set started_at=now()-interval '310 seconds',deadline_at=now()-interval '10 seconds' where session_id='${sid}';`);
    const late = JSON.parse(await sql(`select zi_save_generated_answers('owner','${sid}',1,${quote({ [qid]: 0 })});`));
    assert.equal(late.expired, true);
    await sql(`select zi_submit_generated_test('owner','${sid}',1,${quote({ [qid]: 0 })});`);
    const r = JSON.parse(await sql(`select result from zi_generated_sessions where session_id='${sid}';`));
    assert.equal(r.score, -1); assert.equal(r.correct_answers, 0); assert.equal(r.time_taken_seconds, 300);
  });
  await t.test("untimed practice has no deadline and uses server elapsed time", async () => {
    const tid = await sql(store("practice-fixture-creation", "practice", "null"));
    const s = JSON.parse(await sql(`select zi_start_generated_test('owner','${tid}');`));
    assert.equal(s.deadline_at, null);
    await sql(`update zi_generated_sessions set started_at=now()-interval '121 seconds' where session_id='${s.session_id}'; select zi_submit_generated_test('owner','${s.session_id}',0,'{}');`);
    const result = JSON.parse(await sql(`select result from zi_generated_sessions where session_id='${s.session_id}';`));
    assert.equal(result.time_taken_seconds, 121); assert.equal(result.score, 0); assert.equal(result.unanswered, 5);
  });
  await t.test("normal-test atomic commit is idempotent and does not create duplicate reward eligibility", async () => {
    const qid = await sql("insert into questions default values returning id;");
    const sid = await sql("insert into test_sessions(user_id,exam,duration_minutes) values('owner','JEE Main',30) returning id;");
    const summary = { score: 0, total_marks: 4, correct_answers: 0, wrong_answers: 0, attempted: 0, total_questions: 1 };
    const a = [{ question_id: qid, selected_option: null, correct_option: "A", is_correct: false }];
    const results = await Promise.all(Array.from({ length: 6 }, () => sql(`select zi_commit_bank_submission('owner','${sid}',${quote(summary)},${quote(a)});`)));
    assert.equal(results.map(JSON.parse).filter((r) => r.created).length, 1);
    assert.equal(await sql("select count(*) from test_attempts;"), "1"); assert.equal(await sql("select count(*) from user_answers where selected_option is null and not is_correct;"), "1");
  });
  await t.test("shared-session owner mismatch aborts private submission atomically", async () => {
    const tid = await sql(store("owner-mismatch-fixture", "practice", "null"));
    const sid = await sql(`select zi_start_generated_test('owner','${tid}')->>'session_id';`);
    await sql(`update test_sessions set user_id='other-owner' where id='${sid}';`);
    await assert.rejects(sql(`select zi_submit_generated_test('owner','${sid}',0,'{}');`), /Session ownership mismatch/);
    assert.equal(await sql(`select submitted_at is null and result is null from zi_generated_sessions where session_id='${sid}';`), "t");
    assert.equal(await sql(`select user_id||':'||status from test_sessions where id='${sid}';`), "other-owner:in_progress");
  });
  await t.test("normal RPC rejects historical duplicates without selecting or changing either row", async () => {
    const qid = await sql("insert into questions default values returning id;");
    const sid = await sql("insert into test_sessions(user_id,exam,duration_minutes) values('owner','JEE Main',30) returning id;");
    await sql(`insert into test_attempts(user_id,session_id,total_questions,duration_minutes) values('owner','${sid}',1,30),('owner','${sid}',1,30);`);
    const summary = { total_questions: 1 };
    await assert.rejects(sql(`select zi_commit_bank_submission('owner','${sid}',${quote(summary)},${quote([{ question_id: qid }])});`), /Conflicting saved submissions/);
    assert.equal(await sql(`select count(*) from test_attempts where session_id='${sid}';`), "2");
  });
  await t.test("normal RPC refuses an incomplete historical attempt rather than acknowledging success", async () => {
    const qid = await sql("insert into questions default values returning id;");
    const sid = await sql("insert into test_sessions(user_id,exam,duration_minutes) values('owner','JEE Main',30) returning id;");
    await sql(`insert into test_attempts(user_id,session_id,total_questions,duration_minutes) values('owner','${sid}',1,30);`);
    await assert.rejects(sql(`select zi_commit_bank_submission('owner','${sid}','{"total_questions":1}',${quote([{ question_id: qid }])});`), /Incomplete saved submission/);
    assert.equal(await sql(`select count(*) from test_attempts where session_id='${sid}';`), "1");
    assert.equal(await sql(`select count(*) from user_answers where attempt_id in (select id from test_attempts where session_id='${sid}');`), "0");
  });
  await t.test("normal RPC rejects a prior attempt belonging to a different owner", async () => {
    const qid = await sql("insert into questions default values returning id;");
    const sid = await sql("insert into test_sessions(user_id,exam,duration_minutes) values('owner','JEE Main',30) returning id;");
    await sql(`insert into test_attempts(user_id,session_id,total_questions,duration_minutes) values('other-owner','${sid}',1,30);`);
    await assert.rejects(sql(`select zi_commit_bank_submission('owner','${sid}','{"total_questions":1}',${quote([{ question_id: qid }])});`), /Session ownership mismatch/);
    assert.equal(await sql(`select user_id from test_attempts where session_id='${sid}';`), "other-owner");
  });
  await t.test("rollback is reviewed statically only and retains shared sessions", () => {
    const rollback = readFileSync(new URL("../../../db/rollbacks/20261016_zi_generated_tests.sql", import.meta.url), "utf8");
    assert.doesNotMatch(rollback.replace(/--[^\n]*/g, ""), /delete\s+from|truncate|drop\s+table\s+(?:public\.)?test_sessions/i);
    assert.match(rollback, /permanently destroys/i);
  });
});
