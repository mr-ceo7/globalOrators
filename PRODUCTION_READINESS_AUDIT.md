# Global Orators Production Readiness Audit

**Audit date:** 2026-09-14
**Scope:** Full application audit focused on demo/mock/static behavior, dynamic-data integrity, persistence, authentication, deployment configuration, and production validation
**Verdict:** **NO-GO for professional public production**

The latest remediation is meaningful: the frontend no longer imports the large mock-data collection, business collections initialize empty, automatic coach login was removed, the Google button no longer displays a mock-token simulator, and Render no longer runs the demo seed script during its build. The application still is not a trustworthy production system because several user-facing workflows can fabricate records or claims, keep data only in React/browser state, or fall back to unverified identity data.

## Executive summary

The app now has a real API/database path for the core coach records, but it is not yet consistently API-first:

- Google authentication still falls back to decoding an arbitrary JWT-shaped string in the browser and creating a synthetic user/client when the backend rejects the credential.
- The speaker portal still generates roadmap sessions, habit logs, profile defaults, evaluation entries, journal entries, and executive simulations locally.
- Recording controls do not record or analyze audio; they present “Analysis coming soon” behavior and local UI state.
- Portal copy and metrics contain fixed claims such as `42 min estimated duration`, `Optimal Cadence`, `Top 5% Tier`, `High-Stakes Gravitas`, and `Voice Dispatch · Circle 07 Briefing` without a complete persisted source of truth.
- Failed mutations commonly leave optimistic records in UI state after the API call fails. There is no rollback, durable retry queue, or pending/failed status.
- The repository still contains `src/data/mockData.ts`, `backend/seed_data.json`, and a local `start.sh` path that seeds a database. These are not currently used by the Render production build, but they remain easy to reintroduce and require isolation.
- Production configuration still has insecure development defaults in source, a hardcoded Google client ID fallback, and a production startup bootstrap account that needs an explicit credential-rotation and ownership procedure.

Passing automated tests proves that the current implementation behaves as tested; it does not prove that production users see only authenticated, persisted, server-derived data.

## Severity summary

| Severity | Count | Meaning |
|---|---:|---|
| Critical | 3 | Authentication or user-facing behavior can fabricate identity or production records |
| High | 7 | Core workflows are not durably dynamic, can misrepresent saved state, or expose unsupported claims |
| Medium | 5 | Deployment hygiene, maintainability, and operational safeguards are incomplete |

## Critical findings

### C1. Google authentication still has an unsafe synthetic-user fallback

**Evidence**

- `src/context/AppContext.tsx` catches a failed `authApi.googleAuth()` call and decodes `credential.split('.')[1]` with `atob`.
- It then constructs a local `mockUser`, accepts fallback email/name values, and creates a client with fixed program, health, performance, and coaching fields.
- The fallback can return `{ success: true }` without a server-issued user or token.

**Impact**

A failed verification, unavailable backend, malformed credential, or service misconfiguration can appear as a successful login. The resulting speaker profile is not authenticated, not guaranteed to exist in the database, and is populated with fabricated records.

**Required fix**

Delete the fallback decode and synthetic-client branch. Google login must fail closed unless the backend verifies the credential and returns a real authenticated user/session. Keep mock authentication only in isolated test fixtures guarded by `TESTING`.

### C2. Production-facing portal metrics and identity claims are fabricated or not fully persisted

**Evidence**

`ClientPortal.tsx` still renders fixed or branch-derived claims including:

- `42 min estimated duration`
- `Optimal Cadence`
- `Top 5% Tier`
- `High-Stakes Gravitas`
- `WUDC Standard`
- fixed roadmap/session descriptions and objective text
- `Voice Dispatch · Circle 07 Briefing`
- `Verified Dispatch`
- hardcoded WPM/BLUF/evaluation values in locally created entries

The portal also displays a guest/default classification when persisted profile/session data is absent rather than clearly showing an unavailable state.

**Impact**

Professional users can interpret invented scores, rankings, credentials, delivery analyses, or coach-authored dispatches as real evidence. This is a data-integrity and product-trust failure, not merely placeholder copy.

**Required fix**

Source every metric, ranking, session objective, duration, dispatch, and verification label from persisted records and authenticated ownership. If a record does not exist, render an explicit empty or “not yet available” state. Do not infer professional claims from branch names or hardcoded labels.

### C3. Production writes can appear successful while remaining only local

**Evidence**

- `journalEntries` and `execEntries` in `ClientPortal.tsx` are React state only.
- Recording handlers only toggle local recording state and show “Analysis coming soon”; there is no `MediaRecorder`, upload, storage, transcription, or analysis API.
- Audio dispatch playback is a toast/message interaction rather than playback of a stored audio resource.
- `AppContext` optimistically inserts photos, messages, habits, and other records, logs API failures, and leaves the optimistic record in state.

**Impact**

Users can see “saved,” “uploaded,” “sent,” or completed activity that disappears on refresh or never reached the server. A professional portal cannot claim durable workflow completion when the backend failed.

