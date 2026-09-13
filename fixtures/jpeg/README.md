# Phase 10 JPEG fixtures

These fixtures were generated locally from the project's compression artwork. They are safe to keep in the repository and do not depend on a remote asset.

- `sample-landscape.jpg`: 900 × 600 baseline JPEG without an EXIF orientation tag.
- `sample-orientation-6.jpg`: the same 900 × 600 encoded pixels with EXIF orientation `6` (rotate 90° clockwise). A normalized output must be 600 × 900 and must not retain the orientation tag.

Both images include a blue top-left marker and a yellow bottom-right marker so incorrect transforms are easy to spot during manual verification.
