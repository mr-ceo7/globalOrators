# Global Orators Full Application Audit

**Audit date:** 2026-09-14
**Audited revision:** `cc5784a`
**Scope:** Demo/mock/fixture/static data, hardcoded user facts, persistence, authentication, dynamic API behavior, deployment safety, and production validation
**Verdict:** **NO-GO for professional public production**

## Executive summary

The latest commit improves data integrity:

- Server failure rollback was added to many create/update/delete mutations.
- `selectedClientId` now starts as `null` instead of the legacy `client-1`.
- Synthetic Google-client creation remains removed.
- Onboarding still fails closed when client persistence fails.
- Core business collections start empty and hydrate from API responses.
- Portal roadmap, metrics, and adjudication views use persisted API data rather than the previous literal history arrays.
- Local fixture seeding remains explicit through `start.sh --seed`.
- Frontend and backend validation suites pass.

The app is still not ready for professional production or for the requirement that every production-facing workflow be dynamic, authenticated, durable, and evidence-backed. The most urgent blocker is unchanged: speaker access is granted by an unauthenticated email/phone profile lookup.

## Critical findings

### C1. Speaker login is an unauthenticated profile lookup

`src/context/AppContext.tsx` implements `loginSpeaker` by calling `clientsApi.lookup(emailOrPhone)`. `backend/app/routers/clients.py` exposes `GET /api/clients/lookup` with `get_optional_user`, so the request does not require authentication. A matching email or phone returns a client record, and the frontend activates the speaker portal and stores the profile locally. If the API lookup fails, an in-memory client match can still activate the portal.

**Impact:** Anyone who knows a speaker's email or phone can impersonate that speaker and access their portal.

**Required fix:** Replace lookup-based login with password, passkey, OTP, or a verified identity-provider session bound to the client. Remove unauthenticated profile lookup as an access mechanism and require a server-issued authenticated session before loading speaker data.

### C2. Journals and executive simulations are browser-only records

`ClientPortal.tsx` stores `go_journal_*` and `go_exec_*` entries in `localStorage`. There is no authenticated API, database model, ownership enforcement, server backup, cross-device synchronization, or coach review workflow.

**Impact:** Professional records disappear across devices or browser storage clearing and can be modified by JavaScript executing in the origin.

**Required fix:** Add authenticated persistence with explicit draft/review/deletion/retention states, or disable these features. Do not describe them as secure, encrypted, reviewed, or durable while browser-only.

### C3. Recording is local capture, not a production recording workflow

The portal uses browser `MediaRecorder`, but the resulting audio is only a local object URL:

- no upload;
- no recording model or durable storage;
- no processing/transcription/analysis job;
- no coach or second-device access;
- no retention or deletion controls.

**Impact:** The UI can imply that a rehearsal was recorded into the platform even though it disappears after refresh or navigation.

**Required fix:** Implement authenticated upload/object storage, recording metadata, processing status, access control, retention, and analysis. Otherwise label it explicitly as local preview only or remove it from the production workflow.

### C4. Onboarding still persists invented defaults

`completeOnboarding` still writes values that were not supplied by the speaker, including:

- automatic program IDs/names such as `prog-1`, `prog-3`, and `prog-exec-speaking-1`;
- `gender: 'Unspecified'`;
- default pacing values of `140` when no baseline is supplied;
- derived current/starting/target performance fields from vocal pace;
- automatic active status and start date;
- default zero/empty survey fields and branch-derived facility/exercise values;
- automatic catharsis score derived from the form rating.

Some defaults are less harmful than the previous fabricated health values, but they are still stored as if they were client facts or assignments.

**Required fix:** Persist only submitted or explicitly consented values. Represent unknown values as `null`/unknown. Separate curriculum recommendations from factual client attributes and require explicit assignment actions before storing a program.

### C5. Program assignment still fabricates schedule state before confirmation

`assignProgramToClient` immediately updates the client, program count, scheduled workouts, activity feed, and success toast. It then calls `programsApi.assign`. Its failure path only logs a warning and does not rollback the client, program, workouts, activity feed, or toast.

