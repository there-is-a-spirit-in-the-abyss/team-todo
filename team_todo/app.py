import os
from pathlib import Path

from fastapi import APIRouter, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException

from team_todo.auth import setup_auth
from team_todo.config import data_path, origin
from team_todo.db import Database
from team_todo.teams import setup_teams


def create_app(database_path=None, public_url=None, static_dir=None):
    public_url = origin(public_url)
    database = Database(data_path(database_path))
    application = FastAPI(title="Team Todo UI", docs_url=None, redoc_url=None, openapi_url=None)
    application.state.database = database
    application.state.public_url = public_url

    @application.exception_handler(HTTPException)
    async def http_error(request, exc):
        detail = exc.detail
        payload = detail if isinstance(detail, dict) else {"detail": detail, "code": "request_failed"}
        return JSONResponse(payload, status_code=exc.status_code, headers=exc.headers)

    @application.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        return JSONResponse({"detail": "Check the submitted fields and try again.", "code": "invalid_input"}, status_code=422)

    @application.middleware("http")
    async def headers_and_origin(request: Request, call_next):
        if request.url.path.startswith("/api/") and request.method not in ("GET", "HEAD", "OPTIONS"):
            if request.headers.get("Origin") != public_url:
                return JSONResponse({"detail": "Page origin does not match PUBLIC_URL.", "code": "origin_invalid"}, status_code=403)
            try:
                length = int(request.headers.get("Content-Length", "0"))
            except ValueError:
                length = 100_001
            if length > 100_000:
                return JSONResponse({"detail": "Request is too large.", "code": "request_too_large"}, status_code=413)
            # Inspect actual streamed bytes too; Content-Length is not a trusted bound.
            total, chunks = 0, []
            async for chunk in request.stream():
                total += len(chunk)
                if total > 100_000:
                    return JSONResponse({"detail": "Request is too large.", "code": "request_too_large"}, status_code=413)
                chunks.append(chunk)
            request._body = b"".join(chunks)
        response = await call_next(request)
        response.headers.update({
            "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
        })
        return response

    router = APIRouter(prefix="/api")
    setup_auth(router, database, public_url)
    setup_teams(router, database)
    from team_todo.boards import setup_boards
    setup_boards(router, database)
    application.include_router(router)

    @application.get("/health")
    def health():
        return {"status": "ok"}

    static = Path(static_dir or os.getenv("STATIC_DIR", "web/dist")).resolve()
    if (static / "assets").is_dir():
        application.mount("/assets", StaticFiles(directory=static / "assets"), name="assets")

    @application.get("/{path:path}")
    def frontend(path: str):
        if path.startswith("api/"):
            return JSONResponse({"detail": "Endpoint not found.", "code": "not_found"}, status_code=404)
        if not (static / "index.html").is_file():
            return JSONResponse({"detail": "Build the frontend with npm run build in web/.", "code": "frontend_unbuilt"}, status_code=503)
        return FileResponse(static / "index.html")

    return application


app = create_app()
