---
version: alpha
name: "Phantom"
website: "https://phantom.app"
description: >-
  A crypto wallet whose marketing page opens on a near-black canvas streaked with diagonal abstract ribbons in gold, teal, rust, and violet — then drops to a lavender-white surface for every section below the fold. The identity runs a single proprietary sans called Phantom at weight 400 across display, body, and button tiers; the only brand color that reads as a deliberate accent is a soft periwinkle lavender used for the hero canvas wash and the ghost mascot's body. The primary CTA is a periwinkle lavender pill with deep-violet ink text — an inversion of the typical dark-button convention.

seo:
  title: "Phantom Design System for React — periwinkle lavender, Phantom Sans, 15 components"
  metaDescription: "Phantom's marketing system pairs a near-black abstract-ribbon hero with a lavender-white below-fold surface. Single proprietary Phantom Sans typeface, periwinkle CTA pill, 11 colors, 15 components for React and Next.js."
  highlights:
    - "Abstract ribbon hero — diagonal strokes in gold, teal, rust, and violet over a near-black canvas replace any traditional photography or illustration"
    - "Lavender canvas wash — the below-fold surface is a warm periwinkle near-white, not standard off-white; every card and section sits on this tinted floor"
    - "Single-weight typography — Phantom Sans runs at weight 400 through display (96px) down to label (15px); there is no bold or heavy tier"
    - "Inverted CTA pill — the primary button fills with soft periwinkle lavender and renders ink text in deep violet, reversing the light-text-on-dark convention"
    - "Generous-rounded cards — 24px and 32px radius dominate; the scale skips any sub-16px tier"
  tags:
    - "Fintech & Crypto"
  lastUpdated: "2026-05-19"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Phantom's homepage opens with something most crypto wallets avoid: genuine visual risk. A full-bleed near-black canvas carries diagonal abstract ribbons — warm gold, deep teal, burnt rust, muted violet — sweeping across the frame at competing angles. The effect reads less like a marketing section and more like a canvas dropped from a generative art tool. The wordmark sits in the top-left in white; the nav links in deep violet; and the only CTA on the canvas is a softly-rounded pill in periwinkle lavender with matching ink. Then, on scroll, the page lands on a near-white lavender surface — tinted just enough to feel distinct from the plain white that most wallets default to. Where Coinbase commits to plain blue-on-white and MetaMask leans on orange-on-dark, Phantom chooses a tertiary hue and applies it to the canvas itself.

    The DESIGN.md file packages the system for React and AI tools. Inside: 11 color tokens, the dominant one being a dark violet-purple used 530 times across text and borders; a soft periwinkle lavender for the CTA pill and card shadow; a warm near-white for body surfaces; and a near-black for the hero. Typography is a single proprietary family — Phantom — running at weight 400 across every tier from 96px display down to 15px label, with no weight variation. The radius scale is generous-soft starting at 24px for cards, reaching 100px for pill buttons, with full-circle avatars at 50%. Spacing centers on a 16px base with section pads at 48px.

    Feed this spec to an AI tool and it reproduces Phantom's two signature moves: the abstract ribbon hero (achieved through diagonal gradient or SVG strips in the brand palette, not photography) and the lavender-washed below-fold canvas. The one thing worth borrowing selectively is the single-weight type discipline — Phantom Sans at 400 creates a calm, approachable register that contrasts sharply with the aggressive DeFi aesthetic competitors favor. Most apps need at least one weight bump; Phantom proves it can work without one.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://phantom.app"
      title: "Phantom — official site"
      description: "Phantom's public marketing site — the source of truth for the live tokens captured in this file."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Phantom's primary brand color?"
      answer: "Phantom's dominant color is a deep violet-purple wired across text, borders, and the nav bar — frequency 530 in the captured page, used as both text (264 instances) and border (264 instances). The CSS extraction shows this as #3c315b, assigned to ten different CSS variables. The CTA button uses a contrasting soft periwinkle lavender (#ab9ff2) as its fill, with the same deep violet as the text color, making the primary button an inversion of the usual dark-fill pattern. The below-fold canvas uses a warm near-white (#fffdf8) as the surface, giving the system three chromatic tiers: dark violet, periwinkle accent, and warm near-white floor."
    - id: "typography"
      title: "What typeface does Phantom use, and what should I use as a substitute?"
      answer: "Phantom runs a proprietary custom typeface called Phantom across every tier — display, heading, body, button, and label. The same family name appears across all 10 extracted type samples. Weight is uniformly 400 with a single 350-weight variant for a 20px sub-label tier; there is no 600 or 700 weight anywhere on the marketing surface. Display sits at 96px with -2.4px tracking and 105.6px line-height; body at 15–16px with normal tracking. The closest open-source substitute is Plus Jakarta Sans at weight 400 — it shares the rounded warmth of Phantom at display sizes. Inter at the same weights is closer for body text. Preserve the zero-bold discipline: Phantom's calm comes from weight 400 all the way up the scale."
    - id: "hero-canvas"
      title: "What creates the abstract ribbon effect on Phantom's hero?"
      answer: "The hero is a near-black canvas (#1c1c1c base) overlaid with diagonal abstract strips rendered as a full-bleed illustration or image. The strips read in warm gold, deep teal, burnt rust, muted violet, and gray-lavender — none of which map to the primary brand palette precisely; they are illustrative elements rather than token values. The effect creates a generative-art feel that positions Phantom as culturally distinct from exchange-style crypto UIs. To reproduce it: use the near-black surface token as the floor, then overlay diagonal SVG or CSS gradient strips in the warm/cool color families from the palette. The headline and CTA float on top centered, with the pill in periwinkle lavender providing the only brand anchor."
    - id: "canvas-color"
      title: "Why is Phantom's below-fold canvas lavender instead of white?"
      answer: "The below-fold surface is #fffdf8 (frequency 90 in the extraction) — a warm near-white with a faint violet undertone. This is two CSS variables merged: --eofi4se (FDFCFE) and --eofi4sm (FFFDF8), both near-white with barely perceptible chroma. The tint is subtle enough that most viewers read it as 'off-white,' but it is consistent across the entire below-fold system. The effect keeps the dark hero and the body sections feeling tonally connected despite the massive lightness shift — the shared violet undertone links them. Pure white would read as a hard cut; the lavender near-white reads as a landing."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build a crypto or fintech marketing page?"
      answer: "Yes — the file is structured for Claude, Cursor, and similar AI tools. Feed it the spec and it will reproduce Phantom's key decisions: near-black abstract hero (with diagonal ribbon strips in the warm-cool palette), lavender-washed body surface rather than plain white, periwinkle pill CTA with dark-violet ink text, Phantom-equivalent sans at weight 400 across all tiers, and generous 24–32px corner rounding. The token references resolve cleanly — {colors.canvas} for the hero floor, {colors.surface-1} for the body, {colors.primary} for the CTA fill. One caveat: the abstract ribbon hero works because Phantom's ghost mascot is already illustrative in character. For brands with a more literal product (hardware, SaaS dashboards), the abstract art reads as avoidance rather than identity."

