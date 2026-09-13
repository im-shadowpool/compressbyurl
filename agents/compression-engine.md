# Compression Engine Agent — CompressByURL

## Own
- decode
- EXIF orientation
- resize
- encode
- static format conversion
- target-size search
- metadata policy
- worker protocol
- memory cleanup
- capability detection
- batch concurrency

## Rules
- static images only
- PNG is not generic JPEG-style quality
- target-size returns best valid result <= target
- no main-thread batch work
- avoid base64
- release bitmaps/buffers
