import test from "node:test";
import assert from "node:assert/strict";
import { sql, read, foundationOnce, snapshot } from "./pg176Lab.mjs";
const enabled = process.env.ZI_PHASE5_SECURITY17_LOCAL === "1";
const tableCorrection = read("../../../db/proposals/20261022_browser_table_maintenance_privileges.sql");
const defaultsCorrection = read("../../../db/proposals/20261022_public_browser_maintenance_defaults.sql");
const tables = ["test_sessions", "test_attempts", "test_questions", "user_answers", "institute_test_attempts", "questions",
  "badges", "daily_goals", "institute_test_questions", "institute_tests", "pyq_attempts", "pyq_questions",
  "user_badges", "user_daily_goals", "user_profiles", "user_xp"];
const tableNames = tables.map((name) => `'${name}'`).join(",");
const preservedAcl = `SELECT jsonb_agg(jsonb_build_array(c.relname,a.grantee,a.grantor,a.privilege_type,a.is_grantable)
  ORDER BY c.relname,a.grantee,a.grantor,a.privilege_type) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  CROSS JOIN LATERAL aclexplode(c.relacl) a WHERE n.nspname='public' AND c.relname IN (${tableNames})
  AND a.privilege_type NOT IN ('TRUNCATE','MAINTAIN');`;
const withoutTransaction = (source) => source.replace(/^begin;$/im, "").replace(/^commit;$/im, "");
const literalJson = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;

