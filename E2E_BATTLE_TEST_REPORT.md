# Global Orators: End-to-End Battle Test Report

**Date:** 23 Sep 2026 · **Branch:** `test/e2e-battle-audit` · **Online version:** https://claude.ai/artifact/VwJ8uoWocyAEUS9eGP3nPY

Every public page, onboarding step, coach screen and speaker screen was driven in a real browser at desktop (1440px) and phone (Pixel 7) sizes, in light and dark themes. Testing ran against an isolated copy of the app with a throwaway database. Every finding below was reproduced, and most have a Playwright test that fails until the bug is fixed.

| | |
|---|---|
| **Environment** | Local stack on :3100 / :8105, seeded SQLite, emails simulated. Production was not touched. |
| **Suite** | 136 test runs across desktop and mobile. **86 pass.** **29 fail on purpose**: each one reproduces a finding below and will pass once that bug is fixed. 21 are skipped: checks that only apply to one screen size, plus 4 mobile coach tests that still need phone-layout selectors. |
| **Existing checks** | `tsc` clean · Vitest 130/130 · backend pytest 25/25 · production build OK |
| **Findings** | 3 Critical (incl. C3, found during fixes) · 8 High · 11 Medium · 4 Low (grouped) |

## Fix status

Critical and high issues were fixed on this branch. The browser suite now has **103 passing**, up from 86. The 14 tests still failing each reproduce a medium or low issue that hasn't been fixed yet.

| ID | Status | Fix |
|---|---|---|
| C1 | Fixed | `POST /api/clients` returns 409 with no profile data unless the signed-in speaker owns the email. A signed-in speaker can only onboard their own email. The loose phone-number match was removed. |
| C2 | Fixed | After an anonymous application, the app emails a sign-in passcode and opens the speaker login at the passcode step with the email filled in. Applying with an email that's already enrolled goes to sign-in instead. |
| C3 | Fixed (new) | Google sign-in no longer grants the coach role without a valid invite code, and never promotes an existing account (`auth.py`). |
| H1 | Fixed | A 401 from the login endpoints no longer clears the session; the server's message is shown instead. An expired session now says "Your session has expired. Please sign in again." |
| H2 | Fixed | Coach sign-up has a "Faculty Invite Code" field. The hard-coded `FACULTY-INVITE-2026` is gone from the frontend. |
| H3 | Fixed | A duplicate email returns 409. The Add Speaker form stays open, keeps what was typed, and shows the server's message. Success is only announced after the server confirms. |
| H4 | Fixed | Recording duration is measured from start and stop timestamps. |
| H5 | Fixed | When there's no record for today, both the app and the backend carry over the rituals from the speaker's most recent record. |
| H6 | Fixed | `WorkoutLoggerModal` is split into a wrapper and a dialog keyed by session ID, so the hooks always run in the same order. |
| H7 | Fixed | Updating the video-call domain requires `JITSI_UPDATE_TOKEN` (header `X-Jitsi-Update-Token`); requests from localhost are no longer trusted. The watchdog sends the token from `/home/qsm/jitsi/watchdog.env`. **Deploy note:** set the same `JITSI_UPDATE_TOKEN` for the backend and the watchdog, or domain rotation will stop updating. |
| H8 | Fixed | `@custom-variant dark (&:where(.dark, .dark *));` added to `src/index.css`. |

## Production server (10.42.0.1), 23 Sep 2026

### C4. Production was running on the repo's public default secrets (fixed and deployed)
The live backend had no `SECRET_KEY`, `ENVIRONMENT` or `COACH_INVITE_CODE` set, so it used the defaults written in `config.py`:
- Login tokens were signed with the public default key, so anyone could forge a head-coach token.
- In development mode, `/api/auth/otp/send` returned a working magic login link in its response, so anyone could sign in as any speaker. `/docs` was also public.
- The coach invite code was the repo default.

**Done:**
- Backed up everything to `~/backups/predeploy_20260923_124916`: code, `.env`, a consistent copy of the database (integrity check OK), the watchdog script and its service unit.
- Deployed the current backend (commit `4556a87`). The previous code is kept as `~/backend/app.prev_20260923_125120`.
- Added `ENVIRONMENT=production` and freshly generated `SECRET_KEY`, `COACH_INVITE_CODE`, `DEFAULT_COACH_PASSWORD` and `JITSI_UPDATE_TOKEN` to `~/backend/.env` (permissions 600).
- Installed the new watchdog with `~/jitsi/watchdog.env` (600) and added `EnvironmentFile` to its service unit.

