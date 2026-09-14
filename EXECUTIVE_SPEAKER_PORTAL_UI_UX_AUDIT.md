# Executive Speaker Portal UI/UX Audit

**Audit date:** 2026-09-14

## Overall assessment

The executive speaker portal has a strong visual direction: dark editorial surfaces, a restrained gold accent, credible executive/public-speaking terminology, and a thoughtful split between progress, rituals, curriculum, messaging, and live rehearsal.

The main weakness is not visual polish. It is **information density and task hierarchy**. The portal currently feels like a sophisticated dashboard rather than a calm executive coaching instrument. The next design pass should prioritize clarity, focus, and session flow instead of adding more dashboard features.

## What is working well

- Executive-specific language is stronger than generic fitness-dashboard terminology. Labels such as “Boardroom Defense,” “Venture Pitch,” “BLUF,” and “High-Stakes Persuasion” create a distinct product identity.
- The charcoal and gold palette creates a credible premium tone.
- The portal adapts content based on the speaker’s mission, discipline, and focus.
- The live rehearsal room supports both hosted video and a native rehearsal mode.
- Responsive two-column metric cards preserve useful density on mobile.
- The portal includes the right broad areas: current protocol, rituals, curriculum, progress, messaging, and rehearsal.

## Highest-priority UX issues

### 1. There is no single dominant next action

The home view presents metrics, assignments, curriculum, rituals, progress records, messaging, and live rehearsal with similar prominence. A speaker should immediately understand:

> What should I do now, how long will it take, and what outcome am I training?

Make the first viewport a single **Today’s rehearsal** command center:

- session title
- estimated duration
- one primary CTA: **Begin session**
- three compact objectives
- completion state
- secondary actions: **Message coach** and **Review last feedback**

Move cumulative metrics below that block.

### 2. Too many sections have equal visual weight

The portal repeatedly uses large rounded cards with similar borders, padding, and dark backgrounds. This makes every section look equally important and creates visual fatigue.

Establish three visual tiers:

| Tier | Use |
|---|---|
| Primary | Current session, active rehearsal, coach assignment |
| Secondary | Metrics, rituals, progress history |
| Tertiary | Metadata, historical notes, supporting context |

Use fewer large cards. Supporting content can use hairline rules, compact rows, and plain editorial blocks instead of another rounded panel.

### 3. Mobile layouts are dense

The responsive grid is directionally correct, but the interface relies heavily on 9–11px labels, uppercase tracking, multiple badges, compact padding, long titles, and four-column metric layouts.

Recommendations:

- Keep the two-column metric grid, but limit each card to one primary value and one short descriptor.
- Use at least 13–14px for interactive mobile text.
- Reserve 9–10px mono text for metadata only.
- Clamp long titles to two lines with an expansion affordance.
- Give mobile controls a minimum touch target of approximately 44px.
- Do not place four independent actions in one horizontal row on narrow screens.

### 4. The live rehearsal room is cognitively overloaded

`LiveRehearsalRoom.tsx` combines video, native P2P mode, timer presets, local/remote video states, audio meters, camera controls, screen sharing, room identity, evaluation rubric, speech metrics, and feedback capture in one uninterrupted workspace.

Separate the live room into explicit modes:

1. **Rehearse** — video, microphone, timer, prompt
2. **Evaluate** — rubric, notes, speech metrics
3. **Debrief** — saved feedback, next assignment, replay

On mobile, use a persistent segmented control with only these three destinations. Do not make users scroll through controls belonging to another phase.

### 5. The timer needs stronger session semantics

The timer presets are useful, but the UI should clearly answer:

- What phase am I in?
- What is the target?
- What happens when time expires?
- Can I pause?
- Is this a rehearsal or an evaluation?

Recommended presentation:

```text
BOARDROOM DEFENSE
Phase 2 of 4 · Q&A stress test

07:00
Target: answer, bridge, and close

[Start] [Pause] [Reset]
```

Use a phase-progress indicator rather than only a countdown and preset buttons.

### 6. Workspace switching distracts from the speaker task

The portal header exposes Coach OS and Public Site actions. These are useful system links, but they compete with the speaker’s current task and make the portal feel like an admin shell.

Move workspace switching into a profile or workspace menu. Keep the main header focused on:

- Global Orators mark
- current protocol
- messages/notifications
- profile menu

### 7. Sign-out is too prominent

Sign-out appears alongside primary workspace actions and receives destructive styling.

Move it into the profile menu. Reserve the top bar for navigation and current-work context.

## Recommended information architecture

Use a clearer speaker navigation model:

```text
Today
Practice
Progress
Rituals
Coach
Profile
```

### Today

- current assignment
- next rehearsal
- coach’s latest note
- one primary action
- compact progress snapshot

### Practice

- curriculum sessions
- drills
- rehearsal room
- speech timer

### Progress

