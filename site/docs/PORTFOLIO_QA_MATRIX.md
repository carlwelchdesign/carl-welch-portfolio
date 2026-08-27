# Portfolio production QA matrix

Last updated: 2026-08-27
Ticket: `PORT-QA-001`

Production origin: `https://carl-welch-portfolio.flakeysaturation.chatgpt.site`. Version 3 from `main` commit `234ac70437491a21aa495ad5a92cf633a87774ac` is deployed and exact-origin smoke checks pass.

This record separates automated production checks from the physical-device and assistive-technology checks that still require human review.

## Automated production checks

The standalone production build was served locally and exercised through a real browser at 320, 390, 430, and 1440 CSS pixels.

| Area | Coverage | Result |
| --- | --- | --- |
| Public routes | `/`, `/work`, `/archive`, `/about`, `/capabilities`, `/experience`, `/recommendations`, `/contact`, and all three selected-work detail routes | Pass |
| Responsive layout | 320, 390, 430, and 1440 CSS-pixel widths | Pass; no horizontal overflow found |
| Page structure | One `h1`, a named `main` target, and a skip link on every tested route | Pass |
| Browser runtime | Meaningful rendered content, no framework error overlay, and no console errors | Pass |
| Repeatable browser gate | Playwright Chromium, axe-core, responsive layout, keyboard menu activation, reduced motion, and no-JavaScript rendering | 17 checks run on pull requests and `main` |
| Touch targets | All visible links, buttons, and summaries on the tested mobile routes meet a 44 by 44 CSS-pixel minimum | Pass after the 2026-08-26 regression fix |
| Mobile navigation | Native `details`/`summary` control and menu links | Pointer activation passes; physical keyboard and VoiceOver activation remain below |
| Reduced motion | Global CSS fallback, Motion `reducedMotion="user"`, and explicit suppression of looping motion | Static implementation check passes; OS-level device check remains below |
| Production boundaries | Jolene fixture launcher absent and the disabled public BFF returns its expected unavailable response | Covered by `check:container` |
| Metadata and indexing | Titles, descriptions, canonical URLs, social metadata, share images, sitemap, robots, and approved recommendation indexing | Covered by `check:routes` and metadata checks |
| Exact production origin | 11 pages, 25 archive images, evidence anchors, canonical/Open Graph/X metadata, sitemap, robots, and résumé | Pass after version 3 deployment and again after rollback restoration |

## Production performance evidence

Browser measurements were taken from the public origin on August 27, 2026. These are controlled lab measurements, not field Core Web Vitals.

| Profile | LCP | FCP | CLS | Long tasks | Transfer | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Desktop, 1440 × 1000 | 384 ms | 384 ms | 0 | 1 | 550 KB | Pass |
| Mobile, 390 × 844 | 296 ms | 296 ms | 0 | 0 | 516 KB | Pass |
| Mobile, 4G + 4× CPU throttle | 1,692 ms | 1,692 ms | 0.0009 | 1 | Browser cache dependent | Pass |

The repeatable `check:production` command fails when HTTPS or a non-loopback origin is absent, LCP exceeds 2.5 seconds, CLS exceeds 0.1, more than three long tasks occur, or horizontal overflow appears.

## Rollback evidence

Sites version 3 was rolled back to the previously verified version 2 and restored to version 3. The version-specific `/archive` route changed from `200` to `404` during rollback and returned to `200` after restoration. The full exact-origin route suite passed after restoration. See [`PRODUCTION_OPERATIONS_RUNBOOK.md`](./PRODUCTION_OPERATIONS_RUNBOOK.md).

The complete repository gate (`pnpm check`), Playwright browser suite (`pnpm check:browser`), and container smoke test are required again in CI before this change can merge.

## Regression fixed

The browser sweep found several visually small links whose interactive boxes were below the 44 by 44 CSS-pixel mobile target: the wordmark, header and footer links, archive project titles, and archive action links. Their interactive boxes now have a 44-pixel minimum height without increasing the type size.

## Human acceptance gates

These checks are intentionally not reported as complete by automation:

- Test on a physical iPhone in Safari, including portrait, landscape, safe areas, and 200% page zoom.
- Traverse every public route with VoiceOver and confirm landmarks, heading order, link names, focus order, and mobile-menu activation.
- Confirm `Reduce Motion` removes non-essential entrance, backdrop, orbit, and pulse motion without hiding content.
- Collect field Core Web Vitals after enough real traffic exists; the initial release currently has controlled production-origin lab evidence only.
- Complete Carl's final visual and interaction acceptance pass.

`PORT-QA-001` must remain in progress until these human gates are recorded.
