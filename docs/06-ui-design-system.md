# 06 — UI Design System

> [!IMPORTANT]
> **PRIMARY DESIGN SPECIFICATION**: All agents must strictly refer to [design.md](file:///c:/Users/shado/OneDrive/Desktop/CompressByURL/design.md) in the project root for the authoritative design tokens (exact HEX colors, single-weight typography, component radii, shadows, and React component geometries).

## Brand Feel & Design Philosophy

CompressByURL is designed as a state-of-the-art, premium, high-performance web utility following the visual design system established in `design.md`.

Key visual attributes:
- **Premium Identity (from `design.md`)**: Contrast between a near-black hero canvas (`#1c1c1c`) with subtle abstract accents and a warm lavender-tinted near-white surface (`#fffdf8`) below the fold.
- **Inverted CTA Pill**: Periwinkle lavender pill (`#ab9ff2`) with deep violet ink text (`#3c315b`).
- **Uncluttered & Focused**: The tool puts file intake and compression results center-stage. Avoid cognitive overload and sprawling control panels.
- **Progressive Disclosure**: Keep primary views lightweight; nest advanced settings inside neat toggles, segmented pills, or an elegant settings dropdown/popover.
- **Sophisticated Micro-Interactions**: Smooth transitions, subtle hover states, tactile buttons, and crisp status badges.
- **Generous Whitespace & Hierarchy**: Clear spacing scale that guides the user naturally through intake → settings → results.

---

## Typography

Follow the typography tokens defined in `design.md`:

- **Font Family**: Inter (or Plus Jakarta Sans / Phantom equivalent sans) via `next/font/google` with `display: swap`.
- **Implementation**: Weight 400 across display and body tiers creates a calm, premium register. Use weight 500/600 sparingly for critical labels and hierarchy.
- **Features**: Enable tabular figures (`font-variant-numeric: tabular-nums`) for byte counts, compression percentages, and timer displays to prevent jitter.

---

## Visual Design & Token System (from `design.md`)

Use the exact design tokens specified in [design.md](file:///c:/Users/shado/OneDrive/Desktop/CompressByURL/design.md):

### Core Palette
- **Primary CTA Fill**: `#ab9ff2` (soft periwinkle lavender pill)
- **Ink / Typography**: `#3c315b` (deep violet-purple used for text, borders, and active indicators)
- **Muted Ink**: `#86848d` (subtle labels and secondary hints)
- **Hero Canvas**: `#1c1c1c` (near-black floor for the hero section)
- **Below-Fold Surface (Surface-1)**: `#fffdf8` (warm near-white lavender wash surface)
- **Card Surface (Surface-2)**: `#f4f2f4` (soft tinted card background)
- **Hairline / Border**: `#e9e8ea` (delicate structural borders)
- **Shadow**: `#e2dffe` (soft lavender card shadow)

### Semantic Feedback
- **Success / Savings**: Emerald green (`#10B981`) for byte savings and completion.
- **Warning / Notice**: Crisp amber (`#F59E0B`) for warnings (e.g. transparency loss in JPEG conversion).
- **Destructive / Error**: Clean coral/rose (`#EF4444`) for validation rejections and failed fetches.

### Elevation & Borders
- **Subtle Borders**: 1px delicate borders (`#e9e8ea` / hairline) give structure without visual heaviness.
- **Radius (from `design.md`)**:
  - Buttons / Pills: `100px` (full pill radius)
  - Cards & Feature containers: `24px – 32px` (generous modern rounding)
  - Controls & Inputs: `12px – 16px`
  - Dropzone container: `24px`

---

## Decluttered Settings Architecture (Progressive Disclosure)

The interface must **never feel crowded with endless checkboxes, sliders, and inputs**. All settings follow a sleek, modular hierarchy:

### 1. Mode Switcher
- Sleek Segmented Control (Pills) at top of tool:
  `[ Upload Files ]   [ Image URL ]   [ Website URL ]`
- Active pill highlighted with subtle spring motion.

### 2. Main Intake Stage (Clean & Heroic)
- High-visibility drag & dropzone or URL input field.
- Clear file format badges (`JPEG · PNG · WebP · AVIF`).
- Privacy guarantee badge: *"Local files never leave your device"*.

### 3. Quick Controls Bar (Essential Only)
Only the most critical settings are visible by default:
- **Target / Quality**: Preset selector pills (e.g. `Balanced (80%)`, `Max Quality (90%)`, `Aggressive (65%)`, `Target Size (KB)`).
- **Output Format**: Clean dropdown/segmented picker (`Keep Original`, `WebP`, `AVIF`, `JPEG`, `PNG`).

### 4. Advanced Settings Component (Neat Dropdown / Tray)
All secondary and power-user configurations are cleanly tucked into a **collapsible Settings Dropdown** or **sliding Drawer/Tray** triggered by a discreet `[ Tune / Advanced Settings ]` icon button:
- **Resize Dimensions**: Max width/height or percentage scale.
- **Metadata Management**: Clean toggle switch for EXIF / GPS stripping.
- **Naming Rules**: Pattern formatting tokens (`[name]-compressed`, custom prefix/suffix).
- **Background Fill**: Color picker for handling transparent PNGs converted to JPEG.
- **Target Size Input**: Precise KB threshold input (active only when Target Size mode is selected).

---

## Icons

Use **Google Material Symbols** (Outlined, 20px / 24px) for consistency:
- `upload_file`, `link`, `travel_explore` (Mode switcher)
- `tune`, `settings` (Advanced settings trigger)
- `folder_zip`, `download` (Export actions)
- `compare` (Before/after slider)
- `check_circle`, `warning`, `error` (Status indicators)
- `lock` (Client-side privacy guarantee)
- `aspect_ratio` (Dimensions & resize)

---

## Hero & Main Layout Concept

```text
┌────────────────────────────────────────────────────────┐
│  CompressByURL                 [Docs] [Github] [Theme] │
│                                                        │
│       Compress images from files or URLs.              │
│       Fast, browser-based, zero server uploads.        │
│                                                        │
│      [ Upload Files ]   [ Image URL ]   [ Website URL ]│
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │             Drop images here to begin            │  │
│  │                                                  │  │
│  │               [ Browse Local Files ]             │  │
│  │                                                  │  │
│  │      JPG · PNG · WebP · AVIF  ·  100% Private    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Quick Controls ──────────────────────────────────┐  │
│  │ Format: [ Keep Original ▾ ]   Quality: [ 80% ▾ ]  │  │
│  │                             [ ⚙ More Options ▾ ]  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Advanced Settings Panel (Collapsed by default) ─┐  │
│  │  Resize: [ Max 1920px ▾ ]    Strip EXIF: [ Toggle ]│  │
│  │  Filename: [ {name}-min ]    PNG BG:    [ White  ]│  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Motion & Micro-Interactions

- **State Transitions**: Smooth 150ms–200ms ease-out transitions on hovers, focus rings, and dropdown expansions.
- **Dropzone Interaction**: Gentle border glow and subtle scale feedback on drag-over.
- **Compression Progress**: Smooth progress bar and numerical counter without UI stutter.
- **Accessibility**: Respect `prefers-reduced-motion: reduce` by disabling non-essential transitions.

---

## Accessibility Best Practices

- **Contrast**: Text and interactive components strictly exceed WCAG AA ratio (4.5:1 for normal text, 3:1 for large text and UI boundaries).
- **Focus Rings**: Prominent 2px focus ring (`ring-2 ring-primary/40`) with clean offset for keyboard users.
- **Touch Targets**: Minimum 44px touch targets on mobile/tablet viewports.
- **Screen Readers**: Clear ARIA labels on icon-only buttons, sliders, and expandable settings trays (`aria-expanded`, `aria-controls`).
