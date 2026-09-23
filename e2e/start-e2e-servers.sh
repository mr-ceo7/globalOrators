#!/bin/bash
# Starts an isolated backend (default :8105, throwaway SQLite, emails simulated) and frontend
# (default :3100). Override with E2E_BACKEND_PORT / E2E_FRONTEND_PORT to run several stacks.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FE_PORT="${E2E_FRONTEND_PORT:-3100}"; BE_PORT="${E2E_BACKEND_PORT:-8105}"
RUN="$ROOT/e2e/.run/stack-$BE_PORT"; mkdir -p "$RUN"; rm -f "$RUN/e2e.db"
cd "$ROOT/backend"
TESTING=true ENVIRONMENT=development DATABASE_URL="sqlite+aiosqlite:///$RUN/e2e.db" \
RESEND_API_KEY="" SMTP_USERNAME="" SMTP_PASSWORD="" STORAGE_LOCAL_ROOT="$RUN/uploads" \
DEFAULT_COACH_EMAIL="head.coach@e2e.test" DEFAULT_COACH_PASSWORD="E2eHeadCoach!2026" COACH_INVITE_CODE="e2e-faculty-invite" \
  ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port "$BE_PORT" > "$RUN/backend.log" 2>&1 &
echo $! > "$RUN/backend.pid"
cd "$ROOT"
E2E_FRONTEND_PORT="$FE_PORT" E2E_BACKEND_PORT="$BE_PORT" VITE_API_URL=/api ./node_modules/.bin/vite --config e2e/vite.e2e.config.ts > "$RUN/frontend.log" 2>&1 &
echo $! > "$RUN/frontend.pid"
