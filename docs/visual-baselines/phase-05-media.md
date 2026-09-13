# Phase 5 Media Baseline

## Production asset

- Registry key: `media.hero.compressionFlow`
- File: `/public/media/hero/compression-flow.png`
- Intrinsic size: 1254 by 1254 pixels
- Purpose: communicate several image assets becoming one lighter replacement
- Treatment: transparent, responsive, and loaded through Next.js Image

The asset was generated for CompressByURL with the built-in image generation tool.
The final prompt requested a premium minimal 3D compression metaphor in the product
palette, with a transparent background and no text, logos, brands, watermarks, neon,
or unrelated objects.

## Media behavior

`MediaFrame` accepts typed image and video assets. Video assets use a muted,
looping, inline presentation with metadata preload and a poster image. The poster is
shown during server rendering, when reduced motion is preferred, or if video loading
fails.

## Verification

- Homepage asset rendered through the development server.
- Responsive compact presentation was visually inspected.
- Mode switching preserved the media and icon states.
- Browser console contained no warnings or errors.
