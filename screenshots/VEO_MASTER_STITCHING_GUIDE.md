# Global Orators — Master Veo Video Stitching & Production Guide

This master blueprint specifies how to transform the high-resolution platform screen captures in [`screenshots/`](file:///home/qassim/globalOrators/screenshots) into a cinematic, high-end product launch video using **Google Veo 2** (Image-to-Video) and any Non-Linear Editor (DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro, or CapCut).

---

## 1. Executive Vision & Visual Architecture

Global Orators is a forensic forensics and sovereign leadership engine built for African youth and world-stage debaters. The video motion style rejects generic pastel SaaS templates and cheap AI tropes. Instead, it adopts the tactile, deliberate physical presence of an editorial documentary combined with the mechanical precision of an Apple keynote.

```
+---------------------------------------------------------------------------------------------------+
| TOTAL RUNTIME: 22 SECONDS (530 FRAMES @ 24 FPS)                                                   |
+-------------------+--------------------+--------------------+--------------------+----------------+
| 00:00 - 00:05     | 00:05 - 00:10      | 00:10 - 00:15      | 00:15 - 00:20      | 00:20 - 00:22  |
| SCENE 01: HERO    | SCENE 02: COACH    | SCENE 03: ROSTER   | SCENE 04: CHAMBER  | FINALE / OUTRO |
| Landing Manifesto | Command Dashboard  | Speaker Dossiers   | Rehearsal Rituals  | Logo & Domain  |
| 01_landing_page   | 02_coach_dashboard | 04_client_roster   | 03_speaker_portal  | Architectural  |
+-------------------+--------------------+--------------------+--------------------+----------------+
```

---

## 2. Core Generation Parameters for Google Veo 2

When importing each source screenshot into Google Veo 2 via **Image-to-Video (I2V)**, apply the following baseline parameters:

| Parameter | Recommended Setting | Rationale |
| :--- | :--- | :--- |
| **Model** | Google Veo 2 / Veo 2 HD | High spatial consistency with UI typography and crisp grid borders |
| **Aspect Ratio** | `16:9` (1920x1080) or `9:16` (1080x1920 mobile cut) | Matches source screenshots captured at native 1920x1080 |
| **Duration Per Clip** | `5 seconds` | Allows ample headroom for 0.5s transition head/tail overlaps |
| **Motion Bucket / Intensity** | `3` to `4` (on a 1–10 scale) | Restricts UI distortion; maintains razor-sharp text glyphs while allowing fluid 3D camera translation |
| **Framerate** | `24 fps` (cinematic cadence) or `30 fps` | Editorial filmic tempo matching parliamentary chamber aesthetics |
| **Prompt Structure** | `[Physical Camera Physics] + [Subject Focus] + [Lighting & Ambient Dynamics] + [Negative Constraints]` | Proven prompt formula for distortion-free UI animations |

---

## 3. Scene Breakdown & Shot List

### [Scene 01: The Public Manifesto (00:00 – 00:05)](file:///home/qassim/globalOrators/screenshots/scene_01_landing_page.md)
* **Source Image**: [`screenshots/01_landing_page.png`](file:///home/qassim/globalOrators/screenshots/01_landing_page.png)
* **Visual Anchor**: Editorial headline *"Words Shape Nations. Silence Breaks Them."* and documentary debate photograph.
* **Camera Movement**: Slow 35mm physical dolly forward with a subtle 2-degree counter-clockwise tilt. Ambient warm raking light washes across the cream paper background.
* **Exit Cut**: Fast whip-pan zoom into the gold "Apply to Academy" button.

### [Scene 02: Coach OS Command Center (00:05 – 00:10)](file:///home/qassim/globalOrators/screenshots/scene_02_coach_dashboard.md)
* **Source Image**: [`screenshots/02_coach_dashboard.png`](file:///home/qassim/globalOrators/screenshots/02_coach_dashboard.png)
* **Visual Anchor**: Coach Overview dispatch desk, active speaker metrics (100% fluency), and the live milestone feed.
* **Camera Movement**: Sweeping low-angle crane shot descending from upper-left to center-right. Subtle card elevation with architectural drop-shadow depth.
* **Exit Cut**: Match-cut tracking rightward into the sidebar navigation link *"Speakers & Debaters"*.

### [Scene 03: Forensic Debater Roster (00:10 – 00:15)](file:///home/qassim/globalOrators/screenshots/scene_04_client_roster.md)
* **Source Image**: [`screenshots/04_client_roster.png`](file:///home/qassim/globalOrators/screenshots/04_client_roster.png)
* **Visual Anchor**: Geoffrey Anyona's speaker dossier card (Academy Track, Executive Pitching, 100% Fluency).
* **Camera Movement**: Steady horizontal track from left to right with shallow depth of field. Soft focal blur shifts from the filter bar onto the primary speaker dossier.
* **Exit Cut**: Rapid push-in directly into the speaker profile avatar, blurring into the speaker chamber.

### [Scene 04: The Speaker Studio & Ritual Chamber (00:15 – 00:20)](file:///home/qassim/globalOrators/screenshots/scene_03_speaker_portal.md)
* **Source Image**: [`screenshots/03_speaker_portal.png`](file:///home/qassim/globalOrators/screenshots/03_speaker_portal.png)
* **Visual Anchor**: Calibrated Cadence gauge (145 WPM) and Today's Daily Rituals checklist.
* **Camera Movement**: Macro close-up push towards the 145 WPM cadence card, tilting down toward the Diaphragmatic Breathwork ritual tile. Golden amber ambient pulse.
* **Exit Cut**: Hard snap zoom-out to black with architectural hairline borders framing the logo.

### [Scene 05: Assembly, Sound Design & Finish (00:20 – 00:22)](file:///home/qassim/globalOrators/screenshots/scene_05_assembly_and_transitions.md)
* **Visual Anchor**: Minimalist gold foil insignia on deep obsidian black (`#0B0F17`) with URL: `globaloratorsproject.com`.
* **Audio Climax**: Low resonance debate gavel strike, lingering sub-bass pad, and crisp mechanical shutter release.

---

## 4. Master Veo Prompting Formula (Zero UI Distortion)

When prompting Google Veo 2 with static UI screenshots, standard generative prompts often cause letters to warp or UI elements to melt. To enforce absolute typographic integrity and crisp architectural edges, always include these strict positive and negative parameters:

### The Master Prompt Structure:
```text
Clean photographic camera motion of a sleek web software interface. 
[Insert specific camera movement: slow physical dolly-in / smooth 3D parallax tilt / steady macro pan]. 
The high-contrast typography, crisp borders, and layout structure remain perfectly rigid, sharp, and stable. 
Subtle studio lighting sweep across the screen surface, soft amber rim lighting, physical depth between floating card layers. 
8k resolution, shot on ARRI Alexa 35mm cinema lens, realistic optical physics, pristine UI fidelity.
```

### Universal Negative Prompt (Exclude in Veo parameters):
```text
text melting, distorted letters, morphing layout, illegible typography, blurry text, cartoon, 3D character, generic stock illustration, pastel gradients, floating emojis, cheap neon glow, warped borders, wobbling cards.
```

---

## 5. Sound Design Architecture (Tactile & Grounded)

The acoustic identity matches the editorial weight of the visual design:

| Timeline | Audio Event | Sound Specification |
| :--- | :--- | :--- |
| **00:00 – 00:05** | Scene 01 Intro | Subdued atmospheric room tone of an empty parliament hall. Low cello drone in D-minor. Subtle paper rustle. |
| **00:05** | Transition 1 | High-precision camera mechanical shutter click (`48kHz, 24-bit`). Sub-bass impact (`45 Hz`). |
| **00:05 – 00:10** | Scene 02 Coach | Muted mechanical keyboard typing cadence (tactile mechanical switches). Clean UI mouse click tick. |
| **00:10** | Transition 2 | Fast digital air woosh with low-pass filter sweep. |
| **00:10 – 00:15** | Scene 03 Roster | Soft ticking analog stopwatch. Smooth metallic slide sound. |
| **00:15** | Transition 3 | Deep diaphragm vocal breath intake. |
| **00:15 – 00:20** | Scene 04 Studio | Warm metronome click at 145 BPM syncopated with the 145 WPM pacing display. Rising orchestral swell. |
| **00:20 – 00:22** | Outro Climax | Resonant wooden debate gavel strike (`0.8s decay`). Deep sub-frequency tail. |

---

## 6. Directory Index

All individual scene prompt cards and transition timelines are organized within this directory:

- [`01_landing_page.png`](file:///home/qassim/globalOrators/screenshots/01_landing_page.png) — Master Public Landing View
- [`02_coach_dashboard.png`](file:///home/qassim/globalOrators/screenshots/02_coach_dashboard.png) — Coach OS Command Center View
- [`03_speaker_portal.png`](file:///home/qassim/globalOrators/screenshots/03_speaker_portal.png) — Speaker Studio Chamber View
- [`04_client_roster.png`](file:///home/qassim/globalOrators/screenshots/04_client_roster.png) — Forensic Debater Roster View
- [`scene_01_landing_page.md`](file:///home/qassim/globalOrators/screenshots/scene_01_landing_page.md) — Scene 1 Prompt Card & Camera Specs
- [`scene_02_coach_dashboard.md`](file:///home/qassim/globalOrators/screenshots/scene_02_coach_dashboard.md) — Scene 2 Prompt Card & Camera Specs
- [`scene_03_speaker_portal.md`](file:///home/qassim/globalOrators/screenshots/scene_03_speaker_portal.md) — Scene 3 Prompt Card & Camera Specs
- [`scene_04_client_roster.md`](file:///home/qassim/globalOrators/screenshots/scene_04_client_roster.md) — Scene 4 Prompt Card & Camera Specs
- [`scene_05_assembly_and_transitions.md`](file:///home/qassim/globalOrators/screenshots/scene_05_assembly_and_transitions.md) — NLE Stitching, Transitions & Sound Design Master