**Required fix**

Either implement authenticated persistence and processing for journals, evaluations, recordings, dispatches, and habits, or disable those controls and label them unavailable. Every mutation must reconcile with the server response and roll back or expose a durable pending/failed state when persistence fails.

## High findings

### H1. Habit creation fabricates a fixed five-item log and has an invalid client fallback

`toggleHabitCompletion()` creates five hardcoded habits with fixed values when no daily log exists. `ClientPortal.tsx` also uses `pairedClient?.id || 'client-1'`.

**Impact:** An unpaired or unauthenticated speaker can write activity under a fabricated client ID, and the displayed habit set may not match server-defined habits or the speaker’s onboarding selections.

**Required fix:** Require an authenticated client ID, load server-defined habit templates, and create/update only the requested server record. Never use `client-1` as a production fallback.

### H2. Roadmap sessions are generated in the browser when persisted workouts are missing

When no persisted workouts are available, the portal derives sessions from program days using fixed Tuesday/Thursday scheduling, dates, times, room names, and status values.

**Impact:** A schedule can look confirmed even when no coach created or persisted it. Browser-generated sessions can conflict with the coach calendar and other devices.

**Required fix:** Render only persisted scheduled workouts/session records. Provide an empty state and a coach action when no schedule exists.

### H3. Onboarding fills missing user data with invented production values

`completeOnboarding()` assigns fallback phone numbers, ages, body/health measurements, medical notes, program IDs, and fixed program names when the user did not provide those fields.

**Impact:** Incomplete onboarding becomes false client health/profile data and may be displayed to coaches or used in program logic.

**Required fix:** Keep optional fields null/unknown, validate required fields, and let the backend assign programs and defaults through explicit domain rules. Never create health or identity facts merely to satisfy a UI shape.

### H4. Local profile storage can outlive authentication and influence the portal

The speaker profile is stored in `localStorage` and hydrated independently of a verified active session. Tokens and user metadata are also stored in `localStorage`.

**Impact:** A shared browser can reopen a previous speaker profile; XSS can access bearer tokens; clearing or modifying browser storage changes apparent identity and state.

**Required fix:** Treat the server session as authoritative, clear profile state on logout/401, scope profile data to the authenticated subject, and migrate bearer-token handling to secure HttpOnly cookies or a short-lived server exchange where practical.

### H5. Development seed fixtures remain close to runtime paths

`src/data/mockData.ts` and `backend/seed_data.json` remain in the repository. `backend/app/main.py` still imports `seed_database`, and `start.sh` automatically runs `backend/seed_data.py` when the local SQLite file is missing.

Render’s current production configuration no longer runs the seed script during build, and production lifespan creates only a coach bootstrap user. However, the retained import and terminology make accidental production seeding easy.

**Required fix:** Move fixtures into clearly isolated test/development packages, exclude them from production packaging where possible, remove the production module import, and make seeding an explicit developer command rather than automatic startup behavior.

### H6. Hardcoded Google client ID fallback creates deployment ambiguity

`GoogleAuthButton.tsx` uses a literal Google client ID when `VITE_GOOGLE_CLIENT_ID` is missing. The client ID is public rather than a secret, but this fallback can silently point a deployment at the wrong OAuth project/origins.

**Required fix:** Require `VITE_GOOGLE_CLIENT_ID` in production and fail with a configuration error when absent. Keep the value only in deployment configuration.

### H7. Coach/client messaging and other mutations lack authoritative failure handling

`sendMessage`, photo creation, habit toggles, and several other actions update React state before the API call. Errors are logged with `console.warn`, but the temporary record remains and no retry or failed status is exposed.

**Impact:** The UI can diverge from the database and users cannot tell whether the action is durable.

**Required fix:** Replace optimistic persistence with server-confirmed updates, or implement explicit pending/failed records, rollback, retry, and idempotency.

## Medium findings

### M1. Insecure development defaults remain in backend source

`backend/app/config.py` still contains default values for the JWT secret, coach password, and invite code. Production validation rejects these values, which is an improvement, but source-level defaults are still risky and can be used accidentally in non-production deployments exposed to real data.

**Required fix:** Require secrets outside test mode, use a dedicated local `.env`, and make startup fail for any environment intended to serve non-test users.

### M2. Production bootstrap account needs an explicit operational procedure

Production startup creates `coach-1` if it does not exist using `DEFAULT_COACH_PASSWORD`. Render generates that value, but the repository does not establish how the credential is delivered securely, rotated, or forced to change after first login.

**Required fix:** Use a one-time provisioning/migration process, force password rotation, audit the bootstrap account, and document secret ownership and recovery.

### M3. Health endpoint reports application health without dependency readiness

`/health` returns `healthy` without checking database connectivity, migration state, OAuth configuration, or required downstream services.

**Required fix:** Split liveness and readiness checks and include database/service dependency status without exposing secrets.

### M4. Production bundle remains oversized

The current build emits a `1,063.96 kB` minified JavaScript chunk and Vite warns above the 500 kB threshold.

