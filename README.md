# Team Todo · Team Project Progress

English | [简体中文](README.zh-CN.md)

## Features

**Build projects with a flexible task tree and make team progress easy to see.**

- **Break down work freely:** create multiple projects and organize tasks and subtasks to match your workflow.
- **See progress at a glance:** follow task states, project completion and parent-child relationships.
- **Reorganize flexibly:** use shared staging and whole-branch moves to collect loose tasks and structure them later.
- **Keep deployment lightweight:** uses SQLite without Feishu, Muse, an LLM, email or a hosted identity provider.
- **Keep team data on your server:** users register locally and apply with the full ten-digit team code; existing members approve access, and no enterprise team directory is exposed.
- **Separate teams and permissions:** each team has its own members, projects and tasks; removal revokes subsequent access, and task editing follows author permissions.

For example, create “Product launch”, split it into “Design / Development / Testing”, and add subtasks. Move whole branches as plans change; project progress updates from task states.
This version is a collaboration board without deadlines, scheduled reminders or weekly reports.

### Project overview: task relationships and progress

Projects, tasks and subtasks form a connected tree. Each task card shows its status and owner; the header summarizes task counts and progress, while the sidebar lets you switch projects.

[![Project task tree showing six tasks, their hierarchy, owners and project progress](docs/images/team-task-tree.png)](docs/images/team-task-tree.png)

### Shared staging: collect first, organize later

Keep tasks in staging while you decide where they belong, then move whole branches into the right place. This view shows the project and its staged tasks together.

[![Project task tree with four project tasks and two tasks in shared staging](docs/images/team-task-staging.png)](docs/images/team-task-staging.png)

### Task details: status, notes and branch actions

Select a card to inspect its owner, status and notes in the side panel. With the required permissions, edit the task, move its branch, send it to staging or delete the branch.

[![Task details panel with status controls, title, notes and branch actions](docs/images/team-task-details.png)](docs/images/team-task-details.png)

### Adapt the structure as work changes

Bring staged tasks into a project and adjust their parent-child relationships as needed. This reorganized view shows five project tasks, their progress and an empty staging area.

[![Reorganized project tree showing five tasks, updated progress and empty staging](docs/images/team-task-reorganized.png)](docs/images/team-task-reorganized.png)

Click an image to view the original. Screenshots show the Simplified Chinese interface.

<details>
<summary>View sign-in, team creation and joining</summary>

**Sign in or register:** use a local account and choose the interface language independently.

[![Team Todo sign-in and registration screen](docs/images/team-login.png)](docs/images/team-login.png)

**Team workspace:** open a joined team, create a team, or search with its full team code and apply to join.

[![Team workspace with joined teams, team creation and full-code lookup](docs/images/team-workspace.png)](docs/images/team-workspace.png)

</details>

## Download

**[Download the team project installer · team-todo-setup.exe](https://github.com/there-is-a-spirit-in-the-abyss/team-todo/releases/latest/download/team-todo-setup.exe)**

[All releases and checksums](https://github.com/there-is-a-spirit-in-the-abyss/team-todo/releases) · [GitHub repository](https://github.com/there-is-a-spirit-in-the-abyss/team-todo)

Double-click the download to open the deployment wizard. Your computer needs no separate Python, Node.js or SSH installation.
The repository is currently private; downloading requires an authorized GitHub account.

## Installation and deployment

**Enter your server connection details and website address, then let the wizard install the application.**

1. Prepare a Linux server reachable over SSH and open `team-todo-setup.exe`.
2. Enter the server IP or domain, SSH port, username and password or private key, then connect and check the server.
3. Choose the installation directory (default `/team-todo`), enter the website address, and confirm HTTPS or HTTP settings.
4. Deploy. The installer checks the environment, installs missing supported Docker/Compose components, and starts the app. No Feishu or model credentials are needed.
5. Open the website, register an account, then create a team and project or apply using a full team code.

HTTPS needs a reachable address and open certificate-validation ports. Team members use the same deployed website to share their data.

[Detailed installer guide](installer/README.md)

<details>
<summary>Manual deployment, team permissions, languages and backups</summary>

### Quick start with Docker

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

### How teams work

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

### Languages

American English (`en-US`) is the default. Select Simplified Chinese (`zh-CN`), Spanish (`es`), Brazilian Portuguese (`pt-BR`) or German (`de`) from the language control. The choice works before login, persists in the browser, and is saved in the account when signed in. Interface text changes; member names, team/project names, task titles and notes remain exactly as written.

### Native Python development

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

### Password recovery and backups

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

### Verification and source delivery

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

</details>
