# Standalone Team Todo design — 2026-10-16

The user approved implementation in the chat. This directory is an independent, self-hosted application extracted from Huiyang's team board. No GitHub publication is authorized in this phase. All three projects must ship without real users, tasks, databases, credentials, or deployment logs.

## Product rules

- Accounts use a case-insensitive unique username, password and display name. Open registration, no email or third-party identity. Operator password reset through a local CLI invalidates sessions.
- Every installation represents one enterprise. Users can create and join multiple teams; each team contains multiple projects and a shared staging area.
- The team chooser has exactly three functional sections: joined teams, create team, exact team-code search. No enterprise directory or list of other teams. Account/language/logout controls are global chrome.
- Search shows apply (including rejected requests), pending, or joined. Membership is required to enter or read a board. Requests are reviewed inside the team by ANY current member. Only the current creator can remove members. A removed member may apply again.
- Members may leave; the creator must transfer ownership to another member first. The creator can dissolve a team through a deliberate confirmation. This does not change board permissions.
- Preserve the extracted pure board model: immutable authors, pending/completed/discarded, author-only edits and subtree deletion (including others' descendants), anyone moves subtrees, no cycles, departed authors' tasks become maintainable by current members, return shows current state, used empty roots disappear, unused empty roots persist, completed/discarded both count as ended. Creator has no special task override. No deadlines, reminders or weekly reports.
- Languages: en-US default; zh-CN, es, pt-BR, de selectable. Local choice works before login and persists to the user profile after login. User-authored text is never translated.

## Architecture

FastAPI synchronous endpoints use Python sqlite3, WAL, foreign keys and immediate write transactions. A file-backed database and static frontend run in one container, with a persistent data volume. React/React Flow/Dagre retain the task tree and responsive UI. No Feishu, Muse, LLM, mail or external identity dependencies.

Passwords use salted PBKDF2-SHA256, constant-time verification and bounded inputs. Server sessions store only token hashes and expire in eight hours; HTTP-only SameSite=Lax cookies are Secure on HTTPS. All unsafe requests require configured exact Origin; authenticated unsafe requests also require a session CSRF token. Local HTTP is supported explicitly through PUBLIC_URL; deployments on other hosts must configure it. Rate limits constrain login/registration. Errors are stable codes with human-readable detail. Request body sizes, field lengths and board limits are bounded.

Membership checks and board writes share a transaction. Optimistic revision checks reject stale writes with 409. Approval decisions are serialized; removal revokes access on the next request. Historical author display names survive leaving. Multi-worker SQLite writes serialize; default deployment is one Uvicorn worker.

## API contract

All JSON errors: `{detail: string, code: string}`. Codes use snake_case. GETs need a session except health, frontend and registration/login. Unsafe requests send Origin matching PUBLIC_URL; authenticated unsafe requests send X-CSRF-Token. Frontend uses relative URLs.

- `GET /api/auth/session` -> `{user:{id,username,display_name,language},csrf}`.
- `POST /api/auth/register` body `{username,password,display_name,language}` -> same session shape, signed in automatically.
- `POST /api/auth/login` body `{username,password}` -> same session shape.
- `POST /api/auth/logout` -> `{ok:true}`.
- `PATCH /api/auth/profile` body `{language}` -> session shape.
- `GET /api/teams` -> `{teams:[Team]}`; `POST /api/teams` body `{name}` -> `{team:Team}`.
- `GET /api/teams/search?code=...` -> `{team:Team,application_status:'none'|'pending'|'member'}`. Unknown code -> 404. Rejected requests map to none.
- `POST /api/teams/{id}/applications` body `{}` -> `{status:'pending'}`.
- `GET /api/teams/{id}/management` -> `{team:Team,members:[{id,name,username}],applications:[{id,user_id,display_name,username,created_at}]}`. Any current member.
- `POST /api/teams/{id}/applications/{application_id}/decision` body `{decision:'approve'|'reject'}` -> `{status:'approved'|'rejected'}`; decided requests -> 409.
- `DELETE /api/teams/{id}/members/{user_id}` creator-only -> `{ok:true}`; cannot remove creator.
- `POST /api/teams/{id}/leave` body `{}` -> `{ok:true}`; creator must transfer first.
- `POST /api/teams/{id}/transfer` body `{user_id}` -> `{team:Team}`; creator-only, target must be a current member.
- `DELETE /api/teams/{id}` creator-only -> `{ok:true}`.
- `GET /api/teams/{id}/board` -> `{board,revision,members,actor,csrf,space:{id,name,code,creator_id}}`. `members` retains the original UI fields id/name/short/color/active/role. `role` is `member`, `creator`, or `departed`, translated in the frontend.
- `POST /api/teams/{id}/actions` body `{revision,action}` -> same board shape.

`Team` is `{id,code,name,creator_id,member_count}`. Identifiers are UUID strings; code is a random ten-digit string with collision retry. No seed accounts or tasks are created. Request locale errors can be translated by the frontend from `code`; unknown codes display detail.

## Validation and delivery

Real SQLite API tests exercise registration uniqueness, password hashing, login/logout/reset, CSRF/origin, exact search, isolation, any-member approval, rejection/reapply, conflicting decisions, creator-only removal, leave/transfer, stale revisions, historical authors, and copied board rules. Browser tests use the real API for two accounts, team applications, board persistence, language switching and narrow layout. Production build and a fresh empty installation are checked. Docker validation is reported separately if Docker is unavailable. Git ignores data, runtime evidence, caches and secrets. README explains deployment, language configuration, permissions, password recovery, backups and the extraction source.