mockups:
  - "marketing-hero"
  - "dashboard-card-grid"

colors:
  primary: "#ab9ff2"
  ink: "#3c315b"
  ink-muted: "#86848d"
  canvas: "#1c1c1c"
  surface-1: "#fffdf8"
  surface-2: "#f4f2f4"
  hairline: "#e9e8ea"
  shadow-lavender: "#e2dffe"
  accent-blue: "#6ca0fb"
  accent-yellow: "#ffffc4"
  accent-pink: "#ffdadc"

typography:
  display-xl:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 96px
    fontWeight: 400
    lineHeight: 105.6px
    letterSpacing: "-2.4px"
  display-lg:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 80px
    fontWeight: 400
    lineHeight: 88px
    letterSpacing: "-2px"
  heading-md:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 36px
    letterSpacing: 0
  heading-sm:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 32.4px
    letterSpacing: "-0.6px"
  body-lg:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 350
    lineHeight: 28px
    letterSpacing: 0
  body-md:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  body-sm:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 18.15px
    letterSpacing: 0
  button-md:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  nav-link:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  label-sm:
    fontFamily: "\"Phantom\", system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 18.15px
    letterSpacing: 0

rounded:
  none: "0px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "96px"
  pill: "100px"
  full: "50%"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  section: "96px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "44px"
    borderColor: "{colors.ink}"
  top-nav:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "56px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    padding: "12px 24px"
  hero-section:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.surface-1}"
    rounded: "{rounded.md}"
    padding: "48px"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.surface-1}"
    typography: "{typography.display-xl}"
    padding: "0px"
  section-heading:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
  body-paragraph:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  body-paragraph-muted:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
  card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "24px"
    shadowColor: "{colors.shadow-lavender}"
  card-dark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.surface-1}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-lavender:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "24px"
  text-input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "44px"
  footer:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
    padding: "48px 24px"