**Verified from outside:**
- `/api/health` reports `environment: production` through both ngrok and `coach.globaloratorsproject.com`.
- `/docs` returns 404.
- Changing the video-call domain without the token returns 403.
- The watchdog's own domain update returns 200.
- A token forged with the old key returns 401.
- The new tables were created, no columns are missing, and all 11 users are intact.

**Side effects:** everyone was logged out once. The coach invite code for new faculty is `COACH_INVITE_CODE` in `~/backend/.env`.

**Rollback:** stop the service, move `app.prev_20260923_125120` back to `app`, restore `.env` and `nubianfit.db` from the backup folder, then start the service.

### Still open (needs your action)
- **Rotate the Google OAuth client secret.** It's stored in plain text in `/etc/systemd/system/globalorators-backend.service`, which any user on the box can read. Move the new one into `~/backend/.env`.
- **Rotate the Gemini API key** that appears in `~/.bash_history`.
- **Invoicing (commit `4556a87`):**
  - Every call to the payment backend (`payment-backend-0eo0.onrender.com`) is sent without authentication: listing all invoices, creating and editing them, setting status (for example to PAID), and starting M-Pesa payments. If that backend doesn't check who's calling, anyone can read or alter invoices.
  - `VITE_GEMINI_API_KEY` is used in the browser (`AdminInvoices.tsx:27`), so the key would be published in the JavaScript bundle.
  - A Paystack **test** key is the hard-coded fallback (`InvoicePage.tsx:117`).
- **The frontend fixes (C2, H1, H2, H3 UI, H4–H6, H8) need a Vercel deploy** before users see them. The backend is already live.

### C3. Anyone with a Google account could make themselves a coach (found while fixing H2)
- **Where:** `backend/app/routers/auth.py:274-301`
- **What happened:** Sending `role: "coach"` to `/api/auth/google` created a coach account with no invite code. It also silently upgraded an existing speaker to coach. That gave anyone with a Google account coach access, including the unassigned applicant pool.
- **Test:** `backend/test_api.py › test_google_sign_in_cannot_self_grant_coach_role`. It fails on the old code and passes on the fix.

---

## Critical

### C1. Anyone can overwrite a speaker's profile and read their personal data without logging in
- **Where:** `backend/app/routers/clients.py:360-411` (public intake endpoint `POST /api/clients`)
- **What happens:** The endpoint needs no login. If the submitted email already belongs to a speaker, it overwrites their goal, branch, avatar and intake survey. It then returns the full record, including phone, age, coach ID and survey answers.
- **Reproduce:**
  1. `curl -X POST /api/clients -d '{"email":"elena.rostova@example.com","goal":"HIJACKED","avatar":"https://evil.example/x.png"}'`
  2. Elena's goal and avatar are changed, and the response includes `"phone":"+1 (555) 876-5432"`.
- **Test:** `40-api-security › anonymous intake with an existing email…`

### C2. New applicants are sent back to the homepage after completing onboarding
- **Where:** `src/context/AppContext.tsx:1637` (`completeOnboarding` switches to `speaker_app` without a token), together with the 401 handler in `src/services/apiClient.ts:66` and `AppContext.tsx:983`
- **What happens:** A visitor clicks Apply, completes all 5 steps and presses *Enter Orators App*. Their record is created, but they have no login session. The speaker app immediately gets 401 errors, which wipe the session and redirect to `/`. The applicant sees no confirmation and isn't logged in, so to them it looks like the application failed.
- **Reproduce:**
  1. Open `/onboarding` in a fresh browser.
  2. Complete all steps and submit.
  3. You end up on the homepage. The network log shows 401s on `/journals`, `/recordings` and `/simulations`.
- **Test:** `50-onboarding › validation on step 3 and full submission`

---

## High

### H1. Any 401 reply ends the session, including a mistyped password or passcode
- **Where:** `src/services/apiClient.ts:66-69`; `AppContext.tsx:968-985` (the handler that runs when the session is cleared)
- **What happens:** The API client treats every 401 as "session expired": it clears storage and throws `Error('AuthenticationError')`. A speaker who mistypes their passcode is sent back to the homepage and has to start over. A coach who mistypes their password sees the literal text "AuthenticationError".
- **Fix direction:** Skip the session wipe for login endpoints, and show the server's `detail` message instead.
- **Tests:** `30-auth › wrong and short passcodes…`, `30-auth › wrong password shows an error`

