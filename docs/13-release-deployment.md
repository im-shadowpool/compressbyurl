# 13 — Release & Deployment

## Environments

- local
- preview
- production

Optional stable staging for scanner/security validation.

## CI gates

- typecheck
- lint
- unit tests
- integration tests where relevant
- build
- E2E smoke

## Before production

- scanner security suite
- accessibility smoke
- performance check
- sitemap/canonical/robots validation
- structured-data validation
- analytics privacy review

## Hosting

Frontend can use a modern Next.js hosting platform.

Scanner environment must support:
- controlled outbound HTTP
- streaming
- DNS/IP validation strategy
- strict timeouts
- rate limiting
- egress monitoring

Keep scanner deployable independently.
