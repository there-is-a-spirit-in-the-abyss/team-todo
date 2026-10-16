# Execution ledger — docs/IMPLEMENTATION_PLAN.md

- 2026-10-16: User confirmed requirements and authorized completion; GitHub upload explicitly deferred.
- Pre-flight: backend and frontend share docs/DESIGN.md API contract. Feishu and Muse localization workers own separate directories. No Git repositories exist; work stays in the user-designated directories rather than creating worktrees or publishing.
- Default choices: SQLite for self-hosting simplicity; retain any-member approval and creator-only removal; account/language/logout controls are global chrome outside the chooser's three sections.
- Backend test-first: API tests initially failed on missing team_todo module, model tests failed on missing extracted model; account/team/board/reset implementation then passed all 16 tests. Five further operations/security tests passed (21 total).
- Extraction correction: the Feishu localization worker updated the shared reference before model copy. Removed its presentation dependency from the standalone copy; domain rules remain independent. All original nine model tests pass.
- Browser backend runs only against ignored .runtime/browser-test.db; no test accounts or records are installed in the default data path.
- Final backend: 21 tests passed; compileall and pip check passed. Fresh production HTML/assets served through FastAPI without creating a database or seed records.
- Final frontend: clean npm ci; 9 unit tests, production build and 3 real-backend browser tests passed. Desktop/mobile screenshots inspected.
- Independent review found one HTTP LAN UUID fallback issue. Regression observed red, helper changed to canonical UUID v4 via getRandomValues, 9 unit tests and full browser suite green; mobile test disables randomUUID explicitly.
- All three directories audited: no runtime business data, actual environment secret files or credential-format matches outside excluded directories. No GitHub operations. Docker not available; native app and production frontend verified.
