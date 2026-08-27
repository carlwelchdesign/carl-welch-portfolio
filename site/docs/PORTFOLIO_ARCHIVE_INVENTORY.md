# Portfolio archive inventory

Status: **internal review only**

Ticket: `PORT-ARCHIVE-001`

Machine-readable record: [`archive-candidates.v1.json`](./archive-candidates.v1.json)

This inventory turns the strongest surviving legacy portfolio artifacts into a reviewable queue. It is not a public gallery and does not grant publication rights. No source asset has been copied into `public/`.

## Evidence boundary

The inventory reconciles three kinds of evidence:

1. surviving files and first-person project descriptions in Carl's legacy portfolio;
2. content-minimized results from a private correspondence review, recorded only as corroboration status; and
3. independent recognition where available.

Private message bodies, sender names, addresses, message identifiers, and filesystem paths are deliberately excluded. A correspondence match can strengthen contribution evidence, but it does not establish public-display rights.

## Ranked feature queue

| Rank | Candidate | Why it belongs in review | Current gate |
| ---: | --- | --- | --- |
| 1 | yU+co studio website | Strong interaction-engineering history, surviving artifact, private contribution corroboration, and team-level Webby recognition | Permission and team attribution |
| 2 | TASER AXON / Evidence.com prototype | Early evidence-workflow and product-interface relevance | Private only pending security, confidentiality, and rights review |
| 3 | Magento Go homepage | Clear senior-design assignment and legible full-page artifact | Client rights and scope wording |
| 4 | Fox A Year of a Million Moments | Full surviving visual plus implementation corroboration | Client and agency rights, plus team attribution |
| 5 | Darksiders II promotional site | Supported front-end implementation and revisions | Rights review and higher-resolution asset |
| 6 | Almost Alice music experience | Strong visual and supported team contribution | Disney Records and agency rights, plus team attribution |
| 7 | David Lynch Foundation Music | Wide design artifact and supported iteration history | Foundation, artist-image, and agency rights |
| 8 | Beatnik mobile UI concepts | Best artifact for showing early mobile UI exploration | Product, music-artwork, and agency rights |

Three reserves—Superman 75, Bolthouse Frozen, and PrimaLoft—remain in the manifest because they may become useful if higher-resolution assets and stronger provenance are found. They should not displace the top eight now.

The Ignite Creative Learning photo set is intentionally ranked last and marked `private_only`. The historical instruction claim may be useful, but the photographs may depict minors and require a separate consent and image-permission review.

## Visual findings

- **Feature-ready after rights review:** Magento Go, Fox Million Moments, Almost Alice, David Lynch Foundation Music, and Beatnik.
- **Useful with constraints:** yU+co is a small animated GIF and every frame needs review. Darksiders II is only a 240 × 162 thumbnail.
- **Not public by default:** TASER contains sensitive evidence-workflow imagery. Ignite classroom photographs remain private.
- **Reserve only:** Superman 75, Bolthouse Frozen, and PrimaLoft are 240 × 162 thumbnails and need better source files.

Each manifest entry includes an exact SHA-256 fingerprint, source dimensions, byte size, caption draft, alt-text draft, presentation note, and prohibited inference. These details make later copying and approval auditable.

## Recommended archive information architecture

Use one **Selected archive** section after the current work, not a second full portfolio competing with it.

Each approved archive card should contain:

- client or project name and year;
- Carl's supported role and bounded contribution;
- one rights-cleared visual;
- a compact technology or craft line;
- one evidence note that distinguishes first-party, private-corroborated, and independently recognized facts; and
- a visible historical-context label so visitors do not mistake old technology for Carl's current stack.

The yU+co item can carry the exact phrase **2006 Webby Awards Honoree** only when the text makes clear that the site and team received the recognition. It must never say Carl personally won a Webby.

## Approval checklist

Before any candidate moves to public content:

- [ ] Carl approves the project, contribution wording, caption, alt text, and crop.
- [ ] Client, studio, agency, brand, photography, and character-art rights are checked as applicable.
- [ ] Team attribution is explicit where the source does not prove sole authorship.
- [ ] A higher-resolution source is found for any featured image below the intended render size.
- [ ] Private correspondence is used only as an internal evidence source, never quoted without separate approval.
- [ ] The asset hash matches the reviewed manifest entry at copy time.
- [ ] The public site receives only the approved derivative, not the legacy repository or its unrelated files.

Until those checks are recorded, every item remains `needs_permission` or `private_only`; none is publication-ready.
