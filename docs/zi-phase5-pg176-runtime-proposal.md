# PostgreSQL 17.6 isolated runtime — final safety review

Reviewed 2026-10-22 (Asia/Kolkata), revision 2. **SAFE for the narrowly scoped isolated setup below, after approval. Not approved or executed.** No archive/runtime downloaded, installed, initialized or started. Only official web metadata/documentation and local prerequisites were read.

The original revision needed changes before approval: fully sanitize inherited build/database variables; ignore curl configuration and HTTPS-to-HTTP redirects; persist socket-only settings across restarts; enforce the server-version check; add disk and cleanup guards. This revision supersedes those commands. It is a reviewed plan, not evidence that this exact release compiles or runs on this SDK.

## Verified source, tools and disk

Official archive: https://ftp.postgresql.org/pub/source/v17.6/postgresql-17.6.tar.bz2

Official checksum metadata: https://ftp.postgresql.org/pub/source/v17.6/postgresql-17.6.tar.bz2.sha256

Exact SHA-256: `e0630a3600aea27511715563259ec2111cd5f4353a4b040e0be827f94cd7a8b0`.

The official directory lists the archive at **21,623,975 bytes** (about 20.6 MiB). Metadata was verified; archive bytes cannot be verified until an approved download. Reject any hash mismatch before extraction/build. HTTPS plus the pinned official digest is the trust basis; this is not a claim of independent cryptographic-signature verification.

This arm64 Mac has Apple clang 21, GNU make 3.81, Bison 2.3, Flex 2.6.4, Perl 5.34.1 and the Command Line Tools SDK. These meet the documented version prerequisites. Actual configure/link success, including the system UUID library, remains untested. Stop on any missing dependency/SDK incompatibility; do not install packages or substitute another PostgreSQL version.

PostgreSQL **18.3** remains installed through Homebrew. No Docker/Podman was found previously. The filesystem reports approximately **237 GiB available**. Budget roughly 1–2 GiB for source/build/binaries/initial cluster, subject to measured build size; require **at least 5 GiB free** before setup. This is a conservative operational budget, not an upstream guaranteed maximum. WAL, logs and synthetic datasets can grow; measure with `du -sh` and `df -h` during rehearsal and stop workload growth before free space falls below 5 GiB. No disk quota is imposed by this plan.

The dedicated socket directory currently does not exist. Read-only process inspection, retried with read permission after the sandbox denied it, confirms the PostgreSQL 18 server is running at `/opt/homebrew/opt/postgresql@18/bin/postgres` (observed PID 712; never rely on this PID later). The TCP listener probe returned no listener on 55436. PostgreSQL 18 was not contacted or stopped. Repeat these checks before approved provisioning; an unexpected target socket/listener or failed inspection is a STOP condition. Existing PostgreSQL 18 processes are expected and must be left running. No process arguments containing credentials were printed.

## Exact proposed setup commands — DO NOT RUN before approval

Execute this block as the ordinary user, in one clean non-login child shell. It does not change the parent shell's PATH, umask, startup files or environment. All inherited secrets, PG*, MAKEFLAGS, DESTDIR, compiler/library injection and proxy variables are discarded. Only the declared child environment is used. No .env, shell profile, .curlrc, .psqlrc, production DSN, credential file, Homebrew command or sudo is used. libpq password/service files are explicitly redirected away from user configuration.

