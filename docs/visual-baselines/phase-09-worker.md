# Phase 9 Worker Diagnostic

## Route

`/dev/worker` is available only in development and is marked noindex.

## Verified protocol behavior

- The dedicated module worker announces readiness.
- Ping requests are correlated with pong responses.
- Compression requests report progress before returning a structured
  `ENCODER_UNAVAILABLE` error while codec phases are still pending.
- AbortController cancellation rejects with the explicit `CANCELLED` code.
- Disposal removes listeners, terminates the worker, clears timers, and rejects
  pending operations.
- Invalid or unreadable messages fail through the structured protocol boundary.

The diagnostic reports success only after all four live message paths complete.
