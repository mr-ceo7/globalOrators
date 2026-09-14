# Global Orators Full Application Audit

**Audit date:** 2026-09-14
**Scope:** Repository-wide audit of demo/mock/hardcoded/static behavior, dynamic-data integrity, persistence, authentication, deployment configuration, and production validation
**Verdict:** **NO-GO for professional public production**

This audit was performed against the current working tree after the latest production-audit remediation commit and the current uncommitted onboarding changes. The application is improved, but it is not yet safe to represent as a fully dynamic professional production platform.

## Executive summary

Several important issues are fixed:

- Core business collections initialize empty and are populated from API responses.
- Empty API responses replace state instead of leaving fixture data visible.
- The original frontend mock-data import and automatic coach login were removed.
- The client-side Google JWT decode fallback was removed.
- Onboarding now persists to the backend before activating the speaker portal and fails closed when persistence fails.
- Render no longer runs the demo seed script during its production build.
- Frontend code splitting reduced the largest emitted chunk to approximately 364 kB and removed the prior Vite size warning.

The app still fails the requested “no demo/mock/hardcoded/static” standard:

- `ClientPortal.tsx` contains literal historical evaluations and a literal six-point progress chart presented as a user’s real history.
- Recording controls do not record or analyze audio; they only toggle local state and display “Analysis coming soon.”
- Journals and executive simulations are local React state and are labeled as encrypted/reviewed vault records despite having no backend model or persistence.
- The coach voice dispatch is a toast interaction, not playback of a stored audio resource.
- The backend Google endpoint creates a new speaker and client with fabricated executive program/default data for any verified Google identity without a corresponding onboarding record.
- The frontend still contains a synthetic speaker/client construction branch if Google authentication succeeds but the client lookup cannot find a record.
- Roadmap sessions are generated in the browser when no persisted workouts exist.
- Habits use a `client-1` fallback and create a fixed five-habit record locally.
- Most mutations update UI state before persistence and leave the optimistic state in place when the API fails.
- Local startup automatically seeds demo data, and seed fixtures remain in the repository.

## Severity summary

| Severity | Count | Meaning |
|---|---:|---|
| Critical | 4 | A production user can see fabricated history/claims or receive a synthetic account/profile |
| High | 8 | User-facing workflows are local-only, generated, or can falsely appear persisted |
| Medium | 5 | Deployment hygiene and operational safeguards are incomplete |

## Critical findings

### C1. Speaker portal displays literal historical evaluations and metrics as real user history

**Evidence**

`src/components/clientApp/ClientPortal.tsx` contains fixed data for:

- six progress-chart entries (`R-01` through `R-06`) with fixed WPM values and dates;
- three historical evaluations with fixed dates, scores, WPM, clarity, BLUF values, coach notes, and directives;
- fixed `136 WPM`, `94%` clarity, `95/100` BLUF, and `1.1/min` filler frequency;
- fixed `10 Sessions Logged`, `Initial Baseline: 152 WPM`, and `Latest Rehearsal: 138 WPM`.

These values are not derived from `metrics`, `scheduledWorkouts`, persisted evaluations, or an analysis service.

**Impact**

The portal presents fabricated performance history and coach feedback as if it belongs to the authenticated speaker. This directly violates the requirement that professional user data be dynamic and evidence-backed.

**Required fix**

Delete the literal chart/evaluation arrays. Calculate analytics only from persisted records owned by the authenticated speaker. If records are absent, show an explicit empty state such as “No analyzed rehearsals yet.”

### C2. Recording is a UI simulation, not a production recording workflow

**Evidence**

- `handleStartRecording()` only sets `isRecording`.
- `handleStopRecording()` only sets local completion state and displays `Rehearsal processed! Analysis coming soon.`
- No `MediaRecorder`, audio upload, object storage, transcription, speech analysis, or persisted recording endpoint is wired.
- The waveform uses animated DOM bars rather than microphone input.

**Impact**

The UI implies a rehearsal was processed and logged when no recording exists and no analysis was performed.

**Required fix**

Implement a real recording pipeline with permission handling, upload, durable recording metadata, processing status, and server-derived results, or disable the control and label it “Unavailable until recording analysis is enabled.”

