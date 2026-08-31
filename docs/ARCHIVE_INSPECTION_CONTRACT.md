# Archive inspection contract

Ticket: `PORT-CAREER-004.1`

## Intent

The legacy work section is already approved as an editorial contact sheet. The inspector is a
secondary reading layer, not a new art direction. It should let a hiring manager examine one
example at a time without making the base page louder, denser, or less truthful.

## Base-page invariants

- Keep the existing 12-column contact-sheet composition, card order, copy, image treatment,
  client/studio attribution, and historical technology labels.
- Preserve every `legacy-*` item ID so existing site-relative evidence links continue to land on
  the correct card.
- Standard 240 x 162 source images remain capped at their intrinsic width. They may sit in a
  larger neutral field, but they must not be enlarged into blurry hero art.
- The two larger Magento sources may use their available intrinsic dimensions responsively.
- The page remains fully readable when JavaScript is unavailable; inspection is an enhancement.

## Interaction

- Each image field gains a quiet `Inspect project` control with a project-specific accessible
  name. The rest of the card remains static content.
- Opening the control uses a native modal dialog containing the image, project name, bounded
  contribution statement, context, historical technologies, position count, and previous/next
  controls.
- `Escape` and the explicit close control dismiss the dialog. Focus returns to the control that
  opened it. Left and right arrow keys move between projects while the dialog is open.
- Previous/next navigation wraps through all sixteen examples and updates the dialog heading so
  assistive technology receives the new context.
- The modal must not mutate the page URL or replace the existing item fragment contract.

## Responsive and motion behavior

- Desktop uses a two-column image-and-copy composition inside a bounded viewport-height dialog.
- Small screens use one column, safe-area-aware spacing, and internal scrolling without horizontal
  overflow.
- Opening/closing may use opacity and a short vertical transition only. Under
  `prefers-reduced-motion: reduce`, transitions are removed.
- The dialog backdrop and controls use the portfolio's existing ink, paper, orange, line, and mono
  typography tokens; no new visual language is introduced.

## Verification contract

- Content regression: sixteen cards, sixteen inspect controls, intact IDs, copy, technologies, and
  intrinsic source dimensions.
- Interaction regression: open, close button, `Escape`, focus restoration, previous/next wrapping,
  and arrow-key navigation.
- Presentation regression: desktop and mobile dialog bounds, no page or modal horizontal overflow,
  and reduced-motion behavior.
- Run the focused browser suite and the repository's complete local `pnpm --dir site check` gate.

No push or deployment is part of this ticket.
