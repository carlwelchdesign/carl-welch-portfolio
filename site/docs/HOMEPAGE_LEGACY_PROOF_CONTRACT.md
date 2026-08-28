# Homepage legacy proof contract

Ticket: `PORT-CAREER-007.1`

## Product problem

The homepage career portrait makes the right strategic argument: current product-engineering work
grew from a long creative and technical practice. The section currently contains no images, so a
recruiter must accept that range as copy and discover the visual archive later.

The solution is a compact proof strip inside the existing orange career portrait, not another
general gallery. It should make four modes of the earlier career immediately legible and lead to
the full approved archive.

## Approved selection

The four examples are reused directly from `legacyWorkImages` and ordered as a career progression:

1. `legacy-dkny` — early fashion e-commerce and interface art direction through OneSoft.
2. `legacy-gm-defense` — immersive General Dynamics / GM Defense training research.
3. `legacy-gtd-iq` — online product work in the David Allen Company / GTD ecosystem.
4. `legacy-ufc-japan` — later agency campaign implementation spanning Flash, JavaScript, PHP,
   MySQL, and social integrations.

Together they cover commerce, immersive systems, product work, and full-stack campaign delivery.
The selection does not imply these are the only or largest projects.

## Content and evidence boundaries

- Reuse each record's exact project name, context, image, dimensions, alt text, and `legacy-*` ID.
- Link each card to `/archive#{id}` with a native anchor so navigation works without JavaScript.
- Do not add employment, direct-client, sole-authorship, award, metric, or production claims.
- The existing career narrative, four career chapters, and `Explore the career arc` action remain
  unchanged.

## Presentation

### Desktop

- Place a quiet `From the archive / Four selected examples` divider after the narrative/chapter
  layout and before the existing action.
- Use four equal cards in one row. Each card has a neutral image field, mono context, project title,
  and north-east arrow.
- Standard 240 x 162 sources remain capped at 240 px and are never stretched to fill the card.
- Hover and focus invert the card to ink/paper while retaining a visible orange focus outline.

### Mobile

- Preserve one horizontal row with cards at approximately 78 viewport-width and native scrolling.
- Show `Swipe to browse` guidance, scroll snapping, a restrained visible scrollbar, and no document
  overflow.
- Keep normal vertical page navigation and keyboard focus behavior.

## Verification

- Assert the exact four IDs, order, project names, contexts, hrefs, and image sources.
- Assert every source reports its approved intrinsic width and is not rendered above 240 px.
- Verify keyboard and no-JavaScript navigation to an exact archive target.
- Verify mobile horizontal browsing, scroll guidance, and zero page overflow.
- Run accessibility coverage, focused tests, the complete repository gate, and the full browser
  suite.

No push or deployment is part of this ticket.
