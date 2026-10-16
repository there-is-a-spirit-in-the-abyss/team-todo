# Team Todo UI

English | [简体中文](README.zh-CN.md)

## Windows installer

**[Download team-todo-setup.exe](https://github.com/there-is-a-spirit-in-the-abyss/team-todo/releases/latest/download/team-todo-setup.exe)** · [All releases and checksums](https://github.com/there-is-a-spirit-in-the-abyss/team-todo/releases)

Download and double-click the `.exe`, enter your SSH connection details, choose a
server directory, and deploy. Your computer does not need a separate Python,
Node.js, or SSH installation. The default server directory is `/team-todo`.
After deployment, open the website and register your account.
Downloads require an authorized GitHub account while this repository is private.

See the [installer guide (Simplified Chinese)](installer/README.md). After the
GitHub release workflow succeeds, the installer pulls a prebuilt app image.
Local installer builds include clean source that Docker builds on the server.

A self-hosted team task tree with local accounts, team applications, multiple projects, shared staging and visual progress. Extracted from Huiyang's Feishu team module. The software connects to no Feishu, Muse, LLM, email or hosted identity service. You provide the server.

## Quick start with Docker

Windows users can use the [Chinese graphical installer](installer/README.md):
double-click `team-todo-setup.exe`, enter SSH connection information, browse or
create a server folder (default `/team-todo`), then deploy. It bundles its client
dependencies; no Python, Node.js or SSH client installation is needed. Published
Releases use prebuilt images; local installers build the included clean source
inside Docker on the server. No Feishu or model credentials are required.

Install Docker Engine / Desktop with Compose, then run in this project directory:

```sh
docker compose up --build -d
```

Open **http://localhost:8000** and register your own account. The initial installation has **no users, teams, projects or tasks**. Data persists in the `team-data` named volume across container restarts and rebuilds. Do not run `docker compose down -v` unless you intend to delete that installation's data.

For a server deployment, copy `.env.example` to `.env` and set `PUBLIC_URL` to the exact browser origin, for example `https://tasks.example.com`. Keep the app's loopback port behind an HTTPS reverse proxy on that server. Access through an SSH tunnel is also possible. Configure the reverse proxy to preserve `Host` and pass requests to `127.0.0.1:8000`. The app checks Origin on every change, so scheme, hostname and port must match. HTTPS deployments use Secure session cookies automatically.

## How teams work

Each installation represents one enterprise. Register with a unique username, password and display name; no email is needed. A user can join multiple teams. After login, the chooser contains exactly three sections: **My teams**, **Create team**, and **Search team**. Search accepts only the complete ten-digit team code and exposes no enterprise directory. Search results show Apply, Pending or Joined. Rejected applicants can apply again.

Inside a team, **every current member can approve or reject applications**. Only the current creator can remove members, transfer team ownership or dissolve the team. Members may leave; the creator transfers ownership before leaving. Removing a member revokes their access on subsequent requests. Each team has its own members, projects, task tree and staging area.

Board rules are inherited from the original module:

- Any member creates projects and tasks. Tasks retain their original author.
- Only the author edits a task, changes its state or deletes its branch. Deleting a branch also deletes descendants authored by others; the confirmation lists them.
- Every member can move any whole branch to a project, another task or staging. Cycles are rejected; child relationships are preserved.
- When an author leaves, remaining members can maintain their tasks. Returning authors see the latest state and regain normal author permissions.
- A project's progress counts completed and discarded tasks as ended. Project status is derived from its tasks. An unused empty project persists; a previously used project disappears when emptied.
- The team creator has no special task-editing privilege. No deadlines, reminders or weekly reports are included.

Concurrent stale changes return a conflict instead of overwriting newer work. The browser refreshes the latest board for review.

## Languages

American English (`en-US`) is the default. Select Simplified Chinese (`zh-CN`), Spanish (`es`), Brazilian Portuguese (`pt-BR`) or German (`de`) from the language control. The choice works before login, persists in the browser, and is saved in the account when signed in. Interface text changes; member names, team/project names, task titles and notes remain exactly as written.

## Native Python development

Requires Python 3.11+ and Node.js 22+ for building the frontend.

```sh
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
python -m pip install '.[test]'
cd web
npm ci
npm run build
cd ..
python -m uvicorn team_todo.app:app --host 127.0.0.1 --port 8000
```

Native defaults: `PUBLIC_URL=http://localhost:8000`, `DATABASE_PATH=data/team-todo.db`, `STATIC_DIR=web/dist`. Environment variables configure the app; Python does not automatically read `.env`. Compose reads `.env` for its substitutions.

For Vite development, set backend `PUBLIC_URL=http://127.0.0.1:5173`, start the backend on port 8000, then run `npm run dev` in `web` and open that exact origin. The Vite proxy forwards `/api` to the backend.

## Password recovery and backups

The server operator can reset a password locally. The password is prompted privately and all that user's sessions are invalidated:

```sh
docker compose exec app python -m team_todo.manage reset-password USERNAME
# Native: python -m team_todo.manage reset-password USERNAME
```

For noninteractive administration, `--password-stdin` reads a single password line from stdin. Avoid passing passwords on command lines or committing them to files.

Create an online, consistent SQLite backup:

```sh
docker compose exec app python -m team_todo.manage backup /app/data/backup.db
docker compose cp app:/app/data/backup.db ./backup.db
# Native: python -m team_todo.manage backup /absolute/path/backup.db
```

Backups contain private business data. Store them separately from source control. Stop the app before restoring a backup, preserve the current database first, replace the database with the consistent backup, and ensure stale WAL/SHM files from the old database are not mixed with it. File ownership must allow the container's uid 10001 to read/write restored files.

## Verification and source delivery

```sh
python -m pytest
cd web
npm test
npm run build
npm run test:e2e
```

Browser tests require Chromium (`npx playwright install chromium` in `web`).
They use real API operations with synthetic accounts. Start a separate backend
on port 8000 with `PUBLIC_URL=http://127.0.0.1:8791` and
`DATABASE_PATH=.runtime/browser-test.db`, then run `npm run test:e2e` in `web`.
Playwright starts its own Vite server on port 8791. Use a fresh test database
for each run, and never point these tests at an actual installation. For example,
in a separate PowerShell terminal at the project root:

```powershell
$env:PUBLIC_URL='http://127.0.0.1:8791'
$env:DATABASE_PATH='.runtime/browser-test.db'
.\.venv\Scripts\python -m uvicorn team_todo.app:app --host 127.0.0.1 --port 8000
```

Exact verified results and environment limits are recorded in [docs/VERIFICATION.md](docs/VERIFICATION.md). The implementation contract is in [docs/DESIGN.md](docs/DESIGN.md). Source delivery excludes databases, credentials, `.env`, runtime logs, dependency folders and build caches. Automated tests use temporary fixture data; no demo or production accounts are installed. Source and Windows installers are published through the repository and Releases linked above.
