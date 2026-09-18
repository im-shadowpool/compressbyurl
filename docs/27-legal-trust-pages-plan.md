# 27 — Legal and trust pages implementation plan

Last reviewed: September 19, 2026

This plan records the launch-facing legal and trust surfaces for CompressByURL.
It is product implementation guidance, not a substitute for advice from counsel in
the operator's jurisdiction.

## Product data-flow findings

- Local uploads are decoded, resized, encoded, previewed, named and packaged in the
  browser. Local file bytes, filenames, previews and metadata are not intentionally
  sent to the server or analytics.
- Image URL mode first tries a credential-free browser fetch and can fall back to a
  restricted server endpoint.
- Website URL mode sends a submitted public page URL to a restricted server endpoint
  so it can retrieve HTML and return a structured image-candidate manifest.
- URL endpoints enforce public HTTP/HTTPS destinations, DNS and redirect checks,
  content-type restrictions, time/byte budgets and rate limits. Normal hosting and
  security logs may still contain IP addresses, user agents, timestamps and request
  information.
- Tool preferences use browser local storage. They contain settings, not image files.
- Production can load GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured. The
  implementation disables Google Signals and advertising-personalisation signals.

## Researched requirements and implementation decisions

1. **Privacy notice** — The ICO's right-to-be-informed guidance lists the operator's
   identity/contact details, data categories, purposes, lawful bases, recipients,
   international transfers, retention, rights and complaint route among the expected
   disclosures. The shipped `/privacy` page covers each category and clearly separates
   local uploads from networked URL modes.
2. **Cookie choice** — ICO cookie guidance says non-essential analytics storage needs
   clear information and an affirmative choice. The GA4 tag is now gated behind an
   accept/decline control, with a persistent footer route back to Cookie settings.
3. **Cookie details** — Google's GA4 documentation identifies `_ga` and
   `_ga_<measurement-id>` as first-party cookies with a typical two-year expiry. The
   `/cookies` table names these cookies, their purpose and duration.
4. **California transparency** — California's Attorney General describes privacy-policy
   disclosures and consumer rights for businesses in scope. The policy states that the
   service does not sell personal information or share it for cross-context behavioural
   advertising and gives one route for privacy requests without claiming that every
   California statute applies to this early-stage service.
5. **Terms and acceptable use** — URL scanning creates a distinct abuse and rights risk.
   `/terms` therefore includes authorisation, copyright, access-control, proxy, scanning,
   rate-limit and production-output rules. A separate acceptable-use or disclaimer page
   would duplicate short content, so those provisions remain in Terms.
6. **Trust/contact** — `/about` explains the three workflows, the privacy boundary,
   supported static formats and project contact routes. There are no account, billing,
   refund or subscription pages because those product systems do not exist.

## Implemented route set

| Route | Purpose | Indexing |
| --- | --- | --- |
| `/privacy` | Complete data-flow and privacy-rights notice | Canonical, sitemap |
| `/terms` | Service rules, URL acceptable use, disclaimers and liability | Canonical, sitemap |
| `/cookies` | Browser storage inventory and analytics choice | Canonical, sitemap |
| `/about` | Product identity, operating principles and contact | Canonical, sitemap |

All four routes use one shared server-rendered reading layout, unique metadata,
breadcrumb navigation, a plain-language summary and stable section anchors. They are
linked from the global footer.

## Owner inputs required before public launch

- Confirm the operator's complete legal name, business form and postal address, then add
  them to the controller and Terms identity sections.
- Confirm that `privacy@compressbyurl.com` and `hello@compressbyurl.com` are provisioned
  and monitored, or replace them in `src/config/legal.ts`.
- Confirm the operator's country/state and add a specific governing-law and forum clause
  if counsel recommends one.
- Record the production hosting/security-log retention period and the GA4 property
  retention setting, then replace the criteria-based retention language with exact
  periods where possible.
- Confirm hosting, CDN, email and analytics vendors and their transfer mechanisms before
  naming processors or promising jurisdiction-specific safeguards.
- Obtain legal review for the jurisdictions actively targeted. In particular, confirm
  whether an EU/UK representative, DPO, California notice additions, or a child-specific
  age threshold is required.

## Primary research references

- ICO, [What privacy information should we provide?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/)
- ICO, [Cookies and similar technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)
- Google Analytics, [Data collection](https://support.google.com/analytics/answer/11593727)
- Google Analytics, [Cookie usage on websites](https://support.google.com/analytics/answer/11397207)
- California Attorney General, [California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa)

## Verification checklist

- Run `npm run typecheck`, `npm run lint` and `npm run format:check`.
- Inspect all four routes at desktop and mobile widths.
- Verify keyboard focus, section anchors, table overflow and footer wrapping.
- In a production-configured preview, confirm GA requests do not occur before acceptance,
  do occur after acceptance, and stop on later page loads after withdrawal.
- Re-run the data-flow review whenever a new provider, account system, payment feature,
  contact form or server-side image processing path is introduced.
