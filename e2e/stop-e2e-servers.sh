#!/bin/bash
# Stops the isolated e2e servers started by start-e2e-servers.sh.
FE_PORT="${E2E_FRONTEND_PORT:-3100}"; BE_PORT="${E2E_BACKEND_PORT:-8105}"
RUN="$(cd "$(dirname "$0")" && pwd)/.run/stack-$BE_PORT"
for f in backend frontend; do
  [ -f "$RUN/$f.pid" ] && kill "$(cat "$RUN/$f.pid")" 2>/dev/null
done
for port in "$BE_PORT" "$FE_PORT"; do
  pid=$(ss -ltnp "sport = :$port" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
  [ -n "$pid" ] && kill "$pid" 2>/dev/null
done
true
