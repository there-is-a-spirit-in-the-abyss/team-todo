import json
import secrets
import sqlite3
import time
from uuid import uuid4

from fastapi import Request
from pydantic import Field
from typing import Literal

from team_todo.security import Input, creator_only, fail, identity, team_for


class TeamInput(Input):
    name: str = Field(min_length=1, max_length=60)


class Decision(Input):
    decision: Literal["approve", "reject"]


class Transfer(Input):
    user_id: str = Field(min_length=1, max_length=100)


def team_view(connection, team):
    result = {key: team[key] for key in ("id", "code", "name", "creator_id")}
    result["member_count"] = connection.execute("SELECT count(*) FROM memberships WHERE team_id=?", (team["id"],)).fetchone()[0]
    return result


def add_member(connection, team_id, user_id):
    connection.execute("INSERT INTO memberships VALUES(?,?,?)", (team_id, user_id, int(time.time())))
    connection.execute("INSERT INTO people VALUES(?,?,(SELECT display_name FROM users WHERE id=?)) "
                       "ON CONFLICT(team_id,user_id) DO UPDATE SET display_name=excluded.display_name", (team_id, user_id, user_id))


def setup_teams(router, database):
    @router.get("/teams")
    def teams(request: Request):
        with database.connect() as connection:
            who = identity(connection, request)
            rows = connection.execute("SELECT t.* FROM teams t JOIN memberships m ON m.team_id=t.id WHERE m.user_id=? ORDER BY t.name,t.id", (who["id"],)).fetchall()
            return {"teams": [team_view(connection, row) for row in rows]}

    @router.post("/teams", status_code=201)
    def create_team(body: TeamInput, request: Request):
        if not body.name.strip():
            fail(422, "invalid_input")
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team_id = str(uuid4())
            for _ in range(20):
                code = str(secrets.randbelow(9_000_000_000) + 1_000_000_000)
                try:
                    connection.execute("INSERT INTO teams(id,code,name,creator_id,board) VALUES(?,?,?,?,?)", (team_id, code, body.name.strip(), who["id"], json.dumps({"version": 1, "projects": [], "tasks": []})))
                    break
                except sqlite3.IntegrityError:
                    continue
            else:
                fail(503, "try_again")
            add_member(connection, team_id, who["id"])
            return {"team": team_view(connection, connection.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone())}

    @router.get("/teams/search")
    def search(request: Request, code: str = ""):
        with database.connect() as connection:
            who = identity(connection, request)
            # Exact code only. Never return a directory or a partial match.
            if len(code) != 10 or not code.isascii() or not code.isdigit():
                fail(404, "team_not_found")
            team = connection.execute("SELECT * FROM teams WHERE code=?", (code,)).fetchone()
            if team is None:
                fail(404, "team_not_found")
            member = connection.execute("SELECT 1 FROM memberships WHERE team_id=? AND user_id=?", (team["id"], who["id"])).fetchone()
            application = connection.execute("SELECT status FROM applications WHERE team_id=? AND user_id=?", (team["id"], who["id"])).fetchone()
            status = "member" if member else "pending" if application and application["status"] == "pending" else "none"
            return {"team": team_view(connection, team), "application_status": status}

    @router.post("/teams/{team_id}/applications")
    def apply(team_id: str, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            if not connection.execute("SELECT 1 FROM teams WHERE id=?", (team_id,)).fetchone():
                fail(404, "team_not_found")
            if connection.execute("SELECT 1 FROM memberships WHERE team_id=? AND user_id=?", (team_id, who["id"])).fetchone():
                fail(409, "already_member")
            pending = connection.execute("SELECT status FROM applications WHERE team_id=? AND user_id=?", (team_id, who["id"])).fetchone()
            if pending and pending["status"] == "pending":
                return {"status": "pending"}
            connection.execute("INSERT INTO applications(id,team_id,user_id,status,created_at) VALUES(?,?,?,'pending',?) "
                               "ON CONFLICT(team_id,user_id) DO UPDATE SET id=excluded.id,status='pending',created_at=excluded.created_at,decided_by=NULL,decided_at=NULL",
                               (str(uuid4()), team_id, who["id"], int(time.time())))
            return {"status": "pending"}

    @router.get("/teams/{team_id}/management")
    def management(team_id: str, request: Request):
        with database.connect() as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            members = connection.execute("SELECT u.id,u.display_name AS name,u.username FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.team_id=? ORDER BY m.joined_at,u.id", (team_id,)).fetchall()
            applications = connection.execute("SELECT a.id,a.user_id,a.created_at,u.display_name,u.username FROM applications a JOIN users u ON u.id=a.user_id WHERE a.team_id=? AND a.status='pending' ORDER BY a.created_at,a.id", (team_id,)).fetchall()
            return {"team": team_view(connection, team), "members": [dict(row) for row in members], "applications": [dict(row) for row in applications]}

    @router.post("/teams/{team_id}/applications/{application_id}/decision")
    def decide(team_id: str, application_id: str, body: Decision, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team_for(connection, team_id, who["id"])
            application = connection.execute("SELECT * FROM applications WHERE id=? AND team_id=?", (application_id, team_id)).fetchone()
            if application is None:
                fail(404, "application_not_found")
            if application["status"] != "pending":
                fail(409, "application_decided")
            status = "approved" if body.decision == "approve" else "rejected"
            if status == "approved":
                add_member(connection, team_id, application["user_id"])
            connection.execute("UPDATE applications SET status=?,decided_by=?,decided_at=? WHERE id=?", (status, who["id"], int(time.time()), application_id))
            return {"status": status}

    @router.delete("/teams/{team_id}/members/{user_id}")
    def remove(team_id: str, user_id: str, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            creator_only(team, who["id"])
            if user_id == team["creator_id"]:
                fail(409, "creator_must_transfer")
            if not connection.execute("DELETE FROM memberships WHERE team_id=? AND user_id=?", (team_id, user_id)).rowcount:
                fail(404, "member_not_found")
            return {"ok": True}

    @router.post("/teams/{team_id}/leave")
    def leave(team_id: str, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            if team["creator_id"] == who["id"]:
                fail(409, "creator_must_transfer")
            connection.execute("DELETE FROM memberships WHERE team_id=? AND user_id=?", (team_id, who["id"]))
            return {"ok": True}

    @router.post("/teams/{team_id}/transfer")
    def transfer(team_id: str, body: Transfer, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            creator_only(team, who["id"])
            if body.user_id == who["id"]:
                fail(422, "invalid_transfer")
            if not connection.execute("SELECT 1 FROM memberships WHERE team_id=? AND user_id=?", (team_id, body.user_id)).fetchone():
                fail(404, "member_not_found")
            connection.execute("UPDATE teams SET creator_id=? WHERE id=?", (body.user_id, team_id))
            return {"team": team_view(connection, connection.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone())}

    @router.delete("/teams/{team_id}")
    def dissolve(team_id: str, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            creator_only(team, who["id"])
            connection.execute("DELETE FROM teams WHERE id=?", (team_id,))
            return {"ok": True}
