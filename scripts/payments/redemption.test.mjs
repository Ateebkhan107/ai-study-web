import assert from "node:assert/strict";
import { execFileSync, execFile } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { userInfo } from "node:os";
import { promisify } from "node:util";
import test from "node:test";

const execute = promisify(execFile);
const enabled = process.env.PREPZII_PAYMENT_DB_TEST === "1";

test("real PostgreSQL redemption, permissions, and concurrency", { skip: !enabled }, async (t) => {
  const directory = mkdtempSync("/tmp/prepzii-payment-pg.");
  const pgdata = directory + "/data";
  const env = { PATH: process.env.PATH, LC_ALL: "C", PGPASSFILE: "/dev/null", PGSERVICEFILE: "/dev/null" };
  const args = ["-X", "-h", directory, "-p", "55494", "-U", userInfo().username, "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-Atq"];
  const sql = (statement) => execFileSync("psql", [...args, "-c", statement], { env, encoding: "utf8" }).trim();
  const migration = (name) => execFileSync("psql", args, {
    env, input: readFileSync(new URL("../../db/migrations/" + name, import.meta.url)), stdio: ["pipe", "pipe", "pipe"],
  });
  execFileSync("initdb", ["-D", pgdata, "--no-locale", "--auth=trust"], { env });
  execFileSync("pg_ctl", ["-D", pgdata, "-l", directory + "/postgres.log", "-o", "-h '' -k " + directory + " -p 55494", "-w", "start"], { env });
  t.after(() => execFileSync("pg_ctl", ["-D", pgdata, "-m", "fast", "-w", "stop"], { env }));
  assert.equal(sql("SELECT inet_server_addr() IS NULL AND current_setting('listen_addresses') = '' AND current_setting('data_directory') LIKE '%prepzii-payment-pg.%'"), "t");

  sql(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE TABLE public.subscriptions (
      clerk_user_id text NOT NULL, exam_track text NOT NULL, plan text NOT NULL, status text NOT NULL,
      razorpay_order_id text NOT NULL, razorpay_payment_id text NOT NULL, razorpay_signature text NOT NULL,
      starts_at timestamptz, expires_at timestamptz, amount integer NOT NULL, currency text NOT NULL,
      updated_at timestamptz, UNIQUE (clerk_user_id, exam_track, plan)
    );
    GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO service_role;`);
  migration("20261108_diwali_quarterly_promotion.sql");
  migration("20261113_razorpay_payment_redemptions.sql");

  let sequence = 0;
  function intent(order, user = "student", plan = "monthly") {
    sequence += 1;
    const receipt = "00000000-0000-4000-8000-" + String(sequence).padStart(12, "0");
    const amount = plan === "yearly" ? 39900 : 4900;
    sql(`SET ROLE service_role;
      INSERT INTO razorpay_checkout_orders (receipt, clerk_user_id, exam_track, plan, amount_paise, currency, duration_days)
      VALUES ('${receipt}', '${user}', 'JEE', '${plan}', ${amount}, 'INR', 30);
      UPDATE razorpay_checkout_orders SET provider_order_id = 'order_${order}' WHERE receipt = '${receipt}';`);
  }
  const statement = (order, payment, user = "student", amount = 4900) =>
    `SET ROLE service_role; SELECT redeem_verified_razorpay_payment('order_${order}', 'pay_${payment}', '${user}', ${amount}, 'INR');`;
  const redeem = (...parameters) => sql(statement(...parameters));
  const expiry = () => sql("SELECT expires_at FROM subscriptions WHERE clerk_user_id='student' AND plan='monthly'");

  await t.test("legacy callbacks cannot activate and browser roles cannot use the ledger", () => {
    assert.equal(redeem("legacy", "legacy"), "invalid");
    assert.equal(sql("SELECT has_function_privilege('anon','public.redeem_verified_razorpay_payment(text,text,text,integer,text)','EXECUTE')"), "f");
    assert.equal(sql("SELECT has_table_privilege('authenticated','public.razorpay_payment_redemptions','SELECT')"), "f");
    assert.equal(sql("SELECT has_table_privilege('service_role','public.razorpay_payment_redemptions','DELETE')"), "f");
    assert.throws(() => sql(`SET ROLE service_role; INSERT INTO subscriptions VALUES
      ('legacy','JEE','monthly','active','order_legacy','pay_legacy','old',now(),now(),49,'INR',now());`));
  });

  await t.test("concurrent duplicate callbacks write one receipt and one entitlement", async () => {
    intent("first");
    const results = await Promise.all(Array.from({ length: 8 }, () =>
      execute("psql", [...args, "-c", statement("first", "first")], { env }).then((r) => r.stdout.trim())
    ));
    assert.equal(results.filter((status) => status === "applied").length, 1);
    assert.equal(results.filter((status) => status === "already_applied").length, 7);
    assert.equal(sql("SELECT count(*) FROM razorpay_payment_redemptions"), "1");
    assert.equal(sql("SELECT extract(epoch from expires_at - starts_at)::integer FROM subscriptions"), "2592000");
    assert.equal(redeem("first", "different"), "conflict");
    intent("different", "other");
    assert.equal(redeem("different", "first", "other"), "conflict");
    assert.equal(redeem("first", "first", "other"), "invalid");
    assert.equal(redeem("first", "first", "student", 1), "invalid");
    assert.throws(() => sql("SET ROLE service_role; UPDATE razorpay_checkout_orders SET provider_order_id='order_rebound' WHERE provider_order_id='order_first'"));
  });

  await t.test("newer orders win and older redeemed or delayed orders cannot change expiry", () => {
    intent("delayed");
    intent("renewal");
    const firstExpiry = expiry();
    assert.equal(redeem("renewal", "renewal"), "applied");
    const renewalExpiry = expiry();
    assert.equal(new Date(renewalExpiry) - new Date(firstExpiry), 30 * 86400000);
    assert.equal(redeem("delayed", "delayed"), "superseded");
    assert.equal(redeem("delayed", "delayed"), "superseded");
    assert.equal(redeem("first", "first"), "already_applied");
    assert.equal(expiry(), renewalExpiry);
    sql("UPDATE subscriptions SET expires_at = now() - interval '1 day' WHERE clerk_user_id = 'student'");
    const expired = expiry();
    assert.equal(redeem("first", "first"), "already_applied");
    assert.equal(expiry(), expired);
    assert.throws(() => sql(`SET ROLE service_role; UPDATE subscriptions
      SET razorpay_order_id = 'order_first', razorpay_payment_id = 'pay_first' WHERE clerk_user_id = 'student'`));
    intent("postexpiry");
    assert.equal(redeem("postexpiry", "postexpiry"), "applied");
    assert.ok(new Date(expiry()) > new Date());
  });

  await t.test("a failed entitlement write rolls back its receipt and can be retried", () => {
    intent("recovery");
    sql(`CREATE FUNCTION reject_subscription_fixture() RETURNS trigger LANGUAGE plpgsql AS
      'BEGIN RAISE EXCEPTION ''fixture write failed''; END;';
      CREATE TRIGGER reject_subscription_fixture BEFORE INSERT OR UPDATE ON subscriptions
        FOR EACH ROW EXECUTE FUNCTION reject_subscription_fixture();`);
    assert.throws(() => redeem("recovery", "recovery"), /fixture write failed/);
    assert.equal(sql("SELECT count(*) FROM razorpay_payment_redemptions WHERE provider_order_id = 'order_recovery'"), "0");
    sql("DROP TRIGGER reject_subscription_fixture ON subscriptions");
    assert.equal(redeem("recovery", "recovery"), "applied");
    assert.equal(redeem("recovery", "recovery"), "already_applied");
  });

  await t.test("a delayed payment cannot reverse a newer cancellation", () => {
    intent("cancelpending");
    sql("UPDATE subscriptions SET status='cancelled', updated_at=clock_timestamp() WHERE clerk_user_id='student'");
    assert.equal(redeem("cancelpending", "cancelpending"), "superseded");
    assert.equal(sql("SELECT status FROM subscriptions WHERE clerk_user_id='student' AND plan='monthly'"), "cancelled");
  });

  await t.test("a payment racing across two registered owners can activate only one", async () => {
    intent("raceone", "race-one");
    intent("racetwo", "race-two");
    const results = await Promise.all([
      execute("psql", [...args, "-c", statement("raceone", "shared", "race-one")], { env }),
      execute("psql", [...args, "-c", statement("racetwo", "shared", "race-two")], { env }),
    ]);
    assert.deepEqual(results.map(({ stdout }) => stdout.trim()).sort(), ["applied", "conflict"]);
    assert.equal(sql("SELECT count(*) FROM subscriptions WHERE clerk_user_id IN ('race-one', 'race-two')"), "1");
  });

  await t.test("reviewed historical evidence reserves identifiers without changing entitlements", () => {
    const historyScript = readFileSync(new URL("./record-reviewed-history.sql", import.meta.url), "utf8");
    const staged = (evidence) => `BEGIN;
      CREATE TEMP TABLE reviewed_razorpay_history (provider_order_id text, provider_payment_id text, evidence_reference text) ON COMMIT DROP;
      INSERT INTO reviewed_razorpay_history VALUES ('order_legacy', 'pay_legacy', '${evidence}');
      ${historyScript}
      COMMIT;`;
    assert.throws(() => sql(staged("")), /unevidenced historical receipts/);
    const count = sql("SELECT count(*) FROM subscriptions");
    sql(staged("fixture-review-01"));
    sql(staged("fixture-review-01"));
    assert.equal(sql("SELECT count(*) FROM subscriptions"), count);
    assert.equal(sql("SELECT count(*) FROM razorpay_payment_redemptions WHERE disposition='historical_consumed'"), "1");
    assert.equal(redeem("legacy", "legacy"), "invalid");
    intent("newattempt");
    assert.equal(redeem("newattempt", "legacy"), "conflict");
  });
});
