# 16 — Media Integration

## Source of truth

Before creating visual placeholders, inspect `/public/media`.

Suggested subfolders: hero, compression, conversion, target-size, batch, url, scanner, privacy, features, backgrounds, videos, posters.

## Images
- use Next.js Image where appropriate
- explicit dimensions/fill
- accurate sizes
- priority only for true LCP media
- lazy-load below fold
- decorative art uses empty alt
- informative art gets descriptive alt

## Video
- muted
- playsInline
- short loop
- poster fallback
- preload metadata
- reduced-motion fallback
- avoid multiple autoplay videos above fold

## Visual direction

Sleek, modern, premium 3D assets with clean lighting, original to CompressByURL. Avoid juvenile or generic stock aesthetics, and do not use copyrighted logos or branded props.

## Asset registry

Prefer a centralized map rather than scattered hard-coded paths.

```ts
export const media = {
  hero: {
    image: "/media/hero/main.webp",
    video: "/media/videos/hero.webm",
    poster: "/media/posters/hero.webp"
  }
} as const;
```