---

## Overview

Phantom's marketing site makes a move almost no other crypto wallet attempts. **Abstract Art as Brand Identity.** The above-fold hero is a near-black canvas overlaid with diagonal abstract ribbons — warm gold, teal, rust, violet, and gray-lavender strips colliding at competing angles — a visual that reads more like generative art than a financial product. Where Coinbase commits to an orderly cobalt-on-white grid and MetaMask leans on orange-on-dark with product screenshots, Phantom puts illustrative abstraction at the center and keeps the product (a phone mockup) below the fold.

The below-fold surface drops to a lavender-washed near-white — tinted with the same violet family as the deep ink color, creating a tonal bridge between the dark hero and the body sections. The primary CTA is a periwinkle lavender pill with deep-violet text, inverting the typical convention of a dark button with light text. This inversion is consistent: across the marketing surface, lightness is the accent, darkness is the ink.

Typography is a single proprietary family — Phantom — running at weight 400 across every tier from 96px display to 15px label. The radius scale starts at 24px for cards; there is no tight sub-16px tier. The ghost mascot appears in the app product UI shown in feature cards, not as a hero decoration — the brand character is kept inside the product surface.

**Key Characteristics:**
- Near-black hero canvas with diagonal abstract ribbon illustration; no photography, no device mockup above the fold.
- Lavender-washed body surface (#fffdf8 — a near-white with violet undertone) rather than plain white for every below-fold section.
- Single brand voltage: periwinkle lavender (#ab9ff2) used as the CTA fill and card highlight shadow — 19 total occurrences in the extraction.
- Deep violet-purple ink (#3c315b) — frequency 530 — carries text and borders across the entire system.
- Phantom Sans at weight 400 across all tiers; the only variation is a single 350-weight for a sub-label tier. No bold or heavy.
- Generous radius scale: 24px on cards, 32px on feature tiles, 100px on pill CTAs, full circles on avatars.
- Feature cards below the fold use lavender, dark, and neutral fills — three visual registers within a consistent palette.
- Ghost mascot appears only inside product UI screenshots, never as a decorative hero element.

## Colors

### Brand

- **Primary Lavender** (`{colors.primary}` — #ab9ff2): frequency 2. Used as background — the primary CTA button fill and a card accent highlight. The single chromatic brand moment in the system; a soft periwinkle lavender that reads warm and approachable rather than electric.
- **Shadow Lavender** (`{colors.shadow-lavender}` — #e2dffe): frequency 19. Used as background (7) and shadow (12). The card shadow tint and secondary highlight fill — a paler version of the primary lavender that reads almost white in most contexts. Wired as --eofi4sg and --eofi4sa.

### Canvas & Surfaces

- **Canvas** (`{colors.canvas}` — #1c1c1c): frequency 63. Used as text (30), background (3), border (30). The hero floor and dark-card surface — a near-black with no blue undertone, closer to charcoal than the true black Spline uses.
- **Surface-1** (`{colors.surface-1}` — #fffdf8): frequency 90. Used as text (40), background (10), border (40). The below-fold canvas — a warm near-white with a faint violet undertone. The entire body of the page rests on this tinted floor.
- **Surface-2** (`{colors.surface-2}` — #f4f2f4): frequency 3. Used as background only. A slightly cooler near-white for secondary surface contexts (e.g., input fields, chip backgrounds).

### Text

- **Ink** (`{colors.ink}` — #3c315b): frequency 530. Used as text (264) and border (264). The dominant text and border color across the entire system — a deep violet-purple rather than pure black, wired across ten CSS variables. Gives white-surface content a violet warmth.
- **Ink Muted** (`{colors.ink-muted}` — #86848d): frequency 8. Used as text (4) and border (4). Secondary and tertiary labels — a medium violet-gray.

### Hairline

- **Hairline** (`{colors.hairline}` — #e9e8ea): frequency 2. A light gray-violet for dividers and card borders on light surfaces.

### Accent (illustrative palette)

- **Accent Blue** (`{colors.accent-blue}` — #6ca0fb): frequency 1. Appears in the abstract ribbon illustration on the hero canvas — not a brand chrome color.
- **Accent Yellow** (`{colors.accent-yellow}` — #ffffc4): frequency 1. Ribbon illustration element — warm yellow strip on the hero.
- **Accent Pink** (`{colors.accent-pink}` — #ffdadc): frequency 1. Ribbon illustration element — blush-pink strip on the hero.

## Typography

### Font Family

The system runs **Phantom** — a proprietary custom sans-serif — across every tier. There is no second family, no mono voice, no serif counterpoint. Fallbacks walk to `system-ui, -apple-system, sans-serif`. The defining characteristic is weight uniformity: every tier from 96px display to 15px label runs at weight 400, with a single 350-weight exception for a 20px sub-label tier.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 96px | 400 | 105.6px | -2.4px | Hero h2 ("Trading tools for everyone") |
| `{typography.display-lg}` | 80px | 400 | 88px | -2px | Large number displays in feature cards |
| `{typography.heading-md}` | 30px | 400 | 36px | 0 | Section paragraph leads |
| `{typography.heading-sm}` | 24px | 400 | 32.4px | -0.6px | Section h2/h3 headings |
| `{typography.body-lg}` | 20px | 350 | 28px | 0 | Sub-heading / lead body |
| `{typography.body-md}` | 16px | 400 | 20px | 0 | Default body text |
| `{typography.body-sm}` | 15px | 400 | 18.15px | 0 | Labels, captions, small UI text |
| `{typography.button-md}` | 16px | 400 | 20px | 0 | CTA button label |
| `{typography.nav-link}` | 16px | 400 | 20px | 0 | Top-nav link labels |
| `{typography.label-sm}` | 15px | 400 | 18.15px | 0 | Chip labels, tag text |

### Principles

Weight 400 through the entire scale is the discipline. The 96px display h2 at weight 400 with -2.4px tracking delivers authority through size and tracking, not through bold weight. This is the opposite of the typical fintech approach (Stripe, Revolut) that leans on weight 600–700 for hierarchy. The single 350-weight concession at 20px reads as the system's "medium" emphasis — barely perceptible but present.

### Note on Font Substitutes

Phantom is proprietary. **Plus Jakarta Sans** at weight 400 is the closest open-source substitute for display sizes — it shares the rounded terminals and warm proportions of Phantom. **Inter** at weight 400 transfers cleanly for body sizes. Preserve the single-weight discipline: introducing weight 600 or 700 breaks the calm register the system depends on.

## Layout

### Spacing System

- **Base unit:** 4px (8px as the dominant padding module).
- **Tokens:** `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.2xl}` 48px · `{spacing.section}` 96px.
- **Hero padding:** 48px top and sides; the abstract ribbon fills edge-to-edge.
- **Card internal padding:** `{spacing.lg}` (24px) on all feature cards.
- **Section padding (vertical):** 96px at the top of major sections, 48px at the bottom.

### Grid & Container

- **Max content width:** ~1080px on text-heavy sections; the hero ribbon fills full browser width.
- **Hero:** full-bleed near-black canvas with the ribbon illustration behind the centered headline + CTA stack.
- **Feature section:** 3-column horizontal card carousel below the fold — lavender, dark, and neutral fills per card.
- **App mockup section:** centered single phone/card mockup at ~400px wide on the lavender surface.

### Rhythm

The page alternates between the **full-bleed dark hero** and **light lavender editorial** sections. Below the fold each section rests on the same warm near-white surface — no alternating backgrounds, no color band changes. Depth comes from the card fills (lavender, dark, neutral) rather than from section-background shifts.

## Elevation

The system uses **shadow-lavender tinting** rather than neutral-gray drop shadows.

- **Flat (no shadow):** hero, nav, footer, editorial text sections.
- **Tinted card shadow:** `{colors.shadow-lavender}` (#e2dffe) appears 12 times as shadow ink — the card lift effect uses a lavender-tinted shadow rather than black-alpha, which keeps the shadow within the brand palette.
- **Surface contrast:** dark cards (#1c1c1c) on the lavender surface read as elevated by color contrast alone; no shadow needed.

## Shapes

The radius scale is **generous-soft**, starting at 16px and skipping any tight tier:

- `{rounded.none}` 0px — used for the hero section wrapper and text blocks.
- `{rounded.sm}` 16px — a single captured instance; used for minor UI elements.
- `{rounded.md}` 24px (14 instances) — the default card radius; the dominant rounded shape on the page.
- `{rounded.lg}` 32px (12 instances) — larger feature tiles and the hero section card wrapper.
- `{rounded.xl}` 96px (2 instances) — the largest card radius on the hero-section inner container.
- `{rounded.pill}` 100px (7 instances) — pill buttons (CTA "Download" and secondary actions).
- `{rounded.full}` 50% (6 instances) — avatar circles, icon chips, the ghost mascot badge.

There is no 4px or 8px tier. The system is deliberately soft — even the smallest UI surfaces start at 24px.

## Components

**`button-primary`** — The signature CTA. Soft periwinkle lavender `{colors.primary}` fill, deep-violet `{colors.ink}` text, 100px pill radius, 16×32 padding, 52px height. "Download" is the canonical hero instance — the only chromatic accent on the dark canvas.

**`button-secondary`** — Transparent fill, `{colors.ink}` text, 1px border in ink, pill radius. Used for secondary actions like "Explore" in the nav.

**`top-nav`** — Warm near-white `{colors.surface-1}` surface, deep-violet `{colors.ink}` text, 56px height, no bottom border. Phantom wordmark flush left in the deep violet; nav links (Features, Learn, Explore, Company, Developers, Support) centered; Download CTA pill right-aligned.

**`nav-link`** — Transparent background, `{colors.ink}` text at `{typography.nav-link}` (16px / 400), 12×24 padding with dropdown indicator.

**`hero-section`** — Near-black `{colors.canvas}` fill, 48px padding, `{rounded.md}` 24px radius on the inner container. The abstract ribbon illustration fills edge-to-edge behind the centered headline + sub-label + CTA stack.

**`hero-heading`** — White `{colors.surface-1}` text, Phantom 96px / 400, -2.4px tracking. The hero h2 centers over the ribbon art.

**`section-heading`** — Deep-violet `{colors.ink}` text at `{typography.heading-md}` (30px / 400) on the lavender surface.

**`body-paragraph`** — Default `{colors.ink}` text at `{typography.body-md}` (16px / 400).

**`body-paragraph-muted`** — Muted `{colors.ink-muted}` text at `{typography.body-sm}` for secondary captions.

**`card`** — Warm near-white `{colors.surface-1}` fill, `{colors.ink}` text, `{rounded.md}` 24px radius, 24px padding, lavender shadow tint via `{colors.shadow-lavender}`.

**`card-dark`** — Near-black `{colors.canvas}` fill, white text, `{rounded.md}` 24px radius, 24px padding. Used in the feature carousel for the dark-tone card variant.

**`card-lavender`** — Periwinkle `{colors.primary}` fill, `{colors.ink}` text, `{rounded.md}` 24px radius. Used in the feature carousel for the lavender-tone card variant.

**`text-input`** — `{colors.surface-2}` fill, `{colors.ink}` text, `{rounded.sm}` 16px radius, 12×20 padding, 44px height. No visible border in the resting state.

**`footer`** — Warm near-white `{colors.surface-1}` surface, muted `{colors.ink-muted}` text at `{typography.body-sm}`, 48×24 padding. Continues the lavender-washed body floor.

## Do's and Don'ts

**Do** treat the abstract ribbon hero as an illustration layer, not a CSS gradient. The ribbons cross at competing angles and have textured edges — they are rendered art, not geometric shapes. Approximate with SVG paths or an image asset; a CSS linear-gradient will look flat by comparison.

**Do** use `{colors.surface-1}` (#fffdf8) — not pure white — for the below-fold canvas. The violet undertone links the body to the deep-violet ink color and to the hero's lavender accent. Pure white severs that connection.

**Do** keep Phantom Sans (or its substitute) at weight 400 across all tiers. The calm authority of a 96px headline at weight 400 depends on the entire scale holding the same weight — introducing a 700-weight h1 collapses the system's defining register.

**Do** apply the `{colors.shadow-lavender}` (#e2dffe) shadow tint to card hover states. The lavender shadow keeps elevation within the brand palette instead of defaulting to neutral black-alpha.

**Don't** use `{colors.primary}` (#ab9ff2) for text or background fills outside the CTA button and card highlight contexts. It appears only 2 times on the marketing surface; multiplying it into section fills destroys the single-voltage discipline.

**Don't** introduce any radius below 16px. The system's softness starts at `{rounded.sm}` (16px) — the minimum. Bringing in 4px or 8px rounding reads like a different product's design language.

**Don't** use the illustrative ribbon palette (accent blue, accent yellow, accent pink) outside the hero illustration context. Those hues belong to the abstract art layer, not to the brand chrome.

**Don't** place the ghost mascot as a decorative header element. Phantom keeps the mascot inside product UI screenshots — it is a product character, not a brand wallpaper. Using it as a hero illustration over-explains the brand.

## Known Gaps

- **Hover and active states:** no hover or press variants captured from the marketing surface; only the resting `{component.button-primary}` state is documented.
- **Dark-mode body:** the system has a near-black hero canvas, but the body sections are light-only. Whether a dark-mode body variant exists on other pages is not represented here.
- **Motion:** the hero ribbon appears to be an animated or parallax illustration in the live page; the spec captures static end-state values only. Easing curves and animation timing are not represented.
- **Ghost mascot specifications:** the mascot appears in product screenshots but its construction (SVG, illustration style, proportions) is outside the scope of the marketing surface extraction.
- **Mobile breakpoints:** the captured surface is desktop-width. The feature card carousel likely collapses to a single-column scroll on mobile; no responsive tokens are captured.
- **Form states:** `{component.text-input}` carries the resting state only; focus ring, error, and disabled states are not documented from the marketing surface.
- **Subscription or tier accents:** the extraction shows accent blue (#6ca0fb) and accent colors appearing once each — their role (illustrative? tier-specific?) is unclear from the marketing-only capture.
