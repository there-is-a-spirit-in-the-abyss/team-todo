from contextlib import closing, contextmanager
from pathlib import Path
import sqlite3
import threading

SCHEMA = """
CREATE TABLE IF NOT EXISTS schema_version(version INTEGER PRIMARY KEY);
INSERT OR IGNORE INTO schema_version VALUES(1);
CREATE TABLE IF NOT EXISTS users(
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
 display_name TEXT NOT NULL, password_hash TEXT NOT NULL,
 language TEXT NOT NULL DEFAULT 'en-US'
);
CREATE TABLE IF NOT EXISTS sessions(
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 csrf TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS teams(
 id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 creator_id TEXT NOT NULL REFERENCES users(id), board TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS memberships(
 team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 joined_at INTEGER NOT NULL, PRIMARY KEY(team_id,user_id)
);
CREATE INDEX IF NOT EXISTS memberships_user ON memberships(user_id);
CREATE TABLE IF NOT EXISTS people(
 team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id), display_name TEXT NOT NULL,
 PRIMARY KEY(team_id,user_id)
);
CREATE TABLE IF NOT EXISTS applications(
 id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),
 created_at INTEGER NOT NULL, decided_by TEXT REFERENCES users(id), decided_at INTEGER,
 UNIQUE(team_id,user_id)
);
CREATE TABLE IF NOT EXISTS auth_attempts(
 bucket TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_attempts_bucket ON auth_attempts(bucket,created_at);
"""


class Database:
    def __init__(self, path):
        self.path = Path(path)
        self._ready = False
        self._lock = threading.Lock()

    def _open(self):
        connection = sqlite3.connect(self.path, timeout=15, isolation_level=None)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys=ON")
        connection.execute("PRAGMA busy_timeout=15000")
        return connection

    def initialize(self):
        if self._ready:
            return
        with self._lock:
            if self._ready:
                return
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with closing(self._open()) as connection:
                connection.execute("PRAGMA journal_mode=WAL")
                connection.executescript(SCHEMA)
                if connection.execute("SELECT MAX(version) FROM schema_version").fetchone()[0] != 1:
                    raise RuntimeError("Unsupported database schema")
            self._ready = True

    @contextmanager
    def connect(self, write=False):
        self.initialize()
        connection = self._open()
        try:
            connection.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()
