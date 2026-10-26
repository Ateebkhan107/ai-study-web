# Isolated PostgreSQL 17.6 setup results

2026-10-22 (Asia/Kolkata). Revision 2 setup explicitly approved by the user. **Setup PASS; stopped before database acceptance testing.**

Executed the proposal's first shell block unchanged, in its clean child environment. Block SHA-256: `d2e90c29b56ce6e62704084781abc3f5d3da1264a4076629274a8b1fbcd172c1`. The wrapper recorded stdout/stderr privately; exit code **0**. No stop or deletion block was run. The approved proposal itself is retained unchanged as the historical plan.

| Item | Verified result |
| --- | --- |
| Official archive checksum | PASS: `e0630a3600aea27511715563259ec2111cd5f4353a4b040e0be827f94cd7a8b0` |
| Server version | PostgreSQL **17.6**, `server_version_num=170006` |
| Build | aarch64-apple-darwin25.6.0; Apple clang 21.0.0; 64-bit |
| Lab directory | `/private/tmp/prepzii-pg176.ujiylN` |
| Runtime prefix | `/private/tmp/prepzii-pg176.ujiylN/runtime` |
| Actual server data directory | `/private/tmp/prepzii-pg176.ujiylN/data` |
| Unix socket directory | `/tmp/prepzii-phase5-pg17` |
| Socket | `/tmp/prepzii-phase5-pg17/.s.PGSQL.55436` |
| Port/socket identifier | **55436** |
| Effective listen_addresses | Empty; TCP listening disabled |
| Verification connection | Unix socket; `inet_server_addr()` NULL |
| Verification operator | `zi_phase5_lab_admin` |
| Filesystem isolation | Lab, data and socket directory **0700**; socket **0700**; owned by the current OS user |
| Footprint after setup | **296 MiB** reported by du; approximately 237 GiB free |
| Setup errors | None; every required command/check succeeded |

The server configuration/version tuple was checked by exact shell equality before printing `VERIFIED_SERVER=17.6`. This validates the server, not merely the client. The only SQL executed was the two approved read-only version/configuration SELECTs against the new cluster's default postgres database.

Two libpq warnings occurred: `password file "/dev/null" is not a plain file`. These came from the approved `PGPASSFILE=/dev/null` safeguard on the two verification connections. Authentication still succeeded through the private local-trust socket. No credential fallback or command change was introduced. There were no configure warnings/errors or make failures in the scanned output.

Private setup/build log: `/private/tmp/prepzii-pg176-setup-kc499h9y.log`. The log and full lab are retained. The new server was started and has not been stopped by this task. Before any future operation, reverify the endpoint/version/identity; do not rely on a recorded PID or assume temporary files survive a reboot.

PostgreSQL 18 remained outside every installation/data target; the approved preflight observed its existing Homebrew server. Its executable still reports **18.3** after setup. No PostgreSQL 18 connection, service operation, package change, upgrade, shell configuration edit or persistent PATH change was performed.

No application migrations, staging fixtures, student records, acceptance suite, production connection, deployment, grant changes or Zi activation were run. No existing lab or database was deleted. No automatic service or launch agent was installed.

The runtime intentionally omits ICU, readline, zlib and SSL support; uuid-ossp was built using the system UUID library. It is a PostgreSQL semantics runtime, not a complete Supabase/PostgREST environment. Runtime acceptance, application regression, DDL watcher and platform integration checks remain unexecuted.

Permanent cleanup requires separate approval and the guarded deletion procedure in `docs/zi-phase5-pg176-runtime-proposal.md`. Preserve any needed redacted evidence first. Neither successful setup nor this report authorizes the database acceptance suite or production action.
