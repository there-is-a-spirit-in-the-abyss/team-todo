import hashlib
import hmac
import secrets
import time

from fastapi import HTTPException, Request
from pydantic import BaseModel, ConfigDict

COOKIE = "team_todo_session"
SESSION_SECONDS = 8 * 3600


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=False)


def fail(status, code, detail=None):
    raise HTTPException(status, detail={"code": code, "detail": detail or code.replace("_", " ").capitalize()})


def digest(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def password_hash(password):
    salt = secrets.token_bytes(16)
    rounds = 600_000
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, rounds)
    return f"pbkdf2_sha256${rounds}${salt.hex()}${hashed.hex()}"


def verify_password(password, stored):
    algorithm, iterations, salt, expected = stored.split("$")
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), int(iterations))
    return algorithm == "pbkdf2_sha256" and hmac.compare_digest(hashed.hex(), expected)


def identity(connection, request: Request):
    token = request.cookies.get(COOKIE, "")
    row = connection.execute(
        "SELECT u.*, s.csrf, s.token_hash, s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id "
        "WHERE s.token_hash=? AND s.expires_at>?", (digest(token), int(time.time()))
    ).fetchone() if token else None
    if row is None:
        fail(401, "auth_required")
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        supplied = request.headers.get("X-CSRF-Token", "")
        if not hmac.compare_digest(supplied.encode(), row["csrf"].encode()):
            fail(403, "csrf_invalid")
    return row


def user_view(user):
    return {key: user[key] for key in ("id", "username", "display_name", "language")}


def team_for(connection, team_id, user_id):
    team = connection.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone()
    if team is None:
        fail(404, "team_not_found")
    if not connection.execute("SELECT 1 FROM memberships WHERE team_id=? AND user_id=?", (team_id, user_id)).fetchone():
        fail(403, "not_member")
    return team


def creator_only(team, user_id):
    if team["creator_id"] != user_id:
        fail(403, "creator_only")
