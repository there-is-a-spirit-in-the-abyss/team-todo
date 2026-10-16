import os
from pathlib import Path
from urllib.parse import urlsplit

LANGUAGES = ("en-US", "zh-CN", "es", "pt-BR", "de")


def origin(value=None):
    value = (value or os.getenv("PUBLIC_URL", "http://localhost:8000")).rstrip("/")
    parsed = urlsplit(value)
    if (parsed.scheme not in ("http", "https") or not parsed.netloc or parsed.path
            or parsed.query or parsed.fragment or parsed.username or parsed.password):
        raise ValueError("PUBLIC_URL must be an HTTP(S) origin without a path")
    return value


def data_path(value=None):
    return Path(value or os.getenv("DATABASE_PATH", "data/team-todo.db")).resolve()
