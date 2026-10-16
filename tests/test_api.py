from concurrent.futures import ThreadPoolExecutor
import hashlib
import sqlite3

import pytest
from fastapi.testclient import TestClient

from team_todo.app import create_app

ORIGIN = "http://testserver"


@pytest.fixture
def app(tmp_path):
    return create_app(database_path=tmp_path / "test.db", public_url=ORIGIN)


def client(app):
    return TestClient(app, headers={"Origin": ORIGIN})


def account(app, username, language="en-US"):
    c = client(app)
    response = c.post("/api/auth/register", json={
        "username": username, "password": "correct horse battery", "display_name": username,
        "language": language,
    })
    assert response.status_code == 201, response.text
    c.headers["X-CSRF-Token"] = response.json()["csrf"]
    return c, response.json()["user"]


def create_team(c, name="Product"):
    response = c.post("/api/teams", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()["team"]


def apply(c, team):
    response = c.post(f'/api/teams/{team["id"]}/applications', json={})
    assert response.status_code == 200, response.text


def approve(c, team):
    pending = c.get(f'/api/teams/{team["id"]}/management').json()["applications"]
    response = c.post(f'/api/teams/{team["id"]}/applications/{pending[0]["id"]}/decision',
                      json={"decision": "approve"})
    assert response.status_code == 200, response.text


def test_fresh_install_accounts_hashing_case_uniqueness_and_language(app):
    guest = client(app)
    assert guest.get("/health").json() == {"status": "ok"}
    assert guest.get("/api/auth/session").status_code == 401
    c, user = account(app, "Alice", "de")
    assert user["language"] == "de"
    assert c.get("/api/teams").json() == {"teams": []}
    duplicate = guest.post("/api/auth/register", json={"username": "ALICE", "password": "valid password", "display_name": "Other"})
    assert duplicate.status_code == 409
    with sqlite3.connect(app.state.database.path) as db:
        stored = db.execute("SELECT password_hash FROM users").fetchone()[0]
        assert stored != "correct horse battery" and "correct horse battery" not in stored
        token = c.cookies.get("team_todo_session")
        assert db.execute("SELECT token_hash FROM sessions").fetchone()[0] == hashlib.sha256(token.encode()).hexdigest()
    assert c.patch("/api/auth/profile", json={"language": "pt-BR"}).json()["user"]["language"] == "pt-BR"
    assert c.patch("/api/auth/profile", json={"language": "unsupported"}).status_code == 422
    assert c.post("/api/auth/logout").status_code == 200
    assert c.get("/api/auth/session").status_code == 401
    bad = guest.post("/api/auth/login", json={"username": "alice", "password": "wrong password"})
    assert bad.status_code == 401
    assert guest.post("/api/auth/login", json={"username": "aLiCe", "password": "correct horse battery"}).status_code == 200


def test_origin_csrf_validation_and_no_account_injection(app):
    guest = TestClient(app)
    payload = {"username": "alice", "display_name": "A", "password": "long password"}
    assert guest.post("/api/auth/register", json=payload).status_code == 403
    assert guest.post("/api/auth/register", headers={"Origin": "https://evil.test"}, json=payload).status_code == 403
    c, _ = account(app, "alice")
    c.headers.pop("X-CSRF-Token")
    assert c.post("/api/teams", json={"name": "Unsafe"}).status_code == 403
    assert c.get("/api/teams").json()["teams"] == []
    assert client(app).post("/api/auth/register", json={**payload, "username": "bob", "is_admin": True}).status_code == 422
    assert client(app).post("/api/auth/register", json={**payload, "username": "x", "password": "short"}).status_code == 422


def test_exact_search_rejection_reapply_any_member_approval_and_isolation(app):
    owner, _ = account(app, "owner")
    member, _ = account(app, "member")
    third, third_user = account(app, "third")
    team = create_team(owner)
    other = create_team(owner, "Other team")
    assert team["code"].isdigit() and len(team["code"]) == 10
    assert member.get("/api/teams").json()["teams"] == []
    assert member.get("/api/teams/search", params={"code": team["code"][:4]}).status_code == 404
    result = member.get("/api/teams/search", params={"code": team["code"]}).json()
    assert result["application_status"] == "none"
    assert member.get(f'/api/teams/{team["id"]}/board').status_code == 403
    apply(member, team)
    assert member.get("/api/teams/search", params={"code": team["code"]}).json()["application_status"] == "pending"
    pending = owner.get(f'/api/teams/{team["id"]}/management').json()["applications"][0]
    path = f'/api/teams/{team["id"]}/applications/{pending["id"]}/decision'
    assert owner.post(path, json={"decision": "reject"}).status_code == 200
    assert member.get("/api/teams/search", params={"code": team["code"]}).json()["application_status"] == "none"
    apply(member, team)
    assert owner.post(path, json={"decision": "approve"}).status_code == 404
    approve(owner, team)
    apply(third, team)
    approve(member, team)  # not the creator
    assert third.get("/api/teams/search", params={"code": team["code"]}).json()["application_status"] == "member"
    assert third.get(f'/api/teams/{other["id"]}/management').status_code == 403
    assert {x["id"] for x in member.get("/api/teams").json()["teams"]} == {team["id"]}
    assert member.delete(f'/api/teams/{team["id"]}/members/{third_user["id"]}').status_code == 403


def test_creator_removal_revokes_access_transfer_leave_and_dissolve(app):
    owner, owner_user = account(app, "owner")
    member, member_user = account(app, "member")
    team = create_team(owner)
    apply(member, team)
    approve(owner, team)
    base = f'/api/teams/{team["id"]}'
    assert owner.post(base + "/leave", json={}).status_code == 409
    assert owner.delete(base + f'/members/{owner_user["id"]}').status_code == 409
    assert owner.delete(base + f'/members/{member_user["id"]}').status_code == 200
    assert member.get(base + "/board").status_code == 403
    assert member.post(base + "/actions", json={"revision": 0, "action": {}}).status_code == 403
    apply(member, team)
    approve(owner, team)
    assert owner.post(base + "/transfer", json={"user_id": member_user["id"]}).status_code == 200
    assert owner.post(base + "/leave", json={}).status_code == 200
    assert owner.get(base + "/board").status_code == 403
    assert member.delete(base).status_code == 200
    assert member.get("/api/teams").json()["teams"] == []


def test_conflicting_decisions_only_one_succeeds(app):
    owner, _ = account(app, "owner")
    member, _ = account(app, "member")
    candidate, _ = account(app, "candidate")
    team = create_team(owner)
    apply(member, team)
    approve(owner, team)
    apply(candidate, team)
    pending = owner.get(f'/api/teams/{team["id"]}/management').json()["applications"][0]
    path = f'/api/teams/{team["id"]}/applications/{pending["id"]}/decision'
    with ThreadPoolExecutor(2) as pool:
        responses = list(pool.map(lambda pair: pair[0].post(path, json={"decision": pair[1]}), [(owner, "approve"), (member, "reject")]))
    assert sorted(x.status_code for x in responses) == [200, 409]
    with sqlite3.connect(app.state.database.path) as db:
        count = db.execute("SELECT count(*) FROM memberships WHERE team_id=?", (team["id"],)).fetchone()[0]
    assert count in (2, 3)


def test_board_multiple_projects_revision_author_rights_and_departure(app):
    from uuid import uuid4
    owner, owner_user = account(app, "owner")
    member, _ = account(app, "member")
    team = create_team(owner)
    apply(member, team)
    approve(owner, team)
    base = f'/api/teams/{team["id"]}'
    p1, p2, task = [str(uuid4()) for _ in range(3)]
    def action(c, revision, **fields):
        return c.post(base + "/actions", json={"revision": revision, "action": fields})
    assert action(owner, 0, type="createProject", id=p1, name="One").status_code == 200
    assert action(member, 1, type="createProject", id=p2, name="Two").status_code == 200
    assert action(member, 1, type="createProject", id=str(uuid4()), name="Stale").status_code == 409
    assert action(owner, 2, type="createTask", id=task, title="Original 中文", parent={"kind": "project", "id": p1}).status_code == 200
    assert action(member, 3, type="status", id=task, status="completed").status_code == 403
    # Creator has no authority to edit another author's task either.
    second = str(uuid4())
    assert action(member, 3, type="createTask", id=second, title="Member", parent={"kind": "project", "id": p2}).status_code == 200
    assert action(owner, 4, type="status", id=second, status="completed").status_code == 403
    assert owner.post(base + "/transfer", json={"user_id": member.get("/api/auth/session").json()["user"]["id"]}).status_code == 200
    assert owner.post(base + "/leave", json={}).status_code == 200
    assert action(member, 4, type="status", id=task, status="completed").status_code == 200
    board = member.get(base + "/board").json()
    assert len(board["board"]["projects"]) == 2
    assert board["board"]["tasks"][0]["title"] == "Original 中文"
    departed = next(m for m in board["members"] if m["id"] == owner_user["id"])
    assert departed["active"] is False and departed["name"] == "owner"
    apply(owner, team)
    approve(member, team)
    assert action(member, 5, type="status", id=task, status="pending").status_code == 403
    assert action(owner, 5, type="status", id=task, status="pending").status_code == 200


def test_password_reset_invalidates_all_sessions_without_changing_tasks(app):
    from team_todo.manage import reset_password
    c, user = account(app, "alice")
    team = create_team(c)
    reset_password(app.state.database, "ALICE", "new correct password")
    assert c.get("/api/auth/session").status_code == 401
    c.cookies.clear()
    assert c.post("/api/auth/login", json={"username": "alice", "password": "correct horse battery"}).status_code == 401
    assert c.post("/api/auth/login", json={"username": "alice", "password": "new correct password"}).status_code == 200
    assert c.get("/api/teams").json()["teams"][0]["id"] == team["id"]
