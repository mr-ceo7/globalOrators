# Global Orators Full Application Audit

**Audit date:** 2026-09-13  
**Scope:** Dynamic-data integrity, demo/mock/static content, persistence, authentication fallbacks, deployment configuration, and production validation  
**Verdict:** **NO-GO for professional public production**

The application is a substantial working prototype and the frontend/backend test suites pass, but production-visible workflows still use fictional seed data, hardcoded personas, simulated results, browser-only state, and fallback authentication. A passing build does not prove that the product is dynamic or that user actions survive a new browser, device, deployment, or database failure.

## Executive summary

The application is not currently a clean production system. The main issue is not the presence of test fixtures by itself; it is that fixture data and demo behavior are wired into the runtime path:

- `src/context/AppContext.tsx` imports `src/data/mockData.ts` and initializes every business collection from it when local storage is empty.
- API responses with an empty array do **not** replace the initial state, so stale mock data remains visible when the real account has no records.
- `refreshFromBackend()` silently attempts to log in as `coach@globalorators.com` using `Coach@123` when no browser token exists.
- Speaker portal content includes default identities, demo persona switching, hardcoded scores, synthetic coach messages, simulated recording metrics, and local-only journals.
- Render builds and application startup run `seed_data.py`, inserting fictional clients, programs, metrics, photos, messages, and activity records into the production database.
- `.env.example` contains a live-looking Google OAuth client secret rather than a placeholder.
- Deployment environment names do not match the backend settings: Render defines `JWT_SECRET` and `COACH_SECRET_KEY`, while the backend reads `SECRET_KEY` and `COACH_INVITE_CODE`.

## Severity summary

| Severity | Count | Meaning |
|---|---:|---|
| Critical | 5 | Demo or fabricated behavior can appear to real users, or production authentication/configuration is unsafe |
| High | 7 | User data is not reliably dynamic, durable, or operationally trustworthy |
| Medium | 5 | Product behavior is misleading or incomplete under normal production conditions |

## Critical findings

### C1. Runtime mock data is a production fallback

**Evidence**

- `src/context/AppContext.tsx` imports ten `INITIAL_*` collections from `src/data/mockData.ts`.
- The file is 2,866 lines long and contains fictional clients, exercises, programs, schedules, metrics, personal records, habits, photos, messages, and activity.
- State initialization falls back to those collections when local storage is empty.
- `refreshFromBackend()` only calls `setClients`, `setExercises`, and similar setters when the API returns a non-empty array. A valid empty production response therefore leaves fictional local records on screen.

**Impact**

New or empty accounts can see other people's fictional records. A network failure or empty API response can look like a successful populated account. This fails the requirement that displayed records originate from the authenticated user's backend data.

**Required fix**

Remove `mockData.ts` from the production runtime bundle. Initialize business collections as empty, show explicit loading/empty/error states, and always replace state with successful API responses, including empty arrays. Keep fixtures in test-only files.

### C2. Automatic login uses hardcoded coach credentials

**Evidence**

`src/context/AppContext.tsx` calls:

```ts
authApi.login('coach@globalorators.com', 'Coach@123')
```

`src/services/apiClient.ts` repeats the same credentials during token renewal.

**Impact**

The public frontend contains a credential pair intended to access the coach account. It also creates an implicit shared account and can silently turn an unauthenticated browser into a coach session. This is unacceptable for a production application.

**Required fix**

Delete automatic credential login and client-side token renewal by password. Require an explicit authenticated session, use an HttpOnly secure cookie or a short-lived token exchange, and display an authentication error instead of entering offline/demo mode.

### C3. Google authentication still has a fabricated-token fallback

**Evidence**

- `src/components/auth/GoogleAuthButton.tsx` renders a fallback simulator with a hardcoded `mockHeader.<payload>.mockSignature`.
- `src/context/AppContext.tsx` decodes arbitrary JWT-shaped payloads after Google authentication fails and constructs a local user.
- The fallback creates a client with hardcoded program, metrics, health, and coaching values.

**Impact**

If the Google script is blocked or backend verification fails, the UI can present a successful-looking authenticated speaker without a verified identity or durable account. A production login control must fail closed.

**Required fix**

Remove the fallback simulator and client-side payload decoding from production code. Keep mock Google credentials exclusively in isolated test fixtures behind a test build.

### C4. Speaker portal contains explicit demo persona switching

