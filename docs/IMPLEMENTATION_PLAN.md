# Standalone Team Todo Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for the backend and dispatch independent frontend/localization work using superpowers:dispatching-parallel-agents. Track checkboxes below.

**Goal:** Deliver the approved independent team board and requested language support locally, without publishing.

**Architecture:** Reuse the Feishu team's pure board model and task-tree presentation; replace identity and membership with local accounts and transactional SQLite persistence. Frontend and backend meet the API contract in DESIGN.md.

**Tech Stack:** Python 3.11+, FastAPI, sqlite3, React, React Flow, Dagre, Vite, Playwright.

**Spec:** docs/DESIGN.md

## Global Constraints

- No GitHub publication. No real user data or credentials in deliverables.
- Team languages en-US (default), zh-CN, es, pt-BR, de.
- Every member may approve/reject; only creator may remove; no special task authority.
- Chooser sections are joined teams/create/search only. Team may contain multiple projects.
- Original pure task-board rules remain unchanged.

## Review Focus

Concurrent conflicting approvals must not double-insert membership; stale sessions after reset must fail; removed members must not mutate boards; language changes must not alter user content; fresh deployment must contain no seed users or tasks.

### Task 1: Accounts and teams

Files: team_todo/{config,db,security,app,auth,teams}.py; tests/test_api.py; pyproject.toml.

Interfaces: `create_app(database_path=None, public_url=None, static_dir=None)` returns FastAPI; all JSON endpoints and shapes are specified in DESIGN.md. `Database.connect(write=False)` owns transaction/commit/rollback. `identity(conn,request)` returns session and user fields.

- [x] Write failing real-database HTTP tests for accounts, origin/CSRF, membership approval, exact search, and team isolation; run pytest and observe missing implementation.
- [x] Implement persistent schema, account hashing/sessions/rate limiting, and team endpoints with immediate write transactions.
- [x] Run API tests; verify unauthorized and stale operations leave data unchanged.

### Task 2: Extract board model and persistence

Files: team_todo/{model,boards,manage}.py; tests/test_model.py; tests/test_api.py.

Interfaces: preserve `apply_action(previous,action,actor,members)` and `empty_board()`; expose board endpoints in DESIGN.md; CLI reset password takes password through getpass or stdin.

- [x] Copy original model tests, adapt import, observe failure; add board authorization/revision and reset/session tests and observe failure.
- [x] Extract model without rule changes, map validation messages to stable error codes, add CAS revisions, historical members and reset CLI.
- [x] Run complete backend suite, including approval races and departed-author behavior.

### Task 3: Frontend and five languages

Files: web/src/*; web/tests/*; web/package.json; web/vite.config.mjs.

Interfaces: exact DESIGN.md API contract. Existing board response fields remain compatible. Frontend owner: delegated UI worker, no backend modifications.

- [x] Preserve extracted model and graph interactions; add auth, restricted chooser, management and language selection.
- [x] Test locale catalogs and real-browser flows with real backend, including narrow layout, multiple projects and persisted board updates.
- [x] Build production assets and inspect screenshots.

### Task 4: Deployment and clean delivery

Files: Dockerfile; compose.yaml; .env.example; .gitignore; README.md; docs/VERIFICATION.md.

- [x] Provide multi-stage frontend/backend image with persistent data volume; documented PUBLIC_URL and recovery/backup commands.
- [x] Run fresh empty-instance health/auth checks, full suites, build and independent review; fix substantive findings and record exact results.
- [x] Scan three projects for real data and secrets. Retain test fixtures but exclude runtime files from delivery. Do not publish.