**Impact:** Slower first load, especially for mobile speakers, and larger blast radius for changes.

**Required fix:** Code-split coach and speaker portals, lazy-load heavy live/rehearsal modules, and set performance budgets.

### M5. Test suite passes but does not prove cross-session persistence

The current tests validate rendering and mocked API behavior. They do not demonstrate that journals, recordings, evaluations, audio dispatches, habits, or onboarding data survive reload and a second authenticated browser session.

**Required fix:** Add API/integration tests and end-to-end flows against a disposable database for every production-visible write.

## Dynamic-data trace

| Surface | Current source | Durable and authenticated? | Result |
|---|---|---:|---|
| Coach roster | API; empty initial state | Mostly | **Conditional** |
| Programs/exercises/workouts | API, plus browser-generated roadmap fallback | Partially | **Fail** |
| Speaker identity | API lookup, local profile, Google synthetic fallback | No | **Fail** |
| Portal metrics/rankings | API fields plus fixed claims/values | No | **Fail** |
| Session roadmap | Persisted workouts or generated local schedule | Partially | **Fail** |
| Voice recording analysis | Local start/stop UI; no recorder or analyzer | No | **Fail** |
| Coach messaging | API send plus optimistic local state | Partially | **Fail** |
| Journals/simulations | React component state | No | **Fail** |
| Habits | API toggle plus fixed local five-item fallback | Partially | **Fail** |
| Photos | API create plus optimistic local item | Partially | **Needs correction** |
| Live rehearsal | Jitsi/native WebRTC path and feedback API tests | Requires deployed verification | **Conditional** |
| Theme/portal selection | Local storage preference | Yes, appropriate | **Pass** |

## What improved since the previous audit

- Production frontend business collections no longer import `src/data/mockData.ts`.
- Successful empty API arrays now replace state instead of leaving fixture data visible.
- Automatic hardcoded coach login and password renewal were removed.
- The Google UI mock-token simulator was removed and now fails closed when GSI is unavailable.
- Demo persona-switcher controls and default fictional speaker profiles were removed.
- Render no longer runs `python backend/seed_data.py` during the production build.
- Production startup no longer loads the full demo dataset; it creates only the bootstrap coach if needed.
- `.env.example` no longer contains a Google client secret value; it uses a placeholder.
- Empty-state regression coverage was added.

These changes reduce the original demo-data exposure but do not satisfy the full production dynamic-data gate.

## Validation performed

| Check | Result | Notes |
|---|---|---|
| Frontend TypeScript check | **Passed** | `npm run lint` |
| Frontend production build | **Passed with warning** | 1,063.96 kB minified JS chunk |
| Frontend tests | **Passed** | 13 files, 88 tests |
| Backend tests | **Passed** | 8 tests; 330 warnings |
| Production dependency audit | **Passed** | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities |
| Runtime demo/static search | **Failed** | Synthetic Google fallback, fixed portal claims, generated sessions, local-only workflows, and fixed habit data remain |
| Persistence audit | **Failed** | Several mutations remain optimistic/local-only without rollback or durable retry |
| Deployment/release audit | **Incomplete** | Repository configuration inspected; deployed database, OAuth origins, backups, monitoring, rate limiting, and live signaling were not verified |

## Required release gate

Do not approve public professional production until all of the following are complete:

1. Remove arbitrary client-side Google credential decoding and synthetic-user/client creation; require a verified backend session.
2. Remove all fixed production-facing metrics, rankings, verification labels, audio dispatch claims, and hardcoded evaluation values.
3. Remove browser-generated roadmap sessions and the `client-1` fallback; display an empty state when the server has no record.
4. Implement persisted journal, simulation/evaluation, recording, transcription/analysis, audio dispatch, and habit workflows, or disable them until implemented.
5. Make every mutation server-authoritative with rollback or an explicit pending/failed/retry state.
6. Stop creating invented phone, health, body, medical, program, and identity values during onboarding.
7. Isolate or delete `src/data/mockData.ts` and `backend/seed_data.json`; remove automatic seed imports from production-adjacent startup code.
8. Require production OAuth configuration rather than using a hardcoded Google client ID fallback.
9. Remove insecure backend defaults outside test-only configuration and document bootstrap credential rotation.
10. Add cross-session end-to-end tests against a disposable database for profile, habits, messages, journals, evaluations, recordings, and schedules.
11. Inspect the actual production database for old fictional rows and delete or quarantine any seeded records.
12. Verify deployed OAuth origins, Jitsi/signaling, database backups and restore, monitoring/alerting, rate limiting across instances, and incident recovery.

## Final assessment

**The app is improved but not production-ready for professional use today.** It is suitable for continued development or a controlled staging/internal demonstration. The remaining issue is no longer simply “mock data exists in the repository”; production-visible workflows still allow unverified identity, fabricated claims, generated schedules, and local-only actions. The release should remain **NO-GO** until the release gate is completed and the deployed environment is independently verified.