### C3. Executive simulations and catharsis journal entries are browser-only

**Evidence**

- `journalEntries` and `execEntries` are initialized as empty React state.
- Save handlers use `setJournalEntries` and `setExecEntries` only.
- Entries disappear on refresh, logout, another device, or browser storage clearing.
- Executive entries assign fixed `wpm`, `blufScore: 95`, `coachStatus`, `feelAfter`, and `audioLength`.
- The UI says “Encrypted executive repository” and “Reviewed by Head Coach Qassim” without a persistence or review service.

**Impact**

Users are told that private records are securely stored and reviewed when the application has not actually created durable server records or performed review.

**Required fix**

Add authenticated API/database models and explicit processing/review statuses, or remove/disable these features until implemented. Do not show security, encryption, review, or analysis claims without corresponding infrastructure.

### C4. Google authentication still creates synthetic speaker/client defaults

**Evidence**

Backend `POST /auth/google` creates a new speaker user and then creates a client with fixed values including:

- `current_program_name="Executive Public Speaking & Presentation Skills"`
- `goal="Executive & Board Pitching"`
- `custom_coach_notes=["Executive orator onboarded via Google Authentication."]`

In `AppContext.loginWithGoogle`, when the verified user has no matching client, the frontend still constructs an in-memory `Client` with default Academy/Executive data and returns success.

**Impact**

A newly verified Google user can receive a fabricated program/profile before completing onboarding. The application treats authentication as if it were completed speaker onboarding and creates business data without user-provided domain information.

**Required fix**

Separate identity registration from speaker profile onboarding. Google authentication should return an authenticated user with an incomplete profile, not a fabricated executive client. Require onboarding or load a real existing client record before rendering the speaker portal. Remove the frontend synthetic-client branch.

## High findings

### H1. Roadmap sessions are generated locally when persisted workouts are absent

`ClientPortal.tsx` maps `execProgram.days` into “confirmed/scheduled” sessions with fixed Tuesday/Thursday labels, 10:00 AM times, chamber names, and default descriptions when no API workouts are returned.

**Impact:** A speaker sees a schedule that a coach never created and that is not shared with other devices.

**Required fix:** Render only persisted workout/session records. Use an empty state when no schedule exists.

### H2. Habits use a fabricated client ID and fixed five-item fallback

`ClientPortal.tsx` uses `pairedClient?.id || 'client-1'`. `AppContext.toggleHabitCompletion()` creates a fixed five-habit log with fixed titles, values, and targets when no existing log exists. The UI passes habit titles where the API contract expects a habit ID.

**Impact:** Activity can be written under a non-authenticated/fabricated client identity and can disagree with server-defined habits.

**Required fix:** Require the authenticated client ID, load server-defined habit definitions, pass stable habit IDs, and make the server create the daily log.

### H3. Optimistic mutations remain visible after API failures

Many context actions update state first, then call the API. On failure they only log `Backend sync failed` and leave the temporary record or edited state visible. Affected paths include clients, exercises, programs, schedules, workout completion, metrics, personal records, photos, messages, and habits.

**Impact:** The UI can display records as saved, sent, scheduled, or completed when the server rejected or never received them.

**Required fix:** Use server-confirmed updates or explicit pending/failed state with rollback, retry, and idempotency. Success toasts must occur only after confirmed persistence.

### H4. Coach voice dispatch is a toast, not an audio resource

The dispatch play button calls `showToast(...)`; it does not load or play an audio URL. The card still presents “Voice Dispatch · Circle 07 Briefing,” “High-Fidelity Voice Note,” and a progress bar.

**Impact:** The user is shown a fabricated media asset and implied coach communication.

**Required fix:** Bind the control to a persisted audio asset with authorization and real playback, or remove the player and show an unavailable state.

### H5. Static claims and fixed portal copy are presented as user-specific facts

Examples include:

- `42 min estimated duration`
- `Optimal Cadence`
- `Top 5% Tier`
- `High-Stakes Gravitas`
- `WUDC Standard`
- `6-Day Streak`
- `Head Coach Qassim · Verified Dispatch`
- `10 Sessions Logged`
- fixed Tuesday/Thursday 90-minute executive protocol text

