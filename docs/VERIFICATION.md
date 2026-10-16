# Verification — 2026-10-16

Initial local verification used Windows, Python 3.11 and Node.js 24. Server deployment was subsequently completed below. No GitHub publication was performed.

## Server deployment — 2026-10-16

- Server source: `/huiyang` on `159.75.43.105`; public URL: `https://159.75.43.105/`.
- Independent Compose project `huiyang-todo`, container `huiyang-todo-app-1`, persistent volume `huiyang-todo_team-data`; backend binds only to `127.0.0.1:8002`.
- Image `huiyang-todo:20261016` built successfully using cached Python 3.11 and the locally verified frontend production assets. Python packages were installed through Tencent's HTTPS PyPI mirror after slow downloads from the default index.
- The existing Caddy default route now proxies to the new app; original `/team` and `/api/team/*` routing is retained. The original proxy config is backed up at `/huiyang/deploy/Caddyfile.before-todo`.
- Fresh local checks: 21 Python tests, 9 frontend unit tests, production frontend build all passed.
- Three browser tests passed against a temporary container of the deployed image over SSH forwarding (54.8 seconds): languages, account/team/application/board flows, and mobile layout. Its database was held only in tmpfs and the temporary container was removed afterward.
- Browser tests exposed an ambiguous global status locator when both Loading and Pending were present. The test now scopes its status lookup to the search result; application behavior was unchanged.
- Public HTTPS browser smoke passed without bypassing TLS verification: homepage and health 200, Chinese choice survives reload, invalid Origin rejected with 403, no JavaScript exceptions, original `/team` still returns its 307 redirect.
- Deployed dependencies pass `pip check`; container is healthy with zero restarts; SQLite quick integrity check returns `ok`. No demo/test accounts were created in the live database.
- Server build configuration and operations/rollback instructions are in `/huiyang/compose.server.yaml` and `/huiyang/deploy/OPERATIONS.txt`.

## Initial local verification

| Check | Result |
|---|---|
| `.venv/Scripts/python -m pytest` | 21 passed; one upstream Starlette/httpx deprecation warning |
| `.venv/Scripts/python -m compileall -q team_todo` | Passed |
| `.venv/Scripts/python -m pip check` | No broken requirements |
| `npm ci` in web | Passed with the committed lockfile |
| `npm test` in web | 9 passed |
| `npm run build` in web | Passed; upstream React Flow `use client` directive and chunk-size notices |
| `npm run test:e2e` in web | 3 passed against the actual FastAPI/SQLite backend |
| Production SPA through FastAPI | HTML and both built entry assets returned 200; health/page requests created no database or seed records |
| Independent code review | One substantive finding, HTTP LAN UUID fallback, corrected and covered by regression tests |
| Source data audit | No database, environment secret file, or credential-format match outside excluded runtime/dependency directories |

Backend coverage includes account case uniqueness and salted password storage,
hashed server sessions, expiration and logout, password reset revocation,
HTTPS cookie settings, exact Origin and CSRF checks, bounded streamed bodies,
persistent rate limits, exact team search, rejection/reapplication, any-member
approval, concurrent conflicting decisions, creator-only removal, transfer/leave/
dissolution, immediate authorization revocation, team isolation, multiple
projects, stale board versions, historical authors and all nine original board
rule tests. Backup integrity and no-overwrite behavior are also exercised.

Browser coverage includes all five pre-login language choices, profile language
on reload and fresh-browser login, exactly three chooser sections, live pending
status and incoming-request refresh, rejection/reapplication and approval,
ordinary-member approval/rejection, creator removal, removed-member access
denial, ownership transfer and leaving, cancel/confirm dissolution, multiple
projects, persisted Unicode user content, immutable author permissions, mobile
navigation and staging. The mobile test disables crypto.randomUUID explicitly,
then creates real projects/tasks using the getRandomValues UUID fallback.

The independent reviewer reproduced that fallback issue on a non-secure HTTP IP
origin. A failing regression first captured the old `id-...` output, then the
implementation was changed to canonical UUID v4. Both unit and actual-backend
browser tests passed after the fix. No further substantive finding was reported.

Desktop and mobile screenshots were visually inspected and remain in ignored
`web/.runtime/`. Browser data exists only in an ignored, explicitly selected
test database; the default installation contains no records and creates no
demo accounts. Original Feishu pure board rules are retained; only its
presentation dependency and group-specific nonmember wording were removed from
the extracted module.

Docker is not installed on the verification host, so an actual Docker image
build, Compose startup and public HTTPS reverse proxy were not run. The image
recipe and Compose configuration are supplied; frontend production build and
native backend/static serving were verified separately. Test and preview
processes were stopped after verification.

Related project verification: Feishu source 130 passed, 2 optional PostgreSQL
tests skipped; 5 web unit and 11 browser tests passed. Muse 64 standard-library
tests passed, source release checksums and packaged tests passed. Real Feishu
delivery/OAuth/model compliance and actual Muse native cron/notifications remain
external integration checks, not local test claims.
