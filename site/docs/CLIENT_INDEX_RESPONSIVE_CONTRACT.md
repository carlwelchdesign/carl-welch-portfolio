# Client index responsive contract

Ticket: `PORT-CAREER-005.1`

## Product problem

The historical client field is useful proof of range, but the equal-square wall dominates the
experience page. Measured locally on August 27, 2026, the section is approximately 1,829 px tall
at 1440 px and 1,936 px tall at 390 px. Mobile visitors must cross twelve logo rows before the
career narrative resumes.

The goal is density with dignity: preserve the full approved record while making it feel like an
editorial index instead of a trophy wall.

## Content invariants

- Preserve all 35 marks, their source images, order, and visible labels.
- Preserve the language distinguishing direct roles from agency, studio, and project-team work.
- Do not infer employment, direct-client relationships, sole authorship, award ownership, dates,
  or contribution details from the presence of a mark.
- Keep the existing green field, paper tiles, ink rules, grayscale treatment, and mono labels.

## Responsive behavior

### Desktop

- Use an eight-column index with 4:3 mark cells rather than six columns of square cells.
- Let the final attribution note span the unused five cells in the fifth row so the grid closes
  intentionally rather than leaving empty tracks.
- Target a complete section height below 1,250 px at a 1440 x 1000 viewport.

### Tablet

- Use five columns with compact 4:3 cells and a full-row attribution note.
- Keep every mark visible without horizontal browsing at widths above 720 px.

### Mobile

- Use a manually scrollable, three-row horizontal index with stable 112 px columns.
- Add visible `35 selected marks` and `Swipe to browse` guidance immediately before the index.
- Keep the closing attribution note as a larger three-row, two-column card.
- Preserve normal vertical page scrolling; horizontal gestures inside the index must not create
  page-level overflow or trap keyboard users.
- Target a complete section height below 1,050 px at 390 x 844.

## Accessibility and interaction

- The ordered visual sequence remains a semantic list with the existing descriptive list label.
- Images stay decorative because the visible adjacent label supplies the mark name.
- The horizontal index uses native overflow and touch momentum, not an automated marquee.
- The index is keyboard-focusable on mobile and includes an accessible description of its browse
  behavior. Focus receives the existing orange focus treatment.
- Scrollbar styling may be restrained but must remain visible enough to communicate position.
- No animation is introduced, so reduced-motion behavior is unchanged.

## Verification

- Assert 35 images, 36 list items, exact attribution copy, source intrinsic width, and ordering.
- Measure the full section below the desktop and mobile height thresholds.
- Confirm the mobile grid scrolls horizontally while the document itself never overflows.
- Confirm the mobile index is keyboard-focusable and its accessible description is present.
- Run focused browser coverage, the complete repository check, and the full browser suite.

No push or deployment is part of this ticket.