Static curriculum/editorial copy is acceptable on public marketing pages when clearly descriptive. These claims are not acceptable when rendered as live user metrics, completed activity, rankings, coach verification, or persisted history.

**Required fix:** Replace with API-backed values or neutral labels and explicit “not available yet” states.

### H6. Local speaker profile state can outlive the authenticated session

`globalorators_speaker_profile` is read from `localStorage` independently of a verified server session. Sign-out removes this profile manually, but token expiry, shared browsers, or another user logging in can leave stale profile state.

**Required fix:** Make the server session authoritative, clear profile state on logout/401, bind profile hydration to the authenticated user ID, and avoid treating local profile data as identity.

### H7. Bearer tokens and user metadata remain in localStorage

`apiClient.ts` stores access tokens and user objects in localStorage.

**Impact:** Any XSS execution in the origin can exfiltrate the bearer token and access business records.

**Required fix:** Prefer secure HttpOnly, SameSite cookies or a short-lived token exchange with a safer storage strategy. Add CSP and review all third-party/script surfaces.

### H8. Development seed paths remain easy to invoke and fixtures remain in the repository

`start.sh` automatically runs `backend/seed_data.py` when the local SQLite database is absent. `backend/app/main.py` still imports `seed_database` and invokes it for every non-production startup. `src/data/mockData.ts` and `backend/seed_data.json` remain present.

Render currently omits the seed command from its production build and production lifespan does not load the full fixture set, but the runtime-adjacent seed path is still easy to reuse accidentally.

**Required fix:** Make seeding an explicit developer/test command, isolate fixtures from application runtime packaging, remove stale production-adjacent imports/comments, and verify the deployed database contains no previous seed rows.

## Medium findings

### M1. Hardcoded development secrets remain in backend source

`backend/app/config.py` contains defaults for the JWT secret, coach password, invite code, and Google client ID. Production validation rejects insecure secret/password/invite values, but non-production deployments can still start with these defaults.

**Required fix:** Require secrets for every environment that can handle real data; keep local defaults in an untracked development environment only.

### M2. Google client ID fallback remains in the frontend

`GoogleAuthButton.tsx` uses a literal client ID when `VITE_GOOGLE_CLIENT_ID` is absent.

**Required fix:** Fail configuration validation in production when the variable is missing; do not silently select an OAuth project.

### M3. Production bootstrap account requires a documented rotation process

Production startup creates `coach-1` using `DEFAULT_COACH_PASSWORD` if absent. Render generates the value, but the repository does not enforce first-login rotation, secure delivery, or recovery ownership.

**Required fix:** Use a one-time provisioning migration, force rotation, audit access, and document recovery.

### M4. Health endpoint is liveness-only while reporting “healthy”

`/health` returns healthy without testing database connectivity, migrations, OAuth configuration, or downstream live-session dependencies.

**Required fix:** Add separate liveness/readiness checks and monitor dependency failures.

### M5. Tests still encode demo fixtures as expected values

The test suite intentionally uses mock APIs and values such as `coach@globalorators.com`, `client-1`, `client-mock-*`, `test@example.com`, and `Voice Dispatch • Circle 07`. Test fixtures are appropriate in tests, but tests currently reinforce some production-facing static copy instead of asserting that absent server records render empty states.

**Required fix:** Keep fixtures test-only and add tests that fail if literal user history, dispatches, rankings, or recordings render without API records.

## Dynamic-data trace