### H2. Coach sign-up can never succeed
- **Where:** `src/context/AppContext.tsx:1938`
- **What happens:** A new email goes straight to the create-account form, which has no invite-code field. The frontend sends a hard-coded code, `FACULTY-INVITE-2026`, which doesn't match the backend's `COACH_INVITE_CODE`. Every attempt ends with "Valid coach invite code required", and that error is shown in a box that's barely readable (see M1).
- **Test:** `30-auth › new coach can register through the UI`

### H3. Adding a speaker whose email already exists silently overwrites that speaker
- **Where:** `backend/app/routers/clients.py:360-371`. When a coach submits a new speaker with an existing email, the backend updates the existing record instead of rejecting it.
- **What happens:** A coach adds "Duplicate Person" with `david.kim@example.com`. The app shows success, and David Kim's record is renamed and overwritten with the form's default values. Nothing warns the coach.
- **Test:** `60-coach-flows › adding a speaker with an email that already exists…`

### H4. Every voice recording is saved with a duration of 0 seconds
- **Where:** `src/components/clientApp/ClientPortal.tsx:345-361`
- **What happens:** The upload code inside `recorder.onstop` reads a stale `recordingSeconds` value, which is always 0. A 3.5-second recording was stored as `0` on both desktop and mobile. The fix is to read the elapsed time from a ref, or to compute it from the start and stop timestamps.
- **Test:** `70-speaker-flows › voice recording uploads with the real duration…`

### H5. Assigned daily rituals disappear after the first day
- **Where:** `ClientPortal.tsx:600-619`
- **What happens:** Marcus has five rituals on the server, but his screen today says "No daily orator rituals active". The list is built only from today's log or from the habits chosen during onboarding, so assigned rituals aren't carried over to new days.
- **Test:** `70-speaker-flows › assigned rituals are listed today…`

### H6. The Log Session form breaks React's hooks rules
- **Where:** `src/components/programs/WorkoutLoggerModal.tsx:31`
- **What happens:** The component returns early, before its `useState` calls run. Opening it logs "React has detected a change in the order of Hooks" and "Internal React error: Expected static flag was missing". This can reset what's been typed or crash the page. Fix: move the `return null` below the hooks, or split the modal's body into its own component.

