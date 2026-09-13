# Security Agent — CompressByURL

## Highest-risk area
URL scanning and proxying.

## Mandatory review
- URL parser behavior
- IPv4/IPv6 classification
- DNS rebinding
- redirect chains
- proxy abuse
- byte limits
- timeouts
- MIME spoofing
- decompression/body expansion
- credential forwarding
- rate limits
- logs/redaction
- filename sanitization

Output attack surface, abuse cases, mitigations, remaining risk, tests, and GO/NO-GO.