```sh
/usr/bin/env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin LC_ALL=C /bin/sh <<'PG176_SETUP'
set -eu
umask 077
# Disk gate: 5 GiB expressed in 1024-byte blocks.
PG176_FREE=$(/bin/df -Pk /private/tmp | /usr/bin/awk 'NR==2 {print $4}')
test "$PG176_FREE" -ge 5242880
# Read-only inventory: print executable names, never process arguments/secrets.
PG176_PROCESSES=$(/bin/ps -axo pid=,comm=)
/usr/bin/printf '%s\n' "$PG176_PROCESSES" | /usr/bin/awk '$2 ~ /postgres|postmaster/ {print}'
PG176_PROBE_STATUS=0
PG176_PROBE=$(/usr/sbin/lsof -nP -iTCP:55436 -sTCP:LISTEN 2>&1) || PG176_PROBE_STATUS=$?
test "$PG176_PROBE_STATUS" -le 1
test -z "$PG176_PROBE"
# Refuse existing directories, files AND dangling symlinks.
test ! -e /tmp/prepzii-phase5-pg17
test ! -L /tmp/prepzii-phase5-pg17
PG176_LAB=$(/usr/bin/mktemp -d /private/tmp/prepzii-pg176.XXXXXX)
/usr/bin/printf 'LAB_PATH=%s\n' "$PG176_LAB"
/usr/bin/printf '%s\n' "$PG176_LAB" > "$PG176_LAB/.prepzii-pg176-lab"
/bin/mkdir -m 700 "$PG176_LAB/tmp" "$PG176_LAB/empty-config"
TMPDIR="$PG176_LAB/tmp/"
PGPASSFILE=/dev/null
PGSERVICEFILE=/dev/null
PGSYSCONFDIR="$PG176_LAB/empty-config"
CLANG_MODULE_CACHE_PATH="$PG176_LAB/clang-cache"
export TMPDIR PGPASSFILE PGSERVICEFILE PGSYSCONFDIR CLANG_MODULE_CACHE_PATH
cd "$PG176_LAB"
# --disable is FIRST: ignore curl configuration. Redirects must remain HTTPS.
/usr/bin/curl --disable --fail --location --max-redirs 3 --proto '=https' --proto-redir '=https' --tlsv1.2 --connect-timeout 30 --max-time 300 --output postgresql-17.6.tar.bz2 https://ftp.postgresql.org/pub/source/v17.6/postgresql-17.6.tar.bz2
/usr/bin/printf '%s  %s\n' e0630a3600aea27511715563259ec2111cd5f4353a4b040e0be827f94cd7a8b0 postgresql-17.6.tar.bz2 | /usr/bin/shasum -a 256 -c -
/usr/bin/tar -xjf postgresql-17.6.tar.bz2
cd "$PG176_LAB/postgresql-17.6"
./configure --prefix="$PG176_LAB/runtime" --without-icu --without-readline --without-zlib --with-uuid=e2fs CC=/usr/bin/clang
/usr/bin/make -j4
/usr/bin/make install
/usr/bin/make -C contrib/uuid-ossp install
# Confirm generated installation paths belong only to this prefix.
for PG176_OPTION in --bindir --libdir --sharedir --includedir --sysconfdir; do
  PG176_PATH=$("$PG176_LAB/runtime/bin/pg_config" "$PG176_OPTION")
  case "$PG176_PATH" in "$PG176_LAB/runtime/"*) ;; *) exit 1 ;; esac
done
PG176_FREE=$(/bin/df -Pk /private/tmp | /usr/bin/awk 'NR==2 {print $4}')
test "$PG176_FREE" -ge 5242880
"$PG176_LAB/runtime/bin/initdb" -D "$PG176_LAB/data" -U zi_phase5_lab_admin --auth-local=trust --auth-host=reject --encoding=UTF8 --locale=C
# These are NEW lab-only files. Persist isolation for later starts/restarts.
/bin/cat >> "$PG176_LAB/data/postgresql.conf" <<'PG176_CONFIG'
listen_addresses = ''
unix_socket_directories = '/tmp/prepzii-phase5-pg17'
unix_socket_permissions = 0700
port = 55436
max_connections = 20
shared_buffers = '64MB'
PG176_CONFIG
# Atomic mkdir must succeed. Never reuse or delete a conflicting socket path.
/bin/mkdir -m 700 /tmp/prepzii-phase5-pg17
/usr/bin/printf '%s\n' "$PG176_LAB" > /tmp/prepzii-phase5-pg17/.prepzii-pg176-owner
"$PG176_LAB/runtime/bin/pg_ctl" -D "$PG176_LAB/data" -p "$PG176_LAB/runtime/bin/postgres" -l "$PG176_LAB/server.log" -w -t 60 start
# Check the SERVER, its actual data directory, operator and effective isolation.
PG176_CHECK=$("$PG176_LAB/runtime/bin/psql" -X -w -h /tmp/prepzii-phase5-pg17 -p 55436 -U zi_phase5_lab_admin -d postgres -v ON_ERROR_STOP=1 -Atc "SELECT concat_ws('|',current_setting('server_version_num'),current_setting('port'),current_setting('listen_addresses'),current_setting('unix_socket_directories'),current_setting('data_directory'),current_user,CASE WHEN inet_server_addr() IS NULL THEN 'unix' ELSE 'network' END);")
test "$PG176_CHECK" = "170006|55436||/tmp/prepzii-phase5-pg17|$PG176_LAB/data|zi_phase5_lab_admin|unix"
"$PG176_LAB/runtime/bin/psql" -X -w -h /tmp/prepzii-phase5-pg17 -p 55436 -U zi_phase5_lab_admin -d postgres -v ON_ERROR_STOP=1 -Atc 'SELECT version();'
/usr/bin/printf 'VERIFIED_SERVER=17.6 LAB_PATH=%s\n' "$PG176_LAB"
PG176_SETUP
```