**Evidence**

`ClientPortal.tsx` includes “Switch Demo Persona” controls for:

- Executive Track (Dr. Vance)
- Debate Track (Kwame)
- Foundation Track (Nia)

Each action replaces the active profile with a hardcoded object and displays a demo toast.

**Impact**

Real users can switch into fictional identities and see data unrelated to their account. This is a direct violation of the requested no-demo/no-mock requirement.

**Required fix**

Remove the controls and hardcoded personas. Derive the portal only from the authenticated speaker and records returned by the API.

### C5. Production database is seeded with fictional records

**Evidence**

- `render.yaml` runs `python backend/seed_data.py` as part of the production build.
- `backend/app/main.py` runs `seed_database(force=False)` during every application startup.
- `backend/seed_data.json` contains 6 clients, 16 exercises, 4 programs, 6 scheduled workouts, 12 metrics, 8 personal records, 2 habit logs, 6 photos, 7 messages, and 5 activity items.
- Records include names such as Marcus Vance, Elena Rostova, Dr. Arthur Vance, and example.com addresses.

**Impact**

Production starts with fabricated user history and media. The database is not a clean tenant environment, and new users may be exposed to seed content through the frontend fallback or broad coach views.

**Required fix**

Separate schema migration from demo seeding. Never run demo seed data in the production build or startup lifecycle. If a production bootstrap account is required, create only the required administrator with a one-time migration and force password rotation.

## High findings

### H1. Speaker profile has a hardcoded default identity

When no local profile exists, `AppContext` initializes `activeSpeakerProfile` as Kofi Mensah with a fixed email, phone, mission, age, habits, and bio. `ClientPortal` has a second fallback identity for Nia Adebayo.

**Impact:** A visitor can reach a populated speaker portal without a verified speaker record.

### H2. Portal metrics are fabricated or hardcoded

`ClientPortal.tsx` displays fixed values including `94.2%` clarity, `96%` BLUF/argumentative score, `18` sessions/rounds, `+4 this week`, `Week 3 · Session 2 · 42 min`, and fixed objective text. These are not sourced from metric, workout, or evaluation APIs.

**Impact:** The product presents performance claims that are not calculated from persisted evidence.

### H3. Recording results are random simulations

The portal does not use `MediaRecorder` or an analysis service for its “voice recorder.” `handleStopRecording()` generates WPM with `Math.random()` and assigns fixed clarity/filler values.

**Impact:** “Instant delivery metrics” are fabricated and cannot be trusted by a professional speaker or coach.

### H4. Coach messages and replies are simulated

`AppContext.sendMessage()` persists the initial message attempt but then schedules random canned client/coach replies with `setTimeout` and updates local state without a corresponding backend message. `ClientPortal` also initializes a canned welcome conversation whenever the profile persona changes.

**Impact:** Users can believe a coach or speaker replied when no real message exists.

### H5. Journals and executive simulations are local component state only

`journalEntries` and `execEntries` are initialized with fictional entries and updated with `setJournalEntries`/`setExecEntries`. There is no API call or database model for these records.

**Impact:** Entries disappear on refresh, device change, logout, or cache clearing, and the initial history is presented as real activity.

### H6. Habit state is duplicated and not reliably persisted

The portal maintains its own `habitsStatus` object and toggles it locally. `AppContext.toggleHabitCompletion()` has a backend call, but the portal does not use that shared action for its primary habit controls.

**Impact:** Habit completion shown to the speaker can diverge from the backend and from the coach view.

### H7. Local storage is used as the business-data source and fallback

The context serializes clients, drills, programs, sessions, metrics, messages, habits, and speaker profiles into `localStorage`. This is acceptable for non-sensitive preferences such as theme, but not as a source of truth for business records or authentication.

**Impact:** Browser-specific stale data can override server state; records are readable and modifiable by any script running in the origin; clearing storage changes the apparent account state.

## Medium findings

### M1. Hardcoded placeholder media is used as real profile and exercise content

The runtime contains many Unsplash avatar/photo URLs, default photo form values, fallback avatars, and `demo_video_placeholder_url` fields. These may be acceptable for a clearly labeled content library, but they are currently mixed with seeded user records and production portal history.

### M2. Fallback and offline wording presents local state as saved

Several actions optimistically update UI and retain local state after backend failure, showing messages such as “Offline mode: Profile saved locally. Cloud sync pending.” This is not durable persistence and has no retry queue or conflict resolution.

