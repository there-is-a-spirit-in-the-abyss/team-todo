import json

from fastapi import Request
from pydantic import Field

from team_todo.model import apply_action
from team_todo.security import Input, fail, identity, team_for


class Mutation(Input):
    revision: int = Field(ge=0, strict=True)
    action: dict


def board_view(connection, team, who):
    active = {row["id"]: row["display_name"] for row in connection.execute(
        "SELECT u.id,u.display_name FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.team_id=?", (team["id"],))}
    people = {row["user_id"]: row["display_name"] for row in connection.execute("SELECT * FROM people WHERE team_id=?", (team["id"],))}
    people.update(active)
    board = json.loads(team["board"])
    for task in board["tasks"]:
        people.setdefault(task["owner"], "Former member")
    colors = ("#217b67", "#466aba", "#ad6b28", "#ac416a")
    members = [{"id": uid, "name": name, "short": name[:1], "color": colors[i % len(colors)],
                "active": uid in active, "role": "creator" if uid == team["creator_id"] else "member" if uid in active else "departed"}
               for i, (uid, name) in enumerate(sorted(people.items()))]
    return {"board": board, "revision": team["revision"], "members": members,
            "actor": who["id"], "csrf": who["csrf"],
            "space": {key: team[key] for key in ("id", "name", "code", "creator_id")}}


def model_error(error):
    message = str(error)
    if isinstance(error, PermissionError):
        return ("project_rename_forbidden", "Only current task authors in a project can rename it.") if "项目" in message else ("task_forbidden", "Only the task author can maintain this task.")
    if "循环" in message or "后代" in message:
        return "cycle_forbidden", "A task cannot be attached to itself or its descendants."
    if "不存在" in message:
        return "task_not_found", "The task or project no longer exists. Refresh and try again."
    if "数量" in message:
        return "board_limit", "The project or task limit has been reached."
    if "备注" in message:
        return "description_too_long", "Notes may contain at most 2,000 characters."
    return "invalid_action", "The task operation contains invalid fields or values."


def setup_boards(router, database):
    @router.get("/teams/{team_id}/board")
    def read(team_id: str, request: Request):
        with database.connect() as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            return board_view(connection, team, who)

    @router.post("/teams/{team_id}/actions")
    def mutate(team_id: str, body: Mutation, request: Request):
        with database.connect(write=True) as connection:
            who = identity(connection, request)
            team = team_for(connection, team_id, who["id"])
            if team["revision"] != body.revision:
                fail(409, "board_conflict", "Another member changed this board. Refresh and try again.")
            members = {row[0] for row in connection.execute("SELECT user_id FROM memberships WHERE team_id=?", (team_id,))}
            try:
                board = apply_action(json.loads(team["board"]), body.action, who["id"], members)
            except (PermissionError, ValueError, TypeError, KeyError) as error:
                code, message = model_error(error)
                fail(403 if isinstance(error, PermissionError) else 422, code, message)
            connection.execute("UPDATE teams SET board=?,revision=revision+1 WHERE id=? AND revision=?", (json.dumps(board, ensure_ascii=False), team_id, body.revision))
            # Retain current names for historical task authors after departure.
            connection.execute("UPDATE people SET display_name=(SELECT display_name FROM users WHERE users.id=people.user_id) WHERE team_id=? AND user_id IN (SELECT user_id FROM memberships WHERE team_id=?)", (team_id, team_id))
            team = connection.execute("SELECT * FROM teams WHERE id=?", (team_id,)).fetchone()
            return board_view(connection, team, who)