Save the printed **literal LAB_PATH** privately for stop/cleanup; this child-shell variable disappears on exit. A failing command stops setup. Partial files are retained for inspection; no automated cleanup, fallback installation or unknown-process kill follows failure. If the server started before a subsequent failure, stop only the verified lab using the procedure below. Do not retry into partially initialized directories.

No application fixture or migration SQL is part of this setup approval. The only database connections above are to the new Unix-socket cluster's default `postgres` database for read-only version/configuration SELECTs. A future rehearsal must independently recheck endpoint/user/version before creating the synthetic fixture. The public socket path aliases /private/tmp because /tmp is a system symlink; the database data directory is entirely separate from all existing clusters.

With empty listen_addresses, **55436 is a socket filename discriminator, not an exposed TCP listener**. Socket directory and socket permissions are 0700. Same-OS-user processes and OS administrators remain trusted; this is not a hostile multi-user container sandbox. Local trust authentication is confined to synthetic data in that private socket directory; host rules reject authentication, and TCP is disabled. Do not change these boundaries to make a failing test pass.

## Exact stop/cleanup commands — separate phases

Replace the single placeholder below with the literal printed lab path. Never discover a directory using a wildcard, choose the newest lab, rely on a default PGDATA, or use a PostgreSQL binary from PATH. Run these only after checking the chosen lab/marker/ownership. If process inspection is denied, stop here and obtain sufficient read permission; do not bypass the check or delete PID/socket files.

```sh
/usr/bin/env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin LC_ALL=C /bin/sh <<'PG176_STOP'
set -eu
PG176_LAB='/private/tmp/prepzii-pg176.REPLACE_WITH_PRINTED_SUFFIX'
case "$PG176_LAB" in /private/tmp/prepzii-pg176.??????) ;; *) exit 1 ;; esac
test "$(/usr/bin/dirname "$PG176_LAB")" = /private/tmp
test ! -L "$PG176_LAB"
test -d "$PG176_LAB"
test "$(/usr/bin/stat -f %u "$PG176_LAB")" = "$(/usr/bin/id -u)"
test "$(/bin/cat "$PG176_LAB/.prepzii-pg176-lab")" = "$PG176_LAB"
test "$(cd "$PG176_LAB" && /bin/pwd -P)" = "$PG176_LAB"
if test -f "$PG176_LAB/data/postmaster.pid"; then
  PG176_PID=$(/usr/bin/sed -n '1p' "$PG176_LAB/data/postmaster.pid")
  case "$PG176_PID" in ''|*[!0-9]*) exit 1 ;; esac
  test "$(/usr/bin/sed -n '2p' "$PG176_LAB/data/postmaster.pid")" = "$PG176_LAB/data"
  PG176_COMMAND=$(/bin/ps -p "$PG176_PID" -o command=)
  case "$PG176_COMMAND" in "$PG176_LAB/runtime/bin/postgres -D $PG176_LAB/data"*) ;; *) exit 1 ;; esac
  "$PG176_LAB/runtime/bin/pg_ctl" -D "$PG176_LAB/data" -m fast -w -t 60 stop
fi
# No forced stop, stale-PID deletion, or removal of live socket files.
test ! -e "$PG176_LAB/data/postmaster.pid"
if test -e /tmp/prepzii-phase5-pg17 || test -L /tmp/prepzii-phase5-pg17; then
  test ! -L /tmp/prepzii-phase5-pg17
  test "$(/usr/bin/stat -f %u /tmp/prepzii-phase5-pg17)" = "$(/usr/bin/id -u)"
  test "$(/bin/cat /tmp/prepzii-phase5-pg17/.prepzii-pg176-owner)" = "$PG176_LAB"
  test ! -e /tmp/prepzii-phase5-pg17/.s.PGSQL.55436
  test ! -e /tmp/prepzii-phase5-pg17/.s.PGSQL.55436.lock
  /bin/rm /tmp/prepzii-phase5-pg17/.prepzii-pg176-owner
  /bin/rmdir /tmp/prepzii-phase5-pg17
fi
/usr/bin/printf 'STOPPED; lab retained at %s\n' "$PG176_LAB"
PG176_STOP
```

