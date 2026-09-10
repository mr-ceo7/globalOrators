# Workspace Design Guidelines

## Responsive Mobile Grid & Scaling Rules
- **Multi-Column Layouts on Mobile:** When building or modifying responsive grids for mobile, do not automatically default to stacking all components (such as stats cards, metrics, or list elements) vertically in a single full-width column.
- **Proportional Scaling:** Scale down component dimensions (such as paddings, font sizes, margins, and icon sizes) to comfortably accommodate a 2-column or multi-column layout on small screens (e.g., using `grid-cols-2`).
- **Layout Integrity:** Ensure that scaled-down elements are optimized to prevent text wrapping, vertical overflow, or visual crowding, keeping the design clean, dense, and native-feeling.

## Automated Testing & Code Verification
- **Test-Driven Changes:** Whenever significant new features, layout patterns, or backend capabilities are added or modified, write or update the corresponding unit or integration tests to prevent regressions.
- **Verification Rule:** Always run both the frontend test runner (`npm run test`) and backend test suite (`pytest`) after modifications to ensure all assertions pass successfully before finishing edits.

## Anti-AI Slop Standards (Strict UI & Copywriting Rules)

### Visual & UI Anti-Patterns (Zero AI Slop in Design)
- **No Low-Contrast Multi-Stop Text Gradients:** Never apply multi-stop pastel/light text gradients (e.g., `bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent`) that wash out on light backgrounds or low-brightness displays. Use solid, high-contrast, commanding typography (e.g., bold serif display headers with warm earthy/editorial accent colors).
- **No Emoji-Laden Floating Pills & Badges:** Ban cheap tech-demo badges (e.g., `🚀 Next-Gen AI Platform ✨` or floating glassmorphic pills with random emojis). Use clean, micro-mono editorial labels (`text-[10px] font-mono tracking-widest uppercase`).
- **No Generic 3D Cubes, Floating Blobs, or Corporate Vector Art:** Avoid cold, generic stock illustrations, abstract floating purple/cyan blobs, or robotic isometric cubes. Use authentic documentary photography, editorial photo essays, or architectural linework.
- **No Cluttered / Double-Stacked Navigation:** Never stack duplicate navigation bars, subnavs, or switcher bars on top of each other on mobile. Integrate secondary navigation, subdomains, or portals into sleek, unified dropdowns.

### Copywriting Anti-Patterns (Zero AI Slop in Text & Tone)
- **No Significance Amplifiers & Empty Superlatives:** Ban empty filler buzzwords: *"pioneering"*, *"unprecedented"*, *"state-of-the-art"*, *"revolutionary"*, *"seamless"*, *"delve"*, *"tapestry"*, *"game-changer"*, *"testament"*, *"beacon"*. Write with visceral, concrete, human-grounded reality and specific context.
- **No Prompt Regurgitation Walls:** Avoid generic AI summary blocks that regurgitate the prompt without voice or soul. Write punchy, rhythmic, editorial copy with emotional depth and authentic narrative structure (manifestos, chapters, living testimonials).
- **Authentic Editorial Hierarchy:** Treat web pages like high-end editorial publications with commanding display typography, razor-thin architectural dividers, and documentary dispatch captions.