- pacing
- clarity
- BLUF score
- filler-word trend
- historical evaluations

### Rituals

- daily habits
- streak
- missed items
- reset or edit ritual

### Coach

- direct thread
- assignments
- feedback archive

This is easier to understand than placing many dashboard surfaces under one portal view.

## Design-system recommendations

### Use color by meaning

Suggested semantic system:

- **Gold:** current protocol, primary action, executive focus
- **Teal:** insight, progress, analysis
- **Green:** complete, on target, healthy state
- **Amber:** attention, incomplete, upcoming
- **Red:** destructive or urgent only

Avoid changing accent colors based on branch unless the color communicates a real state.

### Reduce badge count

Keep badges only for:

- session status
- completion state
- branch/protocol
- live connection state

Replace decorative badges with plain typography and dividers.

### Tighten typography

Recommended hierarchy:

- Serif for page and session titles
- Sans for explanatory copy and controls
- Mono for timestamps, technical metadata, WPM, and room IDs
- Avoid all-caps for sentences or instructional copy

The current combination of serif headings, mono labels, bold sans text, and many small uppercase captions is expressive but occasionally noisy.

### Reduce card radius and shadow repetition

Repeated `rounded-2xl`/`rounded-3xl` cards and shadows make the interface feel like a collection of floating modules. An editorial executive product would benefit from:

- fewer shadows
- more hairline separators
- one or two large anchor surfaces
- flatter supporting lists

## Recommended portal home layout

```text
[Header]
Global Orators                         Profile / Messages

[Protocol strip]
Executive Investor Pitch
High-Stakes Persuasion & Presence
Week 3 · Session 2 · 42 min

[Primary session card]
Today's rehearsal
The 60-Second Venture Genesis
3 objectives
[Begin rehearsal]

[Compact metrics]
Pacing       Clarity       BLUF score       Sessions

[Two-column section]
Left: Coach assignment / latest feedback
Right: Daily rituals

[Progress section]
Trend chart + last three evaluations

[Lower section]
Curriculum roadmap
Message coach
```

This gives the speaker a clear action before asking them to process analytics.

## Accessibility and interaction audit

The next implementation pass should verify:

- keyboard navigation for tab controls and mobile navigation
- visible focus states on all buttons and inputs
- focus trapping and focus restoration in the live rehearsal dialog
- Escape-to-close behavior for every modal
- screen-reader labels for icon-only buttons
- timer state changes announced with `aria-live`
- connection status changes announced in the live room
- sufficient contrast for small slate-gray labels
- avoiding `select-none` across the live studio, since users may need to copy prompts, room IDs, or feedback
- no hover-only explanations on touch devices
- tab controls exposing `role="tablist"`, `role="tab"`, `aria-selected`, and controlled panel relationships

The live room has dialog semantics, which is a good foundation, but the complex modal still needs a full focus-management audit.

## Content and copy improvements

Keep the editorial tone in headings, but make instructions concrete and immediately actionable:

| Current style | Recommended wording |
|---|---|
| Forensic Speech Timer | Practice clock |
| Protected Period | Protected speaking time |
| Speaker Vault | Saved feedback |
| Executive Investor Pitch | Investor pitch rehearsal |
| Dialectical Clash & Poise | Clash and composure |

Add plain-language explanations beneath evocative labels when the meaning is not immediately obvious.

## Testing recommendations

Add dedicated coverage for:

- mobile viewport behavior
- keyboard-only navigation
- dialog focus trapping
- screen-reader labels
- timer pause, reset, and expiry behavior
- connection loss and reconnect states
- long names and long protocol titles
- empty states for progress, messages, and rituals
- loading and API failure states
- reduced-motion behavior
- speaker versus coach role differences
- portrait phone layout for the live rehearsal room

## Prioritized implementation plan

### Phase 1 — High impact

1. Rework the portal home around one “next action.”
2. Simplify header actions and move workspace switching/sign-out into a profile menu.
3. Split the live room into Rehearse, Evaluate, and Debrief modes.
4. Improve mobile typography, touch targets, and title wrapping.
5. Add explicit loading, empty, offline, and error states.

### Phase 2 — Visual refinement

1. Reduce card repetition and shadows.
2. Consolidate semantic colors.
3. Reduce decorative badges.
4. Introduce editorial dividers and denser list rows.
5. Refine the type scale.

### Phase 3 — Accessibility and resilience

1. Add full keyboard and focus management.
2. Add timer and connection announcements.
3. Add reduced-motion handling.
4. Expand mobile and accessibility test coverage.
5. Validate the live room on narrow portrait and landscape screens.

## Bottom line

The portal has a distinctive visual identity and credible executive positioning. Its next improvement should be **clarity, not more features**: one clear action, fewer competing surfaces, calmer hierarchy, and a live rehearsal flow organized around the speaker’s actual session phases.
