# START HERE — Codex Workflow

## First Codex instruction

```text
Read AGENTS.md first.

Then read:
- design.md
- docs/00-product-vision.md
- docs/01-product-requirements.md
- docs/03-technical-architecture.md
- docs/06-ui-design-system.md
- docs/07-seo-master-strategy.md
- docs/08-security-privacy.md
- docs/14-implementation-roadmap-36-phases.md
- docs/16-media-integration.md
- docs/17-seo-implementation-roadmap.md

We are building CompressByURL. The 36-phase production roadmap is complete; read
docs/21-implementation-status.md and work only on the next scope explicitly requested by the user.

Before editing:
1. inspect the repository,
2. compare current state with the active phase,
3. give a concise implementation plan,
4. identify conflicts with AGENTS.md.

Implement the phase completely and cleanly.
Skip writing/running automated tests, full `npm run build`, and reviewer passes to conserve agent usage.
Use lightweight code inspection and syntax/type verification.
Do not automatically continue to the next phase.

End with:
- files changed,
- implementation summary,
- acceptance criteria status,
- blockers.
```

## Later implementation phases

```text
Read AGENTS.md, design.md, and the exact active phase in docs/14-implementation-roadmap-36-phases.md.
Read the supporting docs and relevant /agents role files.
Inspect existing code first.
Preserve all previous acceptance criteria.
Implement only Phase <N>.
Verify code cleanly (skip automated tests, full npm build, and reviewer passes), and stop after this phase.
```

## SEO phases

```text
Read:
- AGENTS.md
- docs/07-seo-master-strategy.md
- docs/17-seo-implementation-roadmap.md
- docs/18-seo-page-specifications.md
- docs/19-seo-competitor-targeting.md
- agents/seo.md

Implement only SEO Phase <N>.
Do not create thin pages.
Do not invent competitor claims.
Every tool page must use the shared production tool engine.
```

## Reviewer instruction (On-demand audit only)

> [!NOTE]
> Run this instruction ONLY when the user explicitly requests an audit or formal review. Do NOT run this automatically on standard implementation phases.

```text
Act as the CompressByURL reviewer.
Read AGENTS.md, agents/reviewer.md, docs/15-definition-of-done.md, and the active phase.
Inspect actual code.
Report blockers, important issues, security/privacy, performance/memory, accessibility, acceptance criteria, and PASS/FAIL.
If FAIL, fix only what is necessary for this phase and report results.
```