**Impact:** A coach can see a program and a full Tue/Thu schedule as assigned even when the server rejected the assignment.

**Required fix:** Make assignment server-first or snapshot and rollback every affected collection. Only generate/display sessions returned by the backend.

## High-severity findings

### H1. Authentication tokens and profile identity remain in localStorage

`src/services/apiClient.ts` stores bearer tokens and user metadata in `localStorage`. `AppContext.tsx` independently stores `globalorators_speaker_profile`.

An XSS or compromised third-party script can exfiltrate a long-lived token. Stale profile data can outlive token expiry or another user signing in on the same browser.

**Required fix:** Prefer secure HttpOnly SameSite cookies or a short-lived token exchange, bind profile hydration to the authenticated server identity, and clear all user state on logout and 401.

### H2. Profile and program fallbacks can fabricate live context

`clientToSpeakerProfile` still supplies defaults such as branch `Academy`, age `20`, and other profile values when backend records are incomplete. `ClientPortal.tsx` searches for hardcoded program ID `prog-exec-speaking-1` and then falls back to the first program.

These fallbacks can prevent a blank screen but are unsafe when displayed as the user's identity, assigned track, or curriculum.

**Required fix:** Render an explicit incomplete/onboarding state when required server fields are absent. Resolve programs only from the authenticated client's persisted assignment.

### H3. Fixture/demo data remains in the repository

`src/data/mockData.ts`, `backend/seed_data.json`, and `backend/seed_data.py` remain present. The frontend no longer imports the fixture collection in the production context, but the files still contain fictional clients, IDs, messages, metrics, and media URLs.

The development backend still imports `seed_database` from `backend/app/main.py` and invokes it automatically for non-production environments. The production build does not run the full seed, and `start.sh --seed` is explicit, but the fixtures remain runtime-adjacent and easy to reuse accidentally.

**Required fix:** Move fixtures into an explicitly excluded development/test package, import them only inside a dedicated seed command, and verify the deployed database contains no historical fixture rows.

### H4. Production startup still auto-provisions a coach account

Production lifespan creates `coach-1` with configured bootstrap credentials if absent and uses an external Unsplash avatar URL.

**Required fix:** Provision through a controlled one-time migration/job, force credential rotation, audit access, and use a managed/local avatar or an explicit empty value.

### H5. Message delivery is server-backed but still briefly optimistic

Messages are appended locally before the API responds and are removed on failure. This is better than the previous silent-success behavior, but the UI has no explicit pending or retry state during the request and the portal also keeps a local `chatMessages` fallback when no API messages exist.

**Required fix:** Use explicit pending/sent/failed message states, retry controls, and do not present the local fallback as an authoritative conversation history.

### H6. Habits still use title strings as identifiers

The portal passes habit titles to the toggle API rather than stable server habit IDs. Server-authoritative response handling is present, but title-based identity can break when labels change or duplicate.

**Required fix:** Load server-defined habit IDs and send those IDs through the full client/API flow.

### H7. Live-room persistence and deployment behavior remain unverified

The live room has real WebRTC/Jitsi interaction and evaluation controls, but the repository audit does not prove that all live feedback, media, and session state survive reload, reconnect, a second device, and a second authenticated session in the deployed environment.

## Medium findings

### M1. Insecure source defaults remain in backend configuration

`backend/app/config.py` contains defaults for JWT secret, coach password, invite code, and Google client ID. Production validation rejects several insecure values, but a non-production deployment can still start with them and may be connected to real data.

**Required fix:** Require explicit secrets for every environment capable of handling real data. Keep local-only values in untracked development/test configuration.

### M2. Production configuration validation is incomplete

Fail-closed validation should also cover Google client configuration, exact OAuth origins, production database scheme, storage configuration, and bootstrap provisioning state.

### M3. Startup seed/bootstrap errors are swallowed

`backend/app/main.py` catches seed/bootstrap exceptions, logs an error, and continues startup. Required migration/bootstrap failures should fail readiness or stop startup rather than produce a partially initialized service.

### M4. Static editorial content must remain separated from live data

