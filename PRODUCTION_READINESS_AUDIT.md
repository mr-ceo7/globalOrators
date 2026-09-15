# Global Orators Full Application Audit

**Audit date:** 2026-09-14
**Audited HEAD:** `ef0b249` (`feat(production): implement durable storage service, isolate fixtures, harden auth session and admin bootstrap`)
**Scope:** Demo/mock/fixture data, hardcoded user-facing facts, browser-only state, API persistence, authentication, authorization, storage, deployment configuration, and production validation
**Verdict:** **NO-GO for professional public production**

## Executive summary

The latest remediation closes several prior defects:

- `src/data/mockData.ts` was moved to `tests/fixtures/legacyMockData.ts`, outside the production source tree.
- Development seed data was moved to `backend/fixtures` and remains explicitly gated.
- Speaker profile resolution uses authenticated `/clients/me`; `/clients/lookup` remains extinguished.
- Journals and simulations fail closed without a server-linked profile.
- Recordings have authenticated ownership checks, binary validation, a 25 MB limit, retry/discard UI, deletion, storage keys, and storage service tests.
- Program assignment is API-first and refreshes from the backend.
- Fallback curriculum is now labeled `Recommendation Preview`; assigned curriculum is labeled separately.
- Initial admin provisioning is controllable through `BOOTSTRAP_INITIAL_ADMIN` or `bootstrap_admin.py`.
- Frontend validation, backend validation, production build, dependency audit, and whitespace checks pass.

The app is still **not ready for professional production**. The most important remaining blockers are production configuration and fail-closed storage behavior: storage defaults to local disk, S3 upload/read failures silently fall back to local storage, Render does not configure the required SMTP/storage/admin variables, and JWT bearer tokens remain in `localStorage`. The repository also contains static authored curriculum and public editorial content; these are acceptable only where clearly labeled and never treated as live user activity.

## Critical findings

### C1. Storage is not fail-closed or guaranteed durable in production

`backend/app/storage.py` supports S3-compatible storage, but:

- `STORAGE_BACKEND` defaults to `local`.
- If S3 upload fails, `save_file()` logs the error and silently writes to local disk.
- If S3 read fails, `read_file()` silently attempts local lookup.
- If S3 delete fails, local deletion can still succeed and the API can continue.
- Production configuration does not require `STORAGE_BACKEND=s3` or a configured bucket.

**Impact:** A production deployment can report a successful recording upload while storing it on ephemeral application disk, or mask an object-storage outage by changing the durability path without an operator decision.

**Required fix:** In production, require a configured durable backend and fail closed on S3/object-storage errors. Do not silently fall back to local disk. Add startup validation and an integration test against the actual production-compatible object store.

### C2. Render deployment configuration is incomplete for the claimed production features

`render.yaml` configures the database, JWT secret, coach invite code, generated coach password, and Google OAuth variables, but does not configure:

- `SMTP_USERNAME` and `SMTP_PASSWORD`, which production settings require;
- `FROM_EMAIL` and SMTP delivery settings;
- `STORAGE_BACKEND`, `S3_BUCKET`, region, endpoint, or object-storage credentials;
- `BOOTSTRAP_INITIAL_ADMIN`;
- `DEFAULT_COACH_EMAIL`/`DEFAULT_COACH_NAME` if they are expected to be deployment-specific.

**Impact:** The service can fail to start in production because SMTP settings are required, or it can start with local storage and lose recordings on redeploy. The code and deployment manifest do not describe one coherent production configuration.

**Required fix:** Add all required production environment variables to the deployment contract, mark secrets appropriately, make durable storage mandatory, and add a deployment validation step that fails before traffic is served.

### C3. Bearer tokens and identity caches remain in localStorage

`src/services/apiClient.ts`, `AppContext.tsx`, and `LiveRehearsalRoom.tsx` still read and write JWT bearer tokens from `localStorage`. User metadata and the cached speaker profile are also stored there.

**Impact:** Any XSS or compromised third-party script can exfiltrate active credentials. The CSP improves browser hardening but does not make localStorage bearer tokens equivalent to HttpOnly cookies.

**Required fix:** Use secure HttpOnly SameSite cookies or a short-lived token exchange. Keep server identity authoritative and treat browser storage as non-authoritative UI preference state only.

## High-severity findings

### H1. S3/object-storage integration is not exercised by the test suite

The new storage tests verify the local backend only. There is no production-compatible S3/R2 integration test covering upload, read, delete, quota behavior, credential failure, or deployment configuration.

**Required fix:** Add an opt-in integration test using a real or test object-storage service and verify the application refuses to start or upload when durable storage is misconfigured.

### H2. Static recommendation content remains extensive, though now labeled

`src/utils/curriculumResolver.ts` still generates authored drills, prompts, sessions, workshops, objectives, and descriptions when no coach-assigned database program exists. `ClientPortal.tsx` now labels this state as `Recommendation Preview` and uses `Recommended Rehearsal Preview`, which materially reduces the risk of presenting it as a factual user record.

**Assessment:** This is acceptable as product recommendation content, not as live business data. It must remain visually and semantically separate from assigned, scheduled, completed, or coach-authored records.

### H3. Static public/editorial content remains in the application

Landing pages, testimonials, photography, speaker spotlights, authored curriculum copy, and the explicitly labeled `Educational Demo Model` are static by design. They are not defects when confined to public/editorial surfaces. They would be defects if copied into authenticated dashboards as real speaker history, metrics, verified testimonials, or coach communications.

### H4. Production bootstrap still has a dangerous opt-in path

The default for `BOOTSTRAP_INITIAL_ADMIN` is false, and `bootstrap_admin.py` provides controlled provisioning and rotation. However, setting `BOOTSTRAP_INITIAL_ADMIN=true` still creates an administrator from environment-provided credentials during application startup.

