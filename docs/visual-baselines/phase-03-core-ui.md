# Phase 3 Core UI Visual Baseline

Captured: 2026-09-12

## Canonical surface

- Development route: `/dev/ui`
- Production behavior: returns 404 and is marked `noindex`
- Theme: warm near-white canvas, deep-violet ink, restrained lavender actions
- Typography: Inter at weight 400 across the component gallery

The route renders deterministic examples for Button, IconButton, Input, Select,
Slider, SegmentedControl, Card, Dialog, Sheet, and Toast. It includes default,
selected, loading, disabled, validation, dark, lavender, and success states.

## Verified behavior

- Desktop layout inspected in the in-app browser
- Mobile collapse is defined at 768px and 576px breakpoints
- Segmented control supports arrow-key selection and focus movement
- Dialog and Sheet support initial focus, Escape dismissal, backdrop dismissal,
  explicit close controls, and focus restoration
- Toasts use live-region announcements and explicit dismissal
- Every critical control has a minimum 44px touch target
- Reduced-motion fallbacks remove non-essential animations and transforms
- Browser console contains no warnings or errors

Automated screenshot comparison remains deferred by the repository testing rules.
This deterministic route and documented state matrix form the manual visual
regression baseline for later phases.