Marketing pages, curriculum descriptions, testimonials, authored labels, and the new sidebar navigation are static by design and are not defects by themselves. They become defects if presented as completed user history, real rankings, verified coach communication, actual metrics, or persisted activity.

Notably, `VoiceDispatchPlayer.tsx` explicitly labels its audio concept an **“Educational Demo Model.”** That is acceptable for public marketing only if it is not presented as an actual private coach dispatch or production speaker record.

## Dynamic-data matrix

| Surface | Current source | Durable/authenticated | Assessment |
|---|---|---:|---|
| Coach roster | API plus rollback-enabled mutations | Partial | Conditional |
| Speaker authentication | Exact email/phone lookup | No | **Fail** |
| Speaker profile | API record plus local cache/fallbacks | Partial | **Fail** |
| Programs and drills | API plus resolver/static curriculum copy | Partial | Conditional |
| Program assignment/schedule | Optimistic client-generated schedule; API assignment | Partial | **Fail** |
| Roadmap display | Persisted scheduled workouts | Yes when API succeeds | Conditional |
| Metrics/evaluations | Persisted metrics/adjudication notes | Yes when API succeeds | Conditional |
| Recording | Local `MediaRecorder` object URL | No | **Fail** |
| Journals/simulations | Browser localStorage | No | **Fail** |
| Messaging | API send with rollback plus local fallback | Partial | Conditional |
| Habits | Server toggle with title-based identifier | Partial | Conditional |
| Live rehearsal | Browser/WebRTC plus API paths; deployment unverified | Unknown | Conditional |
| Marketing/editorial | Authored static content | Intentional | Acceptable when clearly editorial |
| Theme/portal preference | Browser preference storage | Not business data | Pass |

## Validation performed

| Check | Result | Notes |
|---|---|---|
| Frontend type-check | **Passed** | `npm run lint` |
| Frontend production build | **Passed** | `npm run build`; largest emitted chunk approximately 363 kB |
| Frontend tests | **Passed** | 13 files, 91 tests |
| Backend tests | **Passed** | 9 tests; pytest emitted 363 warnings |
| Production dependency audit | **Passed** | `npm audit --omit=dev --audit-level=high`; 0 vulnerabilities |
| Git whitespace check | **Passed** | `git diff --check` |
| Demo/mock/static audit | **Failed** | Unauthenticated lookup login, browser-only records, local recordings, invented onboarding defaults, assignment fallback state, fixtures, and storage-based identity remain |
| Deployed-environment verification | **Incomplete** | Production database, OAuth, backups/restore, monitoring, rate limiting, signaling, and credential rotation were not independently verified |

## Required release gate

Do not approve professional public production until all of the following are complete:

1. Replace lookup-based speaker login with real authentication and remove unauthenticated profile access.
2. Remove invented onboarding defaults, especially program, identity, performance, and health-related values.
3. Add authenticated durable persistence for journals and executive simulations, or disable them.
4. Upload and persist recordings with access control, processing status, retention, and analysis, or disable production recording.
5. Complete rollback/server-first behavior for program assignment and every related schedule/activity update.
6. Replace title-based habit identity with stable server IDs.
7. Replace localStorage bearer-token storage with a safer session design.
8. Remove or isolate fixture files and the module-level seed import from runtime startup.
9. Remove insecure defaults from any environment capable of handling real data.
10. Add end-to-end tests proving authentication, onboarding, assignment, schedules, habits, messages, journals, evaluations, and recordings survive reload and a second session.
11. Inspect the actual production database for fictional seed rows and remove/quarantine them.
12. Verify deployed OAuth origins, live-session signaling, backups/restores, monitoring/alerting, distributed rate limiting, and bootstrap credential rotation.

## Final verdict

**NO-GO.** The latest commit improves rollback and removes the stale client-selection default, and all automated checks pass. The application is still not safe for professional production because speaker authentication is bypassable, private records and recordings are browser-only, onboarding persists invented facts, program assignment can leave fabricated schedule state after failure, and demo/fixture paths remain in the runtime-adjacent codebase.
