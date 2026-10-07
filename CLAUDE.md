# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Global Orators is a speech & debate coaching platform: a React 19 + Vite + Tailwind v4 SPA (`src/`) backed by a FastAPI + async SQLAlchemy API (`backend/`). The codebase was forked from a fitness-coaching app ("NubianFit"), so much of the domain model still uses fitness names (clients, exercises, programs, workouts, PRs, metrics, habits, photos) repurposed for speakers, drills and curricula. Legacy `nubianfit` identifiers (default SQLite file `backend/nubianfit.db`, `nubianfit_token` localStorage fallback) are intentional and still read.

## Commands

Frontend (repo root):
- `npm run dev` — Vite on port 3000; proxies `/api` to `http://127.0.0.1:8005`
- `npm run build` / `npm run preview`
- `npm run lint` — type-check only (`tsc --noEmit`); there is no ESLint
- `npm test` — Vitest (jsdom, setup in `src/test/setup.ts`)
- Single test: `npx vitest run src/test/CoachLogin.test.tsx` (add `-t "name"` to filter)

Backend (`backend/`, venv at `backend/venv`):
- Run: `cd backend && ./venv/bin/uvicorn app.main:app --reload --port 8005` (docs at `/docs`)
- Tests: `cd backend && ./venv/bin/pytest` — `pytest.ini` points only at `test_api.py`, which sets `TESTING=true`, uses a throwaway `test_globalorators.db` and reseeds fixtures
- Single test: `./venv/bin/pytest test_api.py -k test_name`

Both together: `./start.sh` (kills whatever holds ports 3000/8005, creates the venv if missing, starts both). `./start.sh --seed` also runs `backend/fixtures/seed_data.py`.

## Architecture

### Frontend: portals, not routes
`src/App.tsx` renders one of four "portals" chosen by `currentPortal` in `src/context/AppContext.tsx`:
- `landing` — marketing site (`components/landing/`, `pages/`)
- `onboarding` — `components/onboarding/OnboardingFlow.tsx`
- `speaker_app` — student-facing `ClientPortal` (`components/clientApp/`), gated by `SpeakerLoginPortal`
- `coach_os` — coach dashboard `MainLayout`, gated by `CoachLoginPortal`; inside it, views switch on `activeTab` (dashboard, clients, programs, exercises, calendar, progress, messenger, coaches)

The portal comes from the hostname in production (`coach.` → coach_os, `app.` → speaker_app, `globaloratorsproject.com` → landing); switching portals on the custom domain redirects between subdomains. On localhost / `*.vercel.app` / `?debug_domains`, a `SubdomainSwitcher` lets you switch in-page.

`AppContext.tsx` (~2000 lines) is the central store: auth session, portal/tab state, and the data plus mutation functions for most features. Components read everything through `useApp()`. Check here before adding state or API calls in components.

### Frontend services
- `src/services/apiClient.ts` — the single fetch wrapper. Uses a JWT from localStorage (`globalorators_token`), defaults to base URL `/api` (it ignores `VITE_API_URL` when that points at trycloudflare/ngrok), and calls `clearAuthSession()` on auth failure, which emits `auth:session_cleared`.
- `src/services/sseClient.ts` — Server-Sent Events connection to `/api/events` for realtime updates (messages, typing, calls).
- `src/services/jitsiDiscovery.ts` — resolves the Jitsi domain for live rehearsal and debate rooms (`components/live/`), with a self-hosted instance under `deploy/jitsi`.
- Shared types are in `src/types.ts`.
- Vite `manualChunks` splits bundles by component folder (`portal-coach`, `portal-speaker`, `portal-landing`, …). If you add a folder, update the chunk mapping in `vite.config.ts`.

### Backend
- `app/main.py` sets up the app. Its lifespan hook runs `Base.metadata.create_all` and then **ad-hoc `ALTER TABLE` migrations** inside `_migrate_columns`. There is no Alembic. A new column on an existing table needs an entry there, and usually a matching one in the migration block of `test_api.py`'s setup fixture.
- The layout is `models/` (SQLAlchemy ORM) → `schemas/` (Pydantic) → `routers/` (all mounted under `/api`) → `services/`. The services are email, SSE `events` manager, notifications and the inbound email forwarder.
- `app/config.py` holds pydantic-settings. It uses SQLite (`aiosqlite`) by default and Postgres (`asyncpg`) when `DATABASE_URL` is set; `database.py` normalizes `postgres://` URLs. Production refuses insecure default secrets, invite codes and passwords, and rejects `ENABLE_DEV_SEED`.
- Seeding happens only when `ENABLE_DEV_SEED` or `TESTING` is set (outside production). In production, `BOOTSTRAP_INITIAL_ADMIN` creates the first coach.
- Auth uses a JWT (python-jose) with coach and speaker roles. Speakers can log in with Google OAuth or passwordless email OTP / magic link. Coach signup requires `COACH_INVITE_CODE`.

### Deployment & Production Infrastructure
- The frontend runs on Vercel (`vercel.json`). It sets a strict CSP; add new external hosts for scripts, frames or connections there. It rewrites `/api/*` to the ngrok-backed tunnel (`https://unfenestral-scratchily-lester.ngrok-free.dev/api/:path*`) pointing to the production backend machine, and routes everything else to `index.html`.
- `api/webhooks/resend.ts` is a Vercel serverless function for inbound Resend email webhooks.
- **Production Backend**: Runs on a dedicated machine at `10.42.0.1` managed under systemd (`globalorators-backend` in `/home/qsm/backend/app`), **not Render**. `render.yaml` remains for legacy Render deployments.
  - Service restart: `sudo systemctl restart globalorators-backend`
  - Rollback procedure on production server:
    ```bash
    cd ~/backend && rm -rf app && cp -a app.prev_20261006_230135_curriculum_import app && cp -a .env.bak_20261006_230135_curriculum_import .env && sudo systemctl restart globalorators-backend
    ```
- **AI Infrastructure & Document Parsing**:
  - Gemini key pool (`GEMINI_API_KEY`) powers curriculum import and invoice AI drafting.
  - Galvaniy AI gateway: `http://161.35.100.156` configured via `AI_GATEWAY_URL` and `AI_GATEWAY_TOKEN` (used for PDF/image OCR transcription and backup when Gemini is unavailable). Traffic to this external gateway currently travels over plain HTTP.
  - Security note: Keep `GOOGLE_CLIENT_SECRET` and gateway tokens inside `.env` (readable only by the service owner), not hardcoded in the systemd service unit.
- `scripts/jitsi_tunnel_watchdog.py` and `deploy/*.service` keep the Jitsi tunnel running.

