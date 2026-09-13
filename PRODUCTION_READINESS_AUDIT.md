# Global Orators Production Readiness Audit

**Audit date:** 2026-09-13  
**Verdict:** **Not production-ready**

The frontend builds and its tests pass, and the backend test passes. However, the application has multiple release-blocking security, privacy, and reliability defects. It should not be exposed to real users or real client data until the P0 issues are resolved.

## Executive summary

The most serious issue is that nearly all business API routes are unauthenticated. Anyone who can reach the backend can read, modify, or delete client data, workouts, messages, metrics, photos, programs, habits, exercises, and activity records.

Authentication also has critical weaknesses:

- Google credentials can be forged because the fallback path decodes an unsigned JWT payload.
- JWT signing secrets, a default coach password, and a Google client secret are hard-coded in application configuration.
- Registration is public and accepts a caller-controlled role.
- CORS is configured with `*` while credentials are enabled.

The deployment also relies on SQLite and in-memory inquiry storage, which is unsuitable for durable, horizontally scaled production operation.

## Findings

| Priority | Finding | Evidence / impact |
|---|---|---|
| **P0** | **Business API is effectively unauthenticated** | Client, workout, message, metric, photo, program, habit, exercise, PR, activity, and inquiry routes do not depend on `get_current_user`. Anyone can read, modify, or delete records. Examples: `backend/app/routers/clients.py:21-199`, `backend/app/routers/messages.py:19-54`, and all router coverage. This is a complete data disclosure and destructive-write vulnerability. |
| **P0** | **Google authentication can be forged** | `backend/app/routers/auth.py:92-118` falls back to base64-decoding any JWT-looking string after verification fails. The signature is never validated. An attacker can submit a fabricated email/name and receive a valid application JWT. |
| **P0** | **Hard-coded production credentials and signing secret** | `backend/app/config.py:21-32` contains the JWT secret, default coach password, and Google client secret. The values are also present in repository history (`c5ecfed`). Rotate all of them immediately; changing only the current file is insufficient. |
| **P0** | **Open registration with role assignment** | `backend/app/routers/auth.py:21-52` allows unauthenticated account creation and accepts a caller-controlled `role` at `auth.py:37`. A caller can create coach accounts without approval. |
| **P0** | **CORS is unrestricted with credentials enabled** | `backend/app/config.py:35-41` includes `*`; `backend/app/main.py:65-72` enables `allow_credentials=True`, all methods, and all headers. This permits unsafe cross-origin access patterns and does not establish a production origin allowlist. |
| **P1** | **Speaker lookup exposes personal records without authentication** | `clients.py:48-74` allows lookup by email, name, or phone and returns the full client response. This enables enumeration and exposes health, onboarding, progress, and coach-note data. |
| **P1** | **Public inquiry administration endpoint** | `backend/app/routers/inquiries.py:43-46` exposes all submitted inquiries to anyone. Submissions are stored only in `_inquiries_db` at `:16-17`, so they disappear on restart and are inconsistent across multiple instances. |
| **P1** | **WebRTC signaling has no authentication or authorization** | `backend/app/routers/webrtc.py:47-62` accepts any room ID and relays arbitrary messages to every participant. Anyone who guesses or obtains a room ID can join and inject signaling data. State is process-local and does not scale horizontally. |
| **P1** | **Default deployment uses unsuitable persistence** | `render.yaml` provisions SQLite on a free web service and runs seed logic during build. Render’s local filesystem is not a durable production database, and the free service is not appropriate for client records or reliable availability. |
| **P1** | **No rate limiting or abuse controls** | Login, registration, Google auth, speaker lookup, inquiries, and all mutation routes lack throttling, lockout, quotas, or request-size controls. The public inquiry endpoint is especially vulnerable to spam. |
| **P1** | **JWTs and sensitive profiles are stored in `localStorage`** | `src/services/apiClient.ts` and `AppContext.tsx` persist bearer tokens, user records, speaker profiles, and client-related data in browser storage. Any XSS or compromised third-party script can extract credentials and private data. |
| **P1** | **Frontend hides backend failures and can fall back to stale/local data** | `AppContext.tsx` uses many `.catch(() => null)` calls around API loading. This can make a production outage appear as an empty or stale application instead of surfacing a failure, creating dangerous data-consistency ambiguity. |
| **P2** | **Production deployment configuration is incomplete/misaligned** | `render.yaml` defines only the backend, while `vercel.json` defines only SPA rewrites. The example frontend API URL points at `https://meet.globalorators.com/api`, but no matching backend routing or production CORS configuration is defined. |
| **P2** | **Public API documentation is enabled** | `/docs` and `/redoc` remain enabled in `backend/app/main.py:57-63`. This is not automatically a vulnerability, but it unnecessarily exposes the entire API surface in production. |
| **P2** | **Unbounded list endpoints** | Most collection endpoints return all records without pagination or limits. This will degrade as clients, messages, workouts, photos, and activity records grow. |
| **P2** | **Dependency and bundle warnings** | `npm audit` reports three moderate vulnerabilities through `express`/`qs`. The production JavaScript bundle is approximately 1.1 MB minified, triggering Vite’s chunk-size warning. |
| **P2** | **Insufficient negative/security test coverage** | Existing tests primarily verify successful flows. They do not assert that unauthenticated reads/writes fail, roles are enforced, forged Google credentials are rejected, records are tenant-isolated, or CORS is restricted. Frontend tests also emit `act()` and browser API warnings. |

## Validation results

| Area | Result |
|---|---|
| Frontend TypeScript check | Passed |
| Frontend tests | Passed: 75 tests across 11 files |
| Frontend production build | Passed |
| Backend tests | Passed: 1 test |
| npm dependency audit | Failed: 3 moderate vulnerabilities reported |
| Production security posture | Failed |

Passing functional tests do not validate the security boundary, authorization model, tenant isolation, or operational durability.

## Minimum release gate

Before production deployment:

1. Remove the unsigned Google fallback and rotate all exposed secrets.
2. Require authenticated, role-checked access on every private route.
3. Enforce per-user and per-client authorization to prevent IDOR and cross-client access.
4. Replace open registration with controlled onboarding and remove caller-selected privileged roles.
5. Restrict CORS to exact production origins and add production security headers.
6. Move from local SQLite and in-memory inquiries to durable managed storage with migrations, backups, and multi-instance-safe behavior.
7. Authenticate WebSocket rooms and add rate limits, payload limits, audit logging, and abuse protection.
8. Add unauthorized-access, IDOR, forged-auth, data-isolation, and persistence tests.
9. Add pagination and server-side limits to collection endpoints.
10. Review and remediate dependency vulnerabilities and split the oversized frontend bundle.

## Final assessment

Classify the application as **development/demo-ready, not production-ready** until the P0 and P1 findings are remediated and verified with security-focused tests.
