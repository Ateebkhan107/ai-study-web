import assert from "node:assert/strict";
import { execFileSync, execFile } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { userInfo } from "node:os";
import { promisify } from "node:util";
import test from "node:test";

const execute = promisify(execFile);

test("Battle Arena queue, answers and Marks on isolated PostgreSQL", {
  skip: process.env.PREPZII_BATTLE_DB_TEST !== "1",
}, async (t) => {
  const socket = mkdtempSync("/tmp/prepzii-battle-pg.");
  const data = socket + "/data";
  const env = { PATH: process.env.PATH, LC_ALL: "C", PGPASSFILE: "/dev/null", PGSERVICEFILE: "/dev/null" };
  const args = ["-X", "-h", socket, "-p", "55495", "-U", userInfo().username, "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-Atq"];
  const sql = (statement) => execFileSync("psql", [...args, "-c", statement], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const concurrent = async (...statements) => Promise.all(statements.map(async (statement) => (
    await execute("psql", [...args, "-c", statement], { env })
  ).stdout.trim()));
  const migration = (name) => execFileSync("psql", args, {
    env, input: readFileSync(new URL("../../db/migrations/" + name, import.meta.url)), stdio: ["pipe", "pipe", "pipe"],
  });

  execFileSync("initdb", ["-D", data, "--no-locale", "--auth=trust"], { env });
  execFileSync("pg_ctl", ["-D", data, "-l", socket + "/postgres.log", "-o", "-h '' -k " + socket + " -p 55495", "-w", "start"], { env });
  t.after(() => execFileSync("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"], { env }));
  assert.equal(sql("select inet_server_addr() is null and current_setting('listen_addresses') = ''"), "t");

  sql(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create function auth.jwt() returns jsonb language sql as 'select null::jsonb';
    create table public.user_profiles(clerk_user_id text primary key, username text, exam text);
    insert into public.user_profiles values
      ('alice','alice','JEE'), ('bob','bob','JEE'), ('charlie','charlie','JEE'),
      ('expired','expired','JEE'), ('neha','neha','NEET'), ('nina','nina','NEET');`);
  migration("20260826_battle_arena_v1.sql");
  migration("20260826_add_battle_questions.sql");
  migration("20260902_battle_arena_v2_elo_seasons_feed.sql");
  migration("20261119_battle_arena_transactions.sql");
  sql(`grant select, insert, update, delete on all tables in schema public to service_role;
    insert into public.battle_questions(exam, subject, question_text, options, correct_answer)
    select exam, 'Physics', 'Question ' || number, '["Right", "Wrong", "Also wrong", "Also wrong"]', 'A'
    from unnest(array['JEE', 'NEET']) as exam cross join generate_series(1, 10) as number;
    insert into public.battle_queue(user_id, exam, joined_at, last_seen_at)
    values ('expired', 'JEE', now() - interval '2 minutes', now() - interval '2 minutes');`);
  assert.equal(sql("select has_function_privilege('authenticated', 'public.battle_submit(uuid,text)', 'execute')"), "f");
  assert.equal(sql("select has_function_privilege('anon', 'public.battle_manage_queue(text,text)', 'execute')"), "f");

  const manage = (user, action) => `set role service_role; select public.battle_manage_queue('${user}', '${action}');`;
  assert.equal(JSON.parse(sql(manage("neha", "join"))).status, "queued");
  const joins = (await concurrent(manage("alice", "join"), manage("bob", "join"))).map(JSON.parse);
  assert.deepEqual(joins.map(({ status }) => status).sort(), ["matched", "queued"]);
  const alice = JSON.parse(sql(manage("alice", "poll")));
  const bob = JSON.parse(sql(manage("bob", "poll")));
  assert.equal(alice.battleId, bob.battleId);
  assert.equal(alice.opponentId, "bob");
  assert.equal(bob.opponentId, "alice");
  assert.equal(JSON.parse(sql(manage("charlie", "join"))).status, "queued");
  assert.equal(JSON.parse(sql(manage("charlie", "leave"))).status, "idle");
  assert.equal(JSON.parse(sql(manage("charlie", "poll"))).status, "idle");
  assert.equal(JSON.parse(sql(manage("alice", "leave"))).battleId, alice.battleId);

  const battle = alice.battleId;
  const questions = JSON.parse(sql(`select to_json(question_ids) from public.battle_matches where id = '${battle}'`));
  assert.equal(questions.length, 10);
  assert.equal(new Set(questions).size, 10);
  const save = (user, index, answer) => sql(`set role service_role; select public.battle_save_answer(
    '${battle}', '${user}', '${questions[index]}', ${answer === null ? "null" : "'" + answer + "'"});`);
  assert.throws(() => save("charlie", 0, "A"), /not a player/);
  assert.throws(() => save("alice", 0, "Z"), /valid answer/);
  save("alice", 0, "B");
  save("alice", 0, "A");
  save("alice", 1, "B");
  save("alice", 2, "A");
  save("alice", 2, null);
  save("bob", 0, "B");
  const submit = (user) => `set role service_role; select public.battle_submit('${battle}', '${user}');`;
  assert.equal(sql(submit("alice")), "f");
  assert.equal(sql(`select score || ':' || correct_count || ':' || wrong_count || ':' || skipped_count
    from public.battle_players where battle_id = '${battle}' and user_id = 'alice'`), "3:1:1:8");
  assert.throws(() => save("alice", 2, "A"), /already locked/);

  const submissions = await concurrent(submit("alice"), submit("bob"), submit("bob"));
  assert.equal(submissions.filter((result) => result === "t").length, 1);
  assert.equal(sql(`select status || ':' || winner_user_id from public.battle_matches where id = '${battle}'`), "FINISHED:alice");
  assert.equal(sql(`select user_id || ':' || score || ':' || rating_before || ':' || rating_after || ':' || rating_change
    from public.battle_players where battle_id = '${battle}' order by user_id`), "alice:3:1000:1025:25\nbob:-1:1000:975:-25");
  for (const table of ["battle_stats", "battle_season_stats"]) {
    assert.equal(sql(`select user_id || ':' || arena_rating || ':' || total_battles from public.${table} order by user_id`),
      "alice:1025:1\nbob:975:1");
  }
  assert.equal(sql(submit("bob")), "f");

  const challenge = sql(`insert into public.battle_challenges(challenger_id, challenged_id)
    values ('neha','nina') returning id`);
  const accept = `set role service_role; select public.battle_create_match('NEET', 'neha', 'nina', '${challenge}');`;
  const [first, second] = await concurrent(accept, accept);
  assert.equal(first, second);
  assert.equal(sql(`select status || ':' || battle_id from public.battle_challenges where id = '${challenge}'`), "ACCEPTED:" + first);
  assert.equal(sql("select count(*) from public.battle_matches"), "2");

  // The loss stops at zero in the all-time rating, while the same match
  // still applies the full result-based penalty to the player's season.
  sql("insert into public.battle_stats (user_id, arena_rating) values ('neha', 1400), ('nina', 10)");
  const neetQuestion = sql(`select question_ids[1] from public.battle_matches where id = '${first}'`);
  sql(`select public.battle_save_answer('${first}', 'neha', '${neetQuestion}', 'A')`);
  const neetSubmissions = await concurrent(
    `select public.battle_submit('${first}', 'neha')`,
    `select public.battle_submit('${first}', 'nina')`,
  );
  assert.deepEqual(neetSubmissions.sort(), ["f", "t"]);
  assert.equal(sql(`select user_id || ':' || rating_after || ':' || rating_change from public.battle_players
    where battle_id = '${first}' order by user_id`), "neha:1420:20\nnina:0:-10");
  assert.equal(sql("select arena_rating from public.battle_season_stats where user_id = 'nina'"), "980");

  const draw = sql("select public.battle_create_match('NEET', 'neha', 'nina')");
  sql(`update public.battle_players set completed_at = now() where battle_id = '${draw}'`);
  assert.equal(sql(`select public.battle_submit('${draw}', 'nina')`), "t");
  assert.equal(sql(`select winner_user_id is null from public.battle_matches where id = '${draw}'`), "t");
  assert.equal(sql(`select bool_and(rating_before = rating_after and rating_change = 0)
    from public.battle_players where battle_id = '${draw}'`), "t");
});