The guarded stop also handles an unstarted/partially initialized lab when no PID file exists. If a socket directory belongs to another lab or inspection is inconclusive, leave it untouched. If normal shutdown leaves unexpected files, investigate; do not force removal. For a stale PID after a crash, verify the recorded PID and actual process separately before deciding recovery; this script intentionally refuses to guess.

After stopping, inspect/archive only redacted synthetic test evidence. **Optional permanent deletion requires explicit cleanup approval**. The following self-contained block repeats the path/owner/marker/canonical-path guards and refuses deletion while the socket directory or PID file exists. Replace its placeholder with the same printed literal LAB_PATH. The lsof guard refuses open files or diagnostic errors. This also allows deletion of a never-started failed build, subject to the same checks.

```sh
/usr/bin/env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin LC_ALL=C /bin/sh <<'PG176_DELETE'
set -eu
PG176_LAB='/private/tmp/prepzii-pg176.REPLACE_WITH_PRINTED_SUFFIX'
case "$PG176_LAB" in /private/tmp/prepzii-pg176.??????) ;; *) exit 1 ;; esac
test "$(/usr/bin/dirname "$PG176_LAB")" = /private/tmp
test ! -L "$PG176_LAB"
test -d "$PG176_LAB"
test "$(/usr/bin/stat -f %u "$PG176_LAB")" = "$(/usr/bin/id -u)"
test "$(/bin/cat "$PG176_LAB/.prepzii-pg176-lab")" = "$PG176_LAB"
test "$(cd "$PG176_LAB" && /bin/pwd -P)" = "$PG176_LAB"
test ! -e "$PG176_LAB/data/postmaster.pid"
test ! -e /tmp/prepzii-phase5-pg17
test ! -L /tmp/prepzii-phase5-pg17
PG176_LSOF_STATUS=0
PG176_OPEN=$(/usr/sbin/lsof -t +D "$PG176_LAB" 2>&1) || PG176_LSOF_STATUS=$?
test "$PG176_LSOF_STATUS" -le 1
test -z "$PG176_OPEN"
cd /private/tmp
/bin/rm -r -- "$PG176_LAB"
PG176_DELETE
```

Permanent `rm -r` is the **irreversible operation**: it deletes only the validated disposable lab, including synthetic databases, WAL, binaries, source and unarchived logs. Fast shutdown rolls back any still-open synthetic transactions. Neither operation touches PostgreSQL 18 or existing databases. No production/student data may enter the lab. There is no reason to run Homebrew uninstall, `make uninstall`, `pg_upgrade`, `initdb` against an existing data directory, killall, wildcard rm, or edit shell/service configuration.

## Separation and limits

Installation prefix is exactly the freshly created `/private/tmp/prepzii-pg176.<six-random-characters>/runtime`; data is its sibling `data`. The commands use no /opt/homebrew installation paths or production credentials. PostgreSQL 18 binaries, libraries, service state, databases and configuration remain outside the target paths. Existing shell PATH/startup files and Homebrew packages are not edited. Private compiler scratch space is under the lab; ordinary OS resource accounting/caches are not a promise of a bit-for-bit unchanged host filesystem. This is native execution of checksum-pinned trusted source, not an OS filesystem/network sandbox for malicious source code.

Only the archive fetch needs network access. PostgreSQL has no TCP listener and receives no production credentials. ICU/TLS/compression/platform extension parity is not supplied by this minimal build. Native macOS 17.6 is useful for PostgreSQL semantics but does not reproduce Supabase/PostgREST, Linux collations or production watcher behavior. No such parity is claimed.

All three command blocks pass `/bin/sh -n` syntax-only checking; they were not executed. `git diff --check` passes. This does not validate archive contents, compilation or actual server startup.

**Recommendation: SAFE to approve only this revised isolated download/build/setup and local read-only server verification.** Full compilation/runtime success and endpoint/process preflight remain execution gates. Approval does not authorize fixture SQL, application activation, deployment, production access or irreversible cleanup. No approval has been granted yet.

References: PostgreSQL [official 17.6 directory](https://ftp.postgresql.org/pub/source/v17.6/), [official SHA-256](https://ftp.postgresql.org/pub/source/v17.6/postgresql-17.6.tar.bz2.sha256), [requirements](https://www.postgresql.org/docs/17/install-requirements.html), [build/prefix/UUID options](https://www.postgresql.org/docs/17/install-make.html), [connection settings](https://www.postgresql.org/docs/17/runtime-config-connection.html), [pg_ctl shutdown](https://www.postgresql.org/docs/17/app-pg-ctl.html).
