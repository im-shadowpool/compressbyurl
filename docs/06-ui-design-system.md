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

### 1. Settings Rail (Pills Above Everything)
- A single horizontal rail at the top of the tool card holds six labeled pill buttons:
  `[ Preset ] [ Format ] [ Quality ] [ Resize ] [ Naming ] [ Metadata ]`
- Every pill shows its current value (e.g. `Format · WebP`, `Resize · Original size`) and a customization tint when it differs from defaults.
- Clicking a pill opens an **anchored dropdown panel** beneath the pill (flipped above when short on space). Changes apply live; there is no Apply or Done button — dismiss with outside click or Escape.
- The dropdown uses the Popover API top layer, so it never gets clipped by the rail's scroll container, and animates open and closed with a fade-and-slide.
- The rail scrolls horizontally on narrow viewports and never pushes the intake below the fold.

### 2. Mode Switcher
- Sleek Segmented Control (Pills) centered directly beneath the settings rail:
  `[ Upload Files ]   [ Image URL ]   [ Website URL ]`
- Full labels on desktop, compact labels on mobile, containing the stage below it.

### 3. Main Intake Stage (Clean & Heroic)
- One high-visibility drag & dropzone, or a URL input row for the URL modes.
- Clear file format chips (`JPEG · PNG · WebP · AVIF`).
- Privacy guarantee line: *"Local files never leave your device."*

### 4. Results Workbench (Savings First)
- Adding files collapses the dropzone into a slim "Add more images" strip so results take the stage.
- The workbench bar summarizes before/after bytes and savings, exposes one primary action
  (Compress all → Download ZIP) plus quiet secondary actions, and keeps per-file
  progress, compare, and download inline.
- Batch stats replace the old multi-panel summary grid; a settings change surfaces a
  "compress again to apply" notice instead of silent invalidation.

### Drawer Groups
- **Preset**: use-case select, description, device-local reset.
- **Format**: Keep original / JPEG / PNG / WebP / AVIF, JPEG transparency background + live preview.
- **Quality**: Smart / Quality slider / Target size with custom KB-MB, Smart Fit toggle.
- **Resize**: fit-within or exact sizing, aspect-ratio handling, inline validation.
- **Naming**: prefix, suffix, pattern tokens, sequence, letter case, live example.
- **Metadata**: EXIF/GPS strip toggle with explicit preservation warning.

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
│  CompressByURL                                         │
│                                                        │
│       Compress images from files or URLs.              │
│       Fast, browser-based, zero server uploads.        │
│                                                        │
│      ┌───────────────────────────────────────────┐     │
│      │ Settings [Preset][Format][Quality][Resize]│     │
│      ├───────────────────────────────────────────┤     │
│      │   [ Upload Files ] [Image URL] [Website]  │     │
│      │  ┌─────────────────────────────────────┐  │     │
│      │  │                                     │  │     │
│      │  │         Drop or paste images        │  │     │
│      │  │         [ Browse Files ]            │  │     │
│      │  │    JPG · PNG · WebP · AVIF          │  │     │
│      │  └─────────────────────────────────────┘  │     │
│      │  🔒 Local files never leave your device   │     │
│      └───────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

Pills open live-editing drawers; the stage swaps to the results workbench once
files are added and the dropzone collapses to a compact add-more strip.

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