**Required fix:** Prefer a one-time deployment job or manual bootstrap command, then disable the startup path permanently. Add an explicit audit check that production never starts with bootstrap enabled after initial provisioning.

### H5. Fixture files remain available in the repository

Fixtures are better isolated:

- frontend legacy mock data is under `tests/fixtures`;
- backend seed data is under `backend/fixtures`;
- production runtime seed remains gated and prohibited in production.

They still contain fictional records and are reachable through explicit seed commands. This is acceptable for development only, but not if the deployment artifact or production-adjacent package includes them unnecessarily.

**Required fix:** Exclude fixture packages from production build artifacts and CI deployment bundles, or move them to a separate development-only package/repository.

## Medium findings

### M1. Hardcoded source defaults remain

`backend/app/config.py` still contains development defaults for JWT secret, coach password, invite code, default coach identity, SMTP host/from address, local storage backend, and a real-looking Google client ID. Production validation rejects several insecure values, but source defaults remain risky and can confuse operators or leak into non-production deployments.

**Required fix:** Use neutral placeholders or required settings for production-capable configuration. Validate Google OAuth, SMTP sender, storage backend, database URL, and CORS origins explicitly in production.

### M2. Backend source documentation is stale

`backend/app/main.py` still describes the lifespan as initializing tables and “seed mock data,” although the current implementation gates development fixtures and does not seed production. This is operationally confusing and should be corrected.

### M3. Local preview behavior is correctly disclosed but still browser-only

Failed or unlinked recording uploads remain playable as local previews. The UI explicitly says `local preview only` and provides retry/discard behavior, so this is no longer a fabricated persistence claim. It remains unavailable across reloads and must not be counted as a recording, metric, or coach-visible artifact.

### M4. Production operational evidence remains incomplete

Repository tests cannot prove:

- the deployed database contains no historical fixture rows;
- SMTP delivery works and is monitored;
- object storage is durable and backed up;
- OAuth origins and redirects are correct;
- backups/restores have been executed;
- rate limiting works across multiple instances;
- WebRTC/Jitsi signaling works through the production proxy;
- monitoring, alerting, audit logs, incident recovery, and credential rotation are active.

### M5. Backend warnings remain

The backend suite passes but emits Pydantic alias/serialization warnings. These should be resolved before release to prevent API contract drift.

## Dynamic-data matrix

| Surface | Current source | Assessment |
|---|---|---|
| Coach roster | Authenticated API and rollback-enabled mutations | Dynamic; deployment verification pending |
| Speaker profile | Authenticated `/clients/me` | Dynamic and access-controlled |
| Programs/drills | API-assigned data or labeled recommendation preview | Conditional but semantically separated |
| Program assignment | Backend assignment followed by refresh | Dynamic |
| Roadmap/workouts | API-backed scheduled records | Dynamic when API succeeds |
| Metrics/evaluations | API-backed records | Dynamic when API succeeds |
| Journals | Authenticated database records only | Dynamic and fail-closed |
| Simulations | Authenticated database records only | Dynamic and fail-closed |
| Recordings | Database metadata plus pluggable storage service | Code supports durable storage, production backend not enforced |
| Habits | Server-selected onboarding rituals and persisted logs | Dynamic |
| Messaging | API-backed send/list with rollback | Dynamic when API succeeds |
| Live rehearsal | Authenticated WebSocket/WebRTC/Jitsi paths | Code path exists; deployment unverified |
| Marketing/editorial | Authored static content | Acceptable only on public/editorial surfaces |
| Theme/portal preference | Browser preference storage | Acceptable; not business data |

## Validation performed

| Check | Result | Notes |
|---|---|---|
| Frontend type-check | **Passed** | `npm run lint` |
| Frontend tests | **Passed** | 13 files, 92 tests |
| Frontend production build | **Passed** | Vite build; largest emitted chunk approximately 363.56 kB |
| Backend tests | **Passed** | 12 tests |
| Production dependency audit | **Passed** | 0 high-severity vulnerabilities |
| Git whitespace check | **Passed** | `git diff --check` |
| Demo/mock/static audit | **Failed release gate** | Static authored content and development fixtures remain; localStorage auth and storage fallback remain |
| Production deployment audit | **Incomplete** | Render environment lacks required SMTP/storage/bootstrap configuration |

## Release gate

Do not approve professional public production until:

1. Production requires a durable object-storage backend and fails closed on storage errors; no silent S3-to-local fallback is allowed.
2. `render.yaml` and the production environment define SMTP, storage, OAuth, database, CORS, and admin-bootstrap configuration consistently.
3. JWT bearer tokens are moved out of localStorage, or the risk is formally accepted after a dedicated XSS/CSP review.
4. Object-storage integration is tested against the production-compatible service, including failure and restore paths.
5. Fixtures are excluded from production deployment artifacts and the deployed database is confirmed free of fictional rows.
6. Startup admin bootstrap is disabled after one-time provisioning and is covered by an operational control.
7. Recommendation previews remain clearly distinct from assigned/scheduled/completed work.
8. Production SMTP, OAuth, backups/restores, monitoring, distributed rate limiting, and live-session signaling are verified in the deployed environment.
9. Pydantic schema warnings are corrected or explicitly accepted with an API compatibility review.

## Final verdict

**NO-GO.** The latest commit substantially improves the app: fixtures are isolated, recommendation previews are labeled, admin bootstrapping is controllable, and storage abstraction plus validation are present. The application is still not ready for professional production because durable storage is not enforced and silently falls back to local disk, the deployment manifest omits required production variables, JWTs remain in localStorage, fixture/static content remains in the repository, and real production infrastructure has not been verified end to end.