| Surface | Current source | Dynamic/persistent? | Result |
|---|---|---:|---|
| Coach roster | API with empty initial state; optimistic local mutations | Partially | **Conditional** |
| Speaker identity | Google/backend user plus local profile and synthetic client defaults | No | **Fail** |
| Programs and drills | API, with curriculum resolver copy | Partially | **Conditional** |
| Session roadmap | API workouts or browser-generated sessions | No | **Fail** |
| Portal metrics | Profile fields plus literal chart/evaluation arrays | No | **Fail** |
| Recording analysis | Local UI state only | No | **Fail** |
| Voice dispatch | Toast interaction with fixed card copy | No | **Fail** |
| Journals/simulations | React state only | No | **Fail** |
| Coach messaging | API send plus optimistic local display | Partially | **Fail** |
| Habits | API toggle plus fixed client/habit fallback | Partially | **Fail** |
| Live rehearsal feedback | Live component/API path exists; deployed persistence unverified | Requires verification | **Conditional** |
| Public marketing/editorial pages | Intentional authored content and testimonials | Static by design | **Acceptable only if clearly editorial** |
| Theme and portal preference | localStorage | Appropriate preference state | **Pass** |

## Recent improvements confirmed

- Removed production import of the large frontend mock-data collection.
- Business collections initialize empty and successful empty API arrays replace state.
- Removed automatic hardcoded coach login and password renewal.
- Removed arbitrary client-side Google credential decoding fallback.
- Removed the Google mock-token simulator UI.
- Removed stock Unsplash avatar fallbacks from the latest remediation path.
- Onboarding now waits for a successful backend client create before activating the profile/portal.
- Render production build no longer runs `backend/seed_data.py`.
- Frontend code splitting reduced emitted chunk sizes and removed the prior Vite warning.
- Empty-state and onboarding failure tests were added/updated.

## Validation performed

| Check | Result | Notes |
|---|---|---|
| Frontend TypeScript check | **Passed** | `npm run lint` |
| Frontend production build | **Passed** | Largest emitted chunk approximately 364 kB; no Vite size warning |
| Frontend tests | **Passed** | 13 files, 90 tests |
| Backend tests | **Passed** | 8 tests, 330 warnings |
| Production dependency audit | **Passed** | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities |
| Repository whitespace check | **Failed** | Existing trailing whitespace in `src/context/AppContext.tsx` and `src/test/EmptyStateAudit.test.tsx` |
| Runtime demo/static audit | **Failed** | Literal history, simulated recording/vault flows, fixed dispatch, generated roadmap, and synthetic Google defaults remain |
| Persistence audit | **Failed** | Local-only workflows and optimistic writes without rollback/retry remain |
| Deployed-environment audit | **Incomplete** | Actual production database, OAuth origins, backups/restore, monitoring, distributed rate limiting, and live signaling were not verified |

## Required release gate

Do not approve public professional production until all of the following are complete:

1. Remove the frontend synthetic Google-client branch and stop backend Google auth from assigning fabricated program/profile data.
2. Delete all literal progress charts, historical evaluations, WPM/clarity/BLUF/filler values, and user-specific rankings from the portal.
3. Implement real recording storage and analysis, or disable recording controls until available.
4. Persist journals, executive simulations, evaluations, and audio dispatches through authenticated API/database services, or remove the features.
5. Remove browser-generated roadmap sessions and the `client-1` habit fallback.
6. Make mutations server-authoritative with rollback or explicit pending/failed/retry states.
7. Remove fixed “verified,” “encrypted,” “reviewed,” “streak,” and “sessions logged” claims unless backed by persisted evidence.
8. Remove invented onboarding health/profile/program defaults; retain unknown values as unknown.
9. Isolate/delete `src/data/mockData.ts` and `backend/seed_data.json` from production-adjacent paths, and make local seeding explicit.
10. Require production Google client configuration instead of a hardcoded frontend fallback.
11. Remove insecure backend defaults outside test-only configuration and document bootstrap password rotation.
12. Add end-to-end tests proving profile, schedules, habits, messages, journals, evaluations, recordings, and feedback survive reload and a second session.
13. Inspect the actual production database for old fictional seed records and quarantine/delete them.
14. Verify deployed OAuth origins, Jitsi/signaling, database backups and restore, monitoring/alerting, rate limiting across instances, and incident recovery.

## Final assessment

**The app is not yet production-ready for professional use.** It is suitable for continued development or a controlled staging/internal demonstration. The current build and tests are healthy, but the application still presents fabricated user history and unsupported workflow claims, and several core actions are not durable. The release remains **NO-GO** until the release gate is completed and the deployed environment is independently verified.
