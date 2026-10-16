import json
import sqlite3
import subprocess
import sys
import time

from fastapi.testclient import TestClient

from team_todo.app import create_app
from team_todo.manage import backup

from test_api import account, client, create_team, ORIGIN


def test_fresh_health_does_not_create_a_database_or_seed_records(tmp_path):
    database_path = tmp_path / "empty.db"
    app = create_app(database_path, ORIGIN)
    assert not database_path.exists()
    c = client(app)
    assert c.get("/health").status_code == 200
    assert not database_path.exists()
    assert c.get("/api/auth/session").status_code == 401
    with sqlite3.connect(database_path) as db:
        for table in ("users", "teams", "memberships", "applications", "sessions"):
            assert db.execute(f"SELECT count(*) FROM {table}").fetchone()[0] == 0


def test_expired_sessions_invalid_csrf_and_request_size(tmp_path):
    app = create_app(tmp_path / "test.db", ORIGIN)
    c, _ = account(app, "alice")
    c.headers["X-CSRF-Token"] = "wrong"
    assert c.post("/api/teams", json={"name": "Blocked"}).json()["code"] == "csrf_invalid"
    assert c.post("/api/teams", content=b" " * 100001, headers={"Content-Type": "application/json"}).status_code == 413
    # Also enforce the body limit on streams without Content-Length.
    assert c.post("/api/teams", content=iter([b" " * 60000, b" " * 60000]), headers={"Content-Type": "application/json"}).status_code == 413
    with app.state.database.connect(write=True) as db:
        db.execute("UPDATE sessions SET expires_at=?", (int(time.time()) - 1,))
    assert c.get("/api/teams").status_code == 401


def test_https_cookie_backup_integrity_and_cli_no_clobber(tmp_path):
    import os
    app = create_app(tmp_path / "test.db", "https://testserver")
    c = TestClient(app, base_url="https://testserver", headers={"Origin": "https://testserver"})
    response = c.post("/api/auth/register", json={"username": "alice", "password": "correct password", "display_name": "Alice"})
    cookie = response.headers["set-cookie"].lower()
    assert "secure" in cookie and "httponly" in cookie and "samesite=lax" in cookie
    destination = tmp_path / "backup.db"
    backup(app.state.database, destination)
    with sqlite3.connect(destination) as db:
        assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        assert db.execute("SELECT username FROM users").fetchone()[0] == "alice"
    result = subprocess.run([sys.executable, "-m", "team_todo.manage", "backup", str(destination)],
                            env={**os.environ, "DATABASE_PATH": str(app.state.database.path)}, capture_output=True)
    assert result.returncode == 1 and b"new file" in result.stderr


def test_auth_rate_limit_is_persistent_and_does_not_create_accounts(tmp_path):
    app = create_app(tmp_path / "test.db", ORIGIN)
    c = client(app)
    with app.state.database.connect(write=True) as db:
        db.executemany("INSERT INTO auth_attempts VALUES(?,?)", [("register:testclient", int(time.time()))] * 20)
    response = c.post("/api/auth/register", json={"username": "alice", "password": "correct password", "display_name": "A"})
    assert response.status_code == 429 and response.json()["code"] == "rate_limited"
    with app.state.database.connect() as db:
        assert db.execute("SELECT count(*) FROM users").fetchone()[0] == 0


def test_production_spa_assets_and_unknown_api_routes(tmp_path):
    static = tmp_path / "web"
    (static / "assets").mkdir(parents=True)
    (static / "index.html").write_text("<!doctype html><title>Team Todo</title>", encoding="utf-8")
    (static / "assets" / "app.js").write_text("console.log('app')", encoding="utf-8")
    c = client(create_app(tmp_path / "test.db", ORIGIN, static))
    assert c.get("/teams/not-a-real-team").status_code == 200
    assert c.get("/assets/app.js").status_code == 200
    response = c.get("/api/unknown")
    assert response.status_code == 404 and response.json()["code"] == "not_found"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]