test("prepared PostgreSQL 17.6 local security smoke rehearsal", { skip: !enabled }, async (t) => {
  await foundationOnce(process.env.ZI_PHASE5_REUSE_FOUNDATION === "1");
  await t.test("direct synthetic invoker writes respect actual default-deny shape", async () => {
    for (const role of ["anon", "authenticated"]) {
      assert.equal(await sql("SELECT zi_fixture_increment_control('synthetic-B',10);", role), "0");
    }
    assert.equal(await sql("SELECT xp FROM user_xp WHERE user_id='synthetic-B';", "postgres"), "0");
    assert.equal(await sql("SELECT zi_fixture_increment_control('synthetic-B',10);", "service_role"), "1");
  });
  await t.test("16-table correction preserves other ACLs, row denial and server writes", async () => {
    const before = await sql(preservedAcl);
    await sql(tableCorrection, "postgres");
    assert.equal(await sql(preservedAcl), before);
    for (const role of ["anon", "authenticated"]) {
      assert.equal(await sql(`SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relname IN (${tableNames}) AND has_table_privilege('${role}',c.oid,'TRUNCATE,MAINTAIN');`), "0");
      assert.equal(await sql("SELECT count(*) FROM user_xp;", role), "0");
      await assert.rejects(sql("INSERT INTO user_xp(user_id,xp) VALUES('synthetic-intruder',99);", role), /row-level security/);
    }
    assert.equal(await sql(`SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN (${tableNames}) AND has_table_privilege('service_role',c.oid,'MAINTAIN');`), "16");
  });
  await t.test("surviving inherited maintenance causes correction rollback", async () => {
    await assert.rejects(sql(`BEGIN; CREATE ROLE zi_fixture_acl_parent;
      GRANT zi_fixture_acl_parent TO authenticated;
      GRANT MAINTAIN ON public.user_xp TO zi_fixture_acl_parent;
      SET LOCAL ROLE postgres; ${withoutTransaction(tableCorrection)} COMMIT;`), /Unsafe remaining/);
    assert.equal(await sql("SELECT count(*) FROM pg_roles WHERE rolname='zi_fixture_acl_parent';"), "0");
  });
  await t.test("operator authority and global drift fail closed for default correction", async () => {
    await assert.rejects(sql(defaultsCorrection, "postgres"), /authority/);
    await assert.rejects(sql(`BEGIN; ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT MAINTAIN ON TABLES TO anon;
      ${withoutTransaction(defaultsCorrection)} COMMIT;`), /Global table-default drift/);
  });
  await t.test("both actual creator defaults keep row/server rights but remove browser maintenance", async () => {
    await sql(defaultsCorrection);
    for (const creator of ["postgres", "supabase_admin"]) {
      const table = `zi_fixture_defaults_${creator}`;
      await sql(`CREATE TABLE public.${table}(id integer);`, creator);
      for (const browser of ["anon", "authenticated"]) {
        assert.equal(await sql(`SELECT has_table_privilege('${browser}','public.${table}','TRUNCATE,MAINTAIN');`), "f");
        assert.equal(await sql(`SELECT has_table_privilege('${browser}','public.${table}','SELECT');`), "t");
      }
      assert.equal(await sql(`SELECT has_table_privilege('service_role','public.${table}','MAINTAIN');`), "t");
    }
  });
  await t.test("revision-4 migration installs only intended private application privileges", async () => {
    await sql(read("../../../db/migrations/20261016_zi_generated_tests.sql"), "postgres");
    assert.equal(await sql("SELECT count(*) FROM pg_class WHERE relname IN ('zi_generated_tests','zi_generated_questions','zi_generated_sessions') AND relrowsecurity;"), "3");
    assert.equal(await sql("SELECT has_any_column_privilege('anon','zi_generated_questions','SELECT,INSERT,UPDATE,REFERENCES');"), "f");
    assert.equal(await sql("SELECT has_table_privilege('service_role','zi_generated_questions','INSERT,UPDATE,DELETE,TRUNCATE,MAINTAIN');"), "f");
  });
  await t.test("normal/institute commit is atomic across connections and preserves historic conflicts", async () => {
    const q = "00000000-0000-4000-8000-000000000001";
    const sid = "00000000-0000-4000-8000-000000000002";
    const iid = "00000000-0000-4000-8000-000000000003";
    const tid = "00000000-0000-4000-8000-000000000004";
    await sql(`INSERT INTO questions(id,exam,subject,chapter,difficulty,question_text,correct_option)
      VALUES('${q}','JEE Main','Physics','Synthetic','Medium','SYNTHETIC LOCAL QUESTION','A');
      INSERT INTO test_sessions(id,user_id,exam,total_questions,duration_minutes) VALUES('${sid}','synthetic-A','JEE Main',1,5);
      INSERT INTO test_questions(session_id,question_id,question_order) VALUES('${sid}','${q}',1);
      INSERT INTO institutes(id,name) VALUES('${iid}','SYNTHETIC COACHING');
      INSERT INTO institute_tests(id,institute_id,title,status) VALUES('${tid}','${iid}','SYNTHETIC TEST','PUBLISHED');
      INSERT INTO institute_test_attempts(institute_id,institute_test_id,user_id,session_id)
        VALUES('${iid}','${tid}','synthetic-A','${sid}');`, "service_role");
    const commit = `SELECT zi_commit_bank_submission('synthetic-A','${sid}',
      '{"score":4,"total_marks":4,"correct_answers":1,"wrong_answers":0,"attempted":1,"total_questions":1}',
      '[{"question_id":"${q}","selected_option":"A","correct_option":"A","is_correct":true}]')->>'attemptId';`;
    const receipts = await Promise.all(Array.from({ length: 8 }, () => sql(commit, "service_role")));
    assert.equal(new Set(receipts).size, 1);
    assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${sid}';`, "postgres"), "1");
    assert.equal(await sql(`SELECT count(*) FROM institute_test_attempts WHERE session_id='${sid}' AND status='SUBMITTED' AND attempt_id='${receipts[0]}';`, "postgres"), "1");
    // Explicit demonstration: the current service-role direct writer still bypasses
    // the cooperating protocol. This is an activation failure, not a safety pass.
    await sql(`INSERT INTO test_attempts(user_id,session_id,total_questions,duration_minutes) VALUES('synthetic-A','${sid}',1,5);`, "service_role");
    await assert.rejects(sql(commit, "service_role"), /Conflicting saved submissions/);
    assert.equal(await sql(`SELECT count(*) FROM test_attempts WHERE session_id='${sid}';`, "postgres"), "2");
  });
  await t.test("synthetic generated lifecycle remains private and outside XP accounting", async () => {
    const before = await sql("SELECT jsonb_build_array((SELECT count(*) FROM test_attempts),(SELECT count(*) FROM user_answers),(SELECT sum(xp) FROM user_xp));", "postgres");
    const config = { exam: "JEE Main", subject: "Physics", chapter: "Synthetic", difficulty: "Medium", questionCount: 5 };
    const questions = Array.from({ length: 5 }, (_, i) => ({
      statement: `SYNTHETIC DATABASE FIXTURE ${i}: placeholder question for storage and access tests only.`,
      exam: "JEE Main", subject: "Physics", chapter: "Synthetic", topic: "Synthetic topic",
      questionType: "MCQ", sourceType: "AI_GENERATED", options: ["A", "B", "C", "D"], correctAnswer: 0,
      explanation: ["Synthetic first step.", "Synthetic second step."],
      validation: { status: "passed_implemented_checks", validationVersion: "zi-questions-v1.1" },
    }));
    const tid = await sql(`SELECT zi_store_generated_test('synthetic-A','synthetic-generated-key-001',${literalJson(config)},'practice',NULL,'zi-questions-v1.1',${literalJson(questions)});`, "service_role");
    await assert.rejects(sql(`SELECT zi_start_generated_test('synthetic-B','${tid}');`, "service_role"), /Not found/);
    const starts = await Promise.all(Array.from({ length: 4 }, () => sql(`SELECT zi_start_generated_test('synthetic-A','${tid}')->>'session_id';`, "service_role")));
    assert.equal(new Set(starts).size, 1);
    const ids = JSON.parse(await sql(`SELECT jsonb_agg(id ORDER BY question_order) FROM zi_generated_questions WHERE test_id='${tid}';`, "postgres"));
    const answers = literalJson({ [ids[0]]: 0, [ids[1]]: null });
    await sql(`SELECT zi_save_generated_answers('synthetic-A','${starts[0]}',0,${answers});`, "service_role");
    const submits = await Promise.all(Array.from({ length: 4 }, () => sql(`SELECT zi_submit_generated_test('synthetic-A','${starts[0]}',1,${answers})->>'attemptId';`, "service_role")));
    assert.equal(new Set(submits).size, 1);
    assert.equal(await sql("SELECT jsonb_build_array((SELECT count(*) FROM test_attempts),(SELECT count(*) FROM user_answers),(SELECT sum(xp) FROM user_xp));", "postgres"), before);
  });
  await t.test("synthetic rollback removes private schema transactionally and restores all evidence", async () => {
    const before = await sql("SELECT jsonb_build_array((SELECT count(*) FROM test_sessions),(SELECT count(*) FROM test_attempts),(SELECT count(*) FROM user_answers),(SELECT count(*) FROM user_xp));", "postgres");
    await snapshot("security-before-rollback");
    const during = await sql(`BEGIN; ${withoutTransaction(read("../../../db/rollbacks/20261016_zi_generated_tests.sql"))}
      SELECT count(*) FROM pg_class WHERE relname IN ('zi_generated_tests','zi_generated_questions','zi_generated_sessions');
      ROLLBACK;`, "postgres");
    assert.equal(during,"0");
    assert.equal(await sql("SELECT jsonb_build_array((SELECT count(*) FROM test_sessions),(SELECT count(*) FROM test_attempts),(SELECT count(*) FROM user_answers),(SELECT count(*) FROM user_xp));", "postgres"), before);
    assert.equal(await sql("SELECT count(*) FROM pg_class WHERE relname IN ('zi_generated_tests','zi_generated_questions','zi_generated_sessions');"), "3");
    await snapshot("security-after-rollback-restored");
  });
});
