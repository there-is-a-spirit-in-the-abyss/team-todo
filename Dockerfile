FROM node:22-alpine AS web
WORKDIR /build
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DATABASE_PATH=/app/data/team-todo.db
WORKDIR /app
COPY pyproject.toml README.md ./
COPY team_todo ./team_todo
RUN pip install --no-cache-dir . && useradd --uid 10001 --create-home app && mkdir -p /app/data && chown -R app:app /app
COPY --from=web --chown=app:app /build/dist /app/web/dist
USER app
EXPOSE 8000
CMD ["uvicorn", "team_todo.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