### M3. Deployment secret names are inconsistent

`render.yaml` generates `JWT_SECRET` and `COACH_SECRET_KEY`, while `backend/app/config.py` reads `SECRET_KEY` and `COACH_INVITE_CODE`. Production secret validation therefore does not validate the variables Render actually provisions, and the invite code is not supplied by the deployment file.

### M4. `.env.example` contains a credential-like Google secret

`.env.example` includes `GOOGLE_CLIENT_SECRET="GOCSPX-..."`. Even if the credential has been revoked, it must not be distributed as an example value. It should be rotated and replaced with an obvious placeholder.

### M5. The entire frontend ships as one oversized bundle

The production build emits a 1,153 kB minified JavaScript chunk and a Vite warning above the 500 kB threshold. This is not a demo-data failure, but it increases first-load cost and makes the large portal code harder to operate safely.

## Dynamic-data trace

| User-facing surface | Current source | Dynamic/persistent? | Result |
|---|---|---:|---|
| Coach roster | API plus local storage and `INITIAL_CLIENTS` fallback | Partially | **Fail** |
| Programs and drills | API plus local storage and mock collections | Partially | **Fail** |
| Speaker identity | API lookup plus local profile/default profiles | Partially | **Fail** |
| Today's metrics | Profile fields plus hardcoded values | No | **Fail** |
| Session roadmap | API workouts, otherwise generated from program days | Partially | **Fail** |
| Voice recording metrics | Random client-side values | No | **Fail** |
| Coach thread | API message attempt plus canned local replies | Partially | **Fail** |
| Journals and executive simulations | Component state only | No | **Fail** |
| Habits | Duplicate local state and API toggle | Partially | **Fail** |
| Photos | API model plus placeholder URLs/default form URL | Partially | **Needs cleanup** |
| Live rehearsal signaling | Jitsi/native WebRTC path exists | Partially | Requires deployed-service verification |
| Theme and portal selection | Local storage | Yes, appropriate preference state | **Pass** |

## Validation performed

| Check | Result | Notes |
|---|---|---|
| Frontend TypeScript check | **Passed** | `npm run lint` |
| Frontend production build | **Passed with warning** | 1,153 kB minified JS chunk |
| Frontend tests | **Passed** | 12 files, 85 tests |
| Backend tests | **Passed** | 8 tests; 330 warnings |
| Static/demo search | **Failed** | Runtime mock data, demo personas, simulated metrics, and seed data remain |
| Production configuration audit | **Failed** | Secret-name mismatch and credential-like value in `.env.example` |
| Dynamic persistence audit | **Failed** | Multiple user-facing workflows are local-only or simulated |

## Required release gate

The release remains blocked until all of the following are complete:

1. Remove `src/data/mockData.ts` from production runtime imports and delete every business-data fallback to it.
2. Remove hardcoded coach auto-login, password renewal, Google simulator, arbitrary JWT decoding, default speaker identities, and demo persona switching.
3. Remove fabricated portal metrics and calculate displayed values from persisted records or show an explicit empty state.
4. Implement real recording storage and analysis, or label the feature as unavailable and remove simulated scores.
5. Persist journals, executive simulations, voice notes, evaluations, and habit changes through authenticated API endpoints.
6. Remove canned automatic coach/client replies; all messages must come from the message service and display delivery status.
7. Stop production build/startup from running `seed_data.py`; migrate only intentional system/bootstrap data.
8. Remove fictional seed records and placeholder/example identities from the production database.
9. Align Render variables with backend settings (`SECRET_KEY`, `COACH_INVITE_CODE`, and the intended Google variables), then rotate any exposed credentials.
10. Add tests asserting that an empty API response renders an empty state and never renders fixture records.
11. Add end-to-end tests proving that a new user's profile, habits, journal/evaluation records, and messages persist after reload and from a second browser session.
12. Verify the actual deployed environment, database, OAuth redirect origins, Jitsi service, backups, monitoring, and rate limiting rather than relying on repository configuration alone.

## Final assessment

**The app is not production-ready for professional use today.** It is suitable for continued development or a controlled internal demo/staging environment after clearly labeling the demo paths. It should not be marketed as a dynamic production speaker platform until the runtime fixtures, fabricated interactions, hardcoded credentials, and local-only workflows are removed and the release gate is revalidated.
