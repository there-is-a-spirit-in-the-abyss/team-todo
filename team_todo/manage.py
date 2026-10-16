"""Local operator tools. No public password-reset endpoint is exposed."""
import argparse
import getpass
from pathlib import Path
import sqlite3
import sys

from team_todo.config import data_path
from team_todo.db import Database
from team_todo.security import password_hash


def reset_password(database, username, password):
    if not 8 <= len(password) <= 128:
        raise ValueError("Password must contain 8 to 128 characters.")
    if not database.path.is_file():
        raise ValueError("Database does not exist. Check DATABASE_PATH.")
    hashed = password_hash(password)
    with database.connect(write=True) as connection:
        user = connection.execute("SELECT id FROM users WHERE username=? COLLATE NOCASE", (username,)).fetchone()
        if user is None:
            raise ValueError("Username not found.")
        connection.execute("UPDATE users SET password_hash=? WHERE id=?", (hashed, user["id"]))
        connection.execute("DELETE FROM sessions WHERE user_id=?", (user["id"],))


def backup(database, destination):
    destination = Path(destination).resolve()
    if not database.path.is_file():
        raise ValueError("Database does not exist. Check DATABASE_PATH.")
    if destination == database.path.resolve() or destination.exists():
        raise ValueError("Backup destination must be a new file.")
    # Exclusive creation avoids overwriting an existing backup in a race.
    with destination.open("xb"):
        pass
    try:
        with sqlite3.connect(database.path.as_uri() + "?mode=ro", uri=True) as source:
            with sqlite3.connect(destination) as target:
                source.backup(target)
                if target.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                    raise ValueError("Backup integrity check failed.")
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
    return destination


def main():
    parser = argparse.ArgumentParser(description="Team Todo local administration")
    sub = parser.add_subparsers(dest="command", required=True)
    reset = sub.add_parser("reset-password", help="Reset password and invalidate sessions")
    reset.add_argument("username")
    reset.add_argument("--password-stdin", action="store_true")
    copy = sub.add_parser("backup", help="Create a consistent SQLite backup")
    copy.add_argument("destination")
    args = parser.parse_args()
    database = Database(data_path())
    try:
        if args.command == "reset-password":
            if args.password_stdin:
                password = sys.stdin.readline().rstrip("\r\n")
            else:
                password = getpass.getpass("New password: ")
                if password != getpass.getpass("Confirm new password: "):
                    raise ValueError("Passwords do not match.")
            reset_password(database, args.username, password)
            print("Password reset. All sessions for this user were invalidated.")
        else:
            print("Backup created:", backup(database, args.destination))
    except (ValueError, sqlite3.Error, OSError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
