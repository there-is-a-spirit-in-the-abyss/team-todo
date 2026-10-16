import secrets
import sqlite3
import time
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Request, Response
from pydantic import Field

from team_todo.security import COOKIE, SESSION_SECONDS, Input, digest, fail, identity, password_hash, user_view, verify_password

Language = Literal["en-US", "zh-CN", "es", "pt-BR", "de"]
Username = r"^[A-Za-z0-9][A-Za-z0-9_.-]{2,31}$"


class Registration(Input):
    username: str = Field(pattern=Username, min_length=3, max_length=32)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=60)
    language: Language = "en-US"


class Login(Input):
    username: str = Field(min_length=1, max_length=32)
    password: str = Field(min_length=1, max_length=128)


class Profile(Input):
    language: Language


def issue_session(connection, response, user, secure):
    token, csrf = secrets.token_urlsafe(48), secrets.token_urlsafe(32)
    now = int(time.time())
    connection.execute("DELETE FROM sessions WHERE expires_at<=?", (now,))
    connection.execute("INSERT INTO sessions VALUES(?,?,?,?)", (digest(token), user["id"], csrf, now + SESSION_SECONDS))
    response.set_cookie(COOKIE, token, max_age=SESSION_SECONDS, httponly=True, secure=secure, samesite="lax", path="/")
    return {"user": user_view(user), "csrf": csrf}


def setup_auth(router: APIRouter, database, public_url):
    # Bound expensive password hashing before starting any account transaction.
    def limit(request, operation):
        now = int(time.time())
        ip = request.client.host if request.client else "unknown"
        bucket = operation + ":" + ip
        with database.connect(write=True) as connection:
            connection.execute("DELETE FROM auth_attempts WHERE created_at<=?", (now - 3600,))
            count = connection.execute("SELECT count(*) FROM auth_attempts WHERE bucket=? AND created_at>?", (bucket, now - 600)).fetchone()[0]
            if count >= 20:
                fail(429, "rate_limited")
            connection.execute("INSERT INTO auth_attempts VALUES(?,?)", (bucket, now))

    @router.post("/auth/register", status_code=201)
    def register(body: Registration, request: Request, response: Response):
        if not body.display_name.strip():
            fail(422, "invalid_input")
        limit(request, "register")
        hashed = password_hash(body.password)
        with database.connect(write=True) as connection:
            try:
                user_id = str(uuid4())
                connection.execute("INSERT INTO users VALUES(?,?,?,?,?)", (user_id, body.username.lower(), body.display_name.strip(), hashed, body.language))
            except sqlite3.IntegrityError:
                fail(409, "username_taken")
            user = connection.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
            return issue_session(connection, response, user, public_url.startswith("https:"))

    @router.post("/auth/login")
    def login(body: Login, request: Request, response: Response):
        limit(request, "login")
        with database.connect() as connection:
            user = connection.execute("SELECT * FROM users WHERE username=? COLLATE NOCASE", (body.username,)).fetchone()
        # Unknown users cost the same hash operation as known users.
        stored = user["password_hash"] if user else dummy_hash
        valid = verify_password(body.password, stored)
        if not user or not valid:
            fail(401, "invalid_credentials")
        with database.connect(write=True) as connection:
            current = connection.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
            # A password reset racing verification may not issue a stale session.
            if current["password_hash"] != stored:
                fail(401, "invalid_credentials")
            old = request.cookies.get(COOKIE)
            if old:
                connection.execute("DELETE FROM sessions WHERE token_hash=?", (digest(old),))
            return issue_session(connection, response, current, public_url.startswith("https:"))

    @router.get("/auth/session")
    def session(request: Request):
        with database.connect() as connection:
            user = identity(connection, request)
            return {"user": user_view(user), "csrf": user["csrf"]}

    @router.patch("/auth/profile")
    def profile(body: Profile, request: Request):
        with database.connect(write=True) as connection:
            user = identity(connection, request)
            connection.execute("UPDATE users SET language=? WHERE id=?", (body.language, user["id"]))
            current = connection.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
            return {"user": user_view(current), "csrf": user["csrf"]}

    @router.post("/auth/logout")
    def logout(request: Request, response: Response):
        with database.connect(write=True) as connection:
            user = identity(connection, request)
            connection.execute("DELETE FROM sessions WHERE token_hash=?", (user["token_hash"],))
        response.delete_cookie(COOKIE, path="/")
        return {"ok": True}


# One fixed dummy verifier per process, not a user or seeded account.
dummy_hash = password_hash("invalid-dummy-login-" + secrets.token_hex(16))