### H7. The video-call domain can be changed by any request that reaches the backend as localhost
- **Where:** `backend/app/routers/system.py:88-96` (`POST /api/system/jitsi-domain`)
- **What happens:** The endpoint trusts any caller whose address is `127.0.0.1`. A request sent through the Vite `/api` proxy (which doesn't add `X-Forwarded-For`) was accepted and changed the domain used for live rooms. Whether this is reachable in production depends on how your tunnel or proxy forwards headers. If it doesn't forward them, anyone could redirect speakers' calls to a video server they control. Fix: require the shared secret on every call instead of trusting localhost.
- **Note:** This endpoint writes `backend/app/jitsi_domain.json`, which your dev backend also reads. That file has since been removed, and the test suite never calls this endpoint.

### H8. Dark-mode styles follow the operating system instead of the app's theme toggle
- **Where:** `src/index.css` (roughly 100 `dark:` classes across the app)
- **What happens:** In Tailwind v4, `dark:` classes follow the operating system's dark-mode setting by default, but the app switches themes by adding a `.dark` class. So when someone turns on dark mode in the app on a computer set to light mode, accent text stays dark brown (`#7A4B06`) on the dark background, at about 2.5:1 contrast. This shows on the homepage, About, Academy and other pages. The reverse happens on a computer set to dark mode when the app is set to light.
- **Fix:** Add `@custom-variant dark (&:where(.dark, .dark *));` to `src/index.css`.

---

## Medium

### M1. Error messages are unreadable in the light theme
- **Where:** `CoachLoginPortal.tsx:228`, `SpeakerLoginPortal.tsx:228`; `src/index.css` (the rose colours aren't remapped for light mode)
- Error boxes use `text-rose-300` on `bg-rose-950/30`, colours that only work on a dark background. The light theme remaps the grey and green palettes but not rose, so in light mode the error text is pale pink on a pink box.

### M2. The brand gold is too low-contrast for text and button labels
- **Where:** every screen, both themes
- `#C89630` text on the off-white background measures about 2.5:1. The near-white labels on gold buttons ("Continue", "Apply to Academy", "Send Login Passcode", "Start Voice Recording") measure 2.49:1. Accessibility guidelines (WCAG AA) require 4.5:1 for normal-size text, and the automated check flagged this on every screen scanned.
- **Fix direction:** Keep `#C89630` for fills and icons. Use a darker gold (around `#7A5410`) for text on light backgrounds, and dark text on gold buttons.

### M3. When the API is down, an existing coach is told to "Create Coach Account"
- **Where:** `AppContext.tsx:1901-1907`
- `checkCoachEmail` treats any failure as "this email doesn't exist", so the login screen's fallback to the password step never runs.
- **Test:** `80-public-forms › coach login shows a connection error…`

### M4. Log Session opens the wrong session, or does nothing
- **Where:** `src/components/layout/Header.tsx:87-93`
- When no session is scheduled for today, it falls back to `scheduledWorkouts[0]`, whatever its date or status. That can reopen a session that's already completed and complete it again, overwriting its feedback and counting it twice. When there are no sessions at all, the button does nothing and shows no message.

### M5. Blank session feedback is replaced with invented praise
- **Where:** `AppContext.tsx:1300-1301`
- If the coach leaves the feedback empty, the speaker's record gets "Great rehearsal session completed!" and "Excellent delivery and pacing consistency.", as if the coach had written them.

### M6. Some coach sections are hard or impossible to reach on a phone
- **Where:** `src/components/layout/MobileBottomNav.tsx`
- The bottom bar has Overview, Speakers, Schedule and Messenger. Curriculum Builder, the Drill Catalog and Speech Analytics can only be reached through the "+" sheet. **Faculty Coaches can't be reached on mobile at all.**
- **Test:** `10-coach-screens › mobile: every coach section is reachable`

### M7. The coach list and coach emails are public
- `GET /api/coaches` works without logging in and returns every coach's name, email and avatar, including the head coach's personal Gmail address.
- **Test:** `40-api-security › anonymous callers cannot list coach emails`

### M8. Head-coach rules are hard-coded and differ between frontend and backend
- The frontend treats `coach-1`, `kassimmusa322@gmail.com` and `coach@globalorators.com` as head coaches (`Sidebar.tsx:47`).
- The backend grants head-coach data access to `DEFAULT_COACH_EMAIL` or `coach-1` (`clients.py`, `journals.py`), and has its own separate list in `config.py:57-65`.
- Result: `coach@globalorators.com` sees the Faculty Coaches screen but can only see its own single speaker.
- Separately, if a login token is stored but no user profile is cached, the frontend assumes the person is a coach (`AppContext.tsx:520`). This only affects what the screen shows, because the backend still blocks the data.

### M9. Message timestamps read "oday," and messages appear out of order
- **Where:** `ClientPortal.tsx:633`
- The code finds the time by splitting on `'T'` (`timestamp.split('T')[1]`), so a stored value like "Today, 09:30 AM" gets cut at the "T" in "Today" and shows "oday,". New messages also appear above older ones.

### M10. A speaker's "today" is calculated in UTC and never updates
- **Where:** `ClientPortal.tsx:600, 650`; `Header.tsx:88`
- `new Date().toISOString().split('T')[0]` gives the UTC date, not the local one. In Nairobi (UTC+3), anything ticked between midnight and 3am counts toward the previous day. The value is also calculated once and never refreshed, so a tab left open overnight keeps using yesterday's date.

### M11. The header search box never appears
- **Where:** `Header.tsx:143`
- It uses `hidden xs:block`, but no `xs` breakpoint is defined in Tailwind v4, so the search box is hidden at every screen size.

---

## Low

### L1. Onboarding form issues
- **Where:** `OnboardingFlow.tsx:1179-1240`
- Validation errors pop up as browser `alert()` boxes instead of messages next to the fields.
- The phone field accepts "abc".
- Refreshing mid-form loses everything typed. Going back with Previous keeps the data, which works correctly.
- Foundation is pre-selected on step 1, before the visitor has chosen.

### L2. Roster search with no matches shows a blank page
- There's no "no results" message. On desktop, the search box is also squashed down to the width of its icon.

### L3. Made-up values and missing range checks
- A blank phone number is saved as `+1 (555) 000-1234` (`ClientRoster.tsx:167`).
- Curriculum weeks accept 0, −5 and 99999, and `PATCH /api/programs` saves them.
- The speaking-speed (WPM) chart reads its values from `item.weight`, a leftover field from the fitness app.

### L4. Small UX and accessibility issues
- If the contact form fails to send, it shows the raw browser error "Failed to fetch". The typed message is kept, which works correctly.
- Unknown URLs show the homepage instead of a 404 page, which duplicates content for search engines.
- Icon-only buttons have no accessible name: notifications, the calendar month arrows, and the header icons on the mobile login screens.
- The labels on the schedule form aren't linked to their inputs.
- On mobile, the HOME link, footer email links and "Full Calendar" are under 24px tall, too small to tap reliably.
- Chart values only appear on mouse hover, so phone and tablet users can't see them (`ClientPortal.tsx:1978`).
- On mobile, the "Speaker cues" quick replies are cut off ("How…", "Rev…"). The "ACADEMY" badge in the speaker sidebar is cut off too.
- "Save Reflection" and "Log Session" do nothing, and show no message, when there's nothing to save or log.
- Deleting a curriculum uses the browser's `confirm()` popup. Deleting a recording asks for no confirmation at all.
- The live chamber footer says "End-to-End Encrypted". A Jitsi call routed through a media server isn't end-to-end encrypted unless E2EE is turned on (`LiveRehearsalRoom.tsx:1510, 1520`).
- `jitsiDiscovery.ts:47` calls the production API directly, which causes CORS errors on localhost and on preview deployments.
- The live-updates connection (SSE) sends the login token in the URL (`?token=`), so full tokens end up in server and proxy access logs (`sseClient.ts`, `routers/events.py`).
- Contact emails use two different domains: `@globalorators.org` and `@globaloratorsproject.com`.

---

## What was tested

| Area | Covered | Result |
|---|---|---|
| Public site (11 pages + unknown URL) | Page load, layout, text contrast, every link and button clicked, theme toggle, mobile menu, refreshing deep links | Works; no broken controls |
| Contact form, partner modal | Validation, double-click submit, network failure, keyboard (Escape, focus) | Minor: raw error text on failure |
| Onboarding (5 steps) | Validation, invalid input, going back, refreshing, double submit, final submission | **Broken**: ends on the homepage |
| Speaker login | Invalid email, wrong or short passcode, unknown email, magic link (valid, reused, invalid), bad stored token, page reload | **Bug**: a typo ends the session |
| Coach login and sign-up | Wrong password, sign-up, short password, API down, staying logged in after reload, sign-out | **Bug**: sign-up impossible |
| Coach: speakers | Add (empty, duplicate email, code-injection attempt), search, sort, all 6 profile tabs, adjudication note | **Bug**: duplicate add overwrites |
| Coach: curriculum, drills, schedule | Create, settings, extreme numbers, delete, add drill, schedule a session, month navigation | Works; no range checks |
| Coach: faculty, messenger, header | Add coach (duplicate email, short password, new coach can log in), send message, blank message, notifications, Create menu, invite link | Works |
| Speaker app (7 tabs) | Recording (simulated mic), mic permission denied, journal, rituals, messenger, live chamber, sign-out | **Bugs**: recording duration, rituals, timestamps |
| API authorization | Speaker accessing another speaker, speaker accessing coach endpoints, no login, tampered or `alg:none` tokens, oversized and malformed requests | **Bugs**: intake endpoint, public coach list |
| Dead-button check | Every visible button and link on 51 screens clicked one at a time from a fresh page (754 clicks) | Works; the only silent buttons are Log Session with nothing to log and Save Reflection when empty |

## Confirmed working
- A speaker can't read or change another speaker's data; every such request returns 403.
- Speakers can't call coach-only endpoints.
- Tampered login tokens, and tokens using `alg:none`, are rejected.
- Code typed into names, messages and journals is shown as plain text and never runs.
- Magic login links work once and are then refused, and the token is removed from the URL.
- Oversized and malformed requests never cause a 500 server error.
- The contact and partner forms send exactly one request on a double click.
- When adding faculty, duplicate emails and short passwords are rejected.
- Another speaker can't stream someone's recordings.
- The "microphone permission denied" message is clear and helpful.
- The theme choice survives a reload, and closing the mobile menu lets the page scroll again.
- Creating and deleting a curriculum, creating a drill, scheduling a session and sending messages all save to the server.

## Not covered
- **Rate limits and real OTP email delivery.** The backend's test mode turns off rate limiting and accepts the passcode `123456`.
- **Google sign-in** beyond opening its popup.
- **Real audio and video** inside a Jitsi call.
- **Production itself**, which was deliberately left alone.

## How to re-run
```bash
npm run e2e:servers          # isolated stack: frontend :3100 → backend :8105, throwaway DB
npm run test:e2e             # all specs, desktop + mobile
npx playwright show-report e2e/.run/report
npm run e2e:stop
```
The test files are in `e2e/specs/`. `20-dead-buttons` is the slow one that clicks every button. Screenshots, layout and contrast results, and the dead-button data are written to `e2e/.run/`, which git ignores.
