"""Apply the proposal only to a NEW, private, socket-only synthetic cluster.
Usage: python3 scripts/zi-phase1/accounting_db_test.py /absolute/postgres/bin
Never connects to an existing cluster; retains its stopped lab for inspection.
"""
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import uuid

BIN = Path(sys.argv.pop(1)).resolve()
ROOT = Path(__file__).resolve().parents[2]
LAB = Path(tempfile.mkdtemp(prefix="zi-phase1-accounting-", dir="/private/tmp"))
SOCKET = LAB / "socket"
SOCKET.mkdir(mode=0o700)
ENV = {"PATH": "/usr/bin:/bin", "LC_ALL": "C"}
ADMIN = "zi_phase1_synthetic_admin"


def sql(text, check=True):
    return subprocess.run([str(BIN / "psql"), "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-h", str(SOCKET),
                           "-p", "55439", "-U", ADMIN, "-d", "postgres"], input=text, text=True,
                          capture_output=True, env=ENV, check=check)


def op(owner, operation="read", request=None, role="service_role"):
    # All values are synthetic fixed labels or Python-issued UUIDs.
    assert owner.replace("-", "").isalnum() and role in ("service_role", "anon", "authenticated")
    rid = "NULL" if request is None else "'" + str(uuid.UUID(str(request))) + "'"
    return json.loads(sql(f"SET ROLE {role}; SELECT public.zi_trial_prompt_usage('{owner}','{operation}',{rid});").stdout)


class Accounting(unittest.TestCase):
    def test_concurrent_admission_from_two_used(self):
        sql("INSERT INTO zi_preferences VALUES('concurrent','zi_free_prompts_used','2',now());")
        ids = [uuid.uuid4() for _ in range(16)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(lambda rid: op("concurrent", "reserve", rid), ids))
        admitted = [rid for rid, result in zip(ids, results) if result["allowed"]]
        self.assertEqual(len(admitted), 1)
        rid = admitted[0]
        self.assertEqual(op("concurrent", "dispatch", rid)["state"], "dispatched")
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(lambda _: op("concurrent", "consume", rid), range(8)))
        self.assertEqual(op("concurrent")["used"], 3)
        self.assertEqual(op("concurrent")["pending"], 0)

    def test_empty_user_admits_exactly_three(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
            results = list(pool.map(lambda _: op("empty", "reserve", uuid.uuid4()), range(12)))
        self.assertEqual(sum(r["allowed"] for r in results), 3)
        self.assertEqual(op("empty")["remaining"], 0)

    def test_configuration_failure_releases_but_dispatch_is_held(self):
        rid = uuid.uuid4()
        op("release", "reserve", rid)
        self.assertEqual(op("release", "release", rid)["remaining"], 3)
        self.assertEqual(op("release", "release", rid)["remaining"], 3)
        held = uuid.uuid4()
        op("release", "reserve", held)
        op("release", "dispatch", held)
        self.assertEqual(op("release", "release", held)["state"], "dispatched")
        self.assertEqual(op("release")["used"], 0)
        self.assertEqual(op("release")["remaining"], 2)

    def test_preference_reset_and_legacy_history(self):
        sql("INSERT INTO zi_preferences VALUES('reset','zi_free_prompts_used','2',now()),('reset','preferred_language','Hinglish',now());")
        rid = uuid.uuid4()
        op("reset", "reserve", rid)
        sql("DELETE FROM zi_preferences WHERE clerk_user_id='reset' AND preference_key IN ('preferred_language','response_length','explanation_style','learning_style','study_preference');")
        self.assertEqual(op("reset")["used"], 2)
        # Even an old worker's broad reset cannot erase the recorded usage floor.
        sql("DELETE FROM zi_preferences WHERE clerk_user_id='reset';")
        self.assertEqual(op("reset")["used"], 2)
        op("reset", "dispatch", rid)
        self.assertEqual(op("reset", "consume", rid)["used"], 3)

    def test_over_limit_and_malformed_legacy_counts(self):
        sql("INSERT INTO zi_preferences VALUES('overlimit','zi_free_prompts_used','8',now()),('malformed','zi_free_prompts_used','oops',now());")
        self.assertFalse(op("overlimit", "reserve", uuid.uuid4())["allowed"])
        result = sql("SET ROLE service_role; SELECT zi_trial_prompt_usage('malformed','read');", check=False)
        self.assertNotEqual(result.returncode, 0)

    def test_missing_or_foreign_reservations_fail(self):
        rid = uuid.uuid4()
        op("owner", "reserve", rid)
        for operation in ("dispatch", "consume", "release"):
            result = sql(f"SET ROLE service_role; SELECT zi_trial_prompt_usage('other','{operation}','{rid}');", check=False)
            self.assertNotEqual(result.returncode, 0)
        self.assertEqual(op("owner")["pending"], 1)

    def test_browser_roles_and_service_table_access_denied(self):
        for role in ("anon", "authenticated", "authenticator"):
            result = sql(f"SET ROLE {role}; SELECT zi_trial_prompt_usage('forbidden','read');", check=False)
            self.assertNotEqual(result.returncode, 0)
        for role in ("anon", "authenticated", "authenticator", "service_role"):
            for statement in ("SELECT * FROM zi_trial_prompt_reservations", "DELETE FROM zi_trial_prompt_reservations", "TRUNCATE zi_trial_prompt_reservations"):
                self.assertNotEqual(sql(f"SET ROLE {role}; {statement};", check=False).returncode, 0)


if __name__ == "__main__":
    started = False
    try:
        subprocess.run([str(BIN / "initdb"), "-D", str(LAB / "data"), "-U", ADMIN, "-A", "trust", "--no-locale"],
                       env=ENV, check=True, capture_output=True)
        subprocess.run([str(BIN / "pg_ctl"), "-D", str(LAB / "data"), "-l", str(LAB / "postgres.log"),
                        "-o", f"-k {SOCKET} -p 55439 -c listen_addresses='' -c unix_socket_permissions=0700", "-w", "start"],
                       env=ENV, check=True, capture_output=True)
        started = True
        actual = sql("SELECT current_setting('data_directory') || '|' || current_setting('listen_addresses');").stdout.strip()
        assert actual == str(LAB / "data") + "|", "Unexpected database target"
        print("Synthetic database:", sql("SHOW server_version;").stdout.strip(), "lab:", LAB)
        sql("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE authenticator; CREATE ROLE service_role; "
            "CREATE TABLE public.zi_preferences(clerk_user_id text,preference_key text,preference_value text,updated_at timestamptz,UNIQUE(clerk_user_id,preference_key)); "
            "ALTER TABLE zi_preferences ENABLE ROW LEVEL SECURITY;")
        sql((ROOT / "db/proposals/20261031_zi_trial_prompt_accounting.sql").read_text())
        result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Accounting))
        sys.exit(0 if result.wasSuccessful() else 1)
    except subprocess.CalledProcessError as error:
        print(error.stderr or error.stdout, file=sys.stderr)
        raise
    finally:
        if started:
            subprocess.run([str(BIN / "pg_ctl"), "-D", str(LAB / "data"), "-m", "fast", "-w", "stop"], env=ENV, check=True, capture_output=True)
