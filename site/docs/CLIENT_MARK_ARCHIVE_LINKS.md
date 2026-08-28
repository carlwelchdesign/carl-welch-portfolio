# Client mark to archive link audit

Ticket: `PORT-CAREER-006.1`

This audit compares the 35 approved historical client/project marks with the 16 approved visual
records in `legacyWorkImages`. A link is allowed only when the archive record itself names the
organization, property, or directly corresponding product in its project, context, contribution,
or image description.

The link says only that a related visual record exists. It does not establish employment,
direct-client status, sole authorship, award ownership, or responsibility beyond the bounded copy
on the destination card.

## Approved mappings

| Mark | Archive destination | Matching archive context |
| --- | --- | --- |
| Coca-Cola | `/archive#legacy-coca-cola` | Coca-Cola interactive kiosk |
| DKNY | `/archive#legacy-dkny` | OneSoft / DKNY e-commerce contribution |
| General Dynamics | `/archive#legacy-gm-defense` | General Dynamics / GM Defense immersive training |
| Getting Things Done | `/archive#legacy-gtd-iq` | David Allen Company GTD IQ application |
| Magento | `/archive#legacy-magento-social` | Magento social campaign system |
| Metal Gear Solid | `/archive#legacy-metal-gear-solid` | PETROL Advertising game-marketing implementation |
| UFC | `/archive#legacy-ufc-japan` | PETROL Advertising UFC Japan campaign implementation |
| USA Network | `/archive#legacy-political-animals` | Political Animals USA Network campaign |
| Warner Bros. | `/archive#legacy-300` | Warner Bros. 300 movie-marketing implementation |

## Marks that remain static

The following 26 marks do not have a sufficiently direct match among the 16 approved working
images and must remain non-interactive:

- ABC
- Boeing
- CBS
- CNBC
- David Lynch Foundation
- DC Comics
- E! Entertainment
- Fernet-Branca
- Fox Entertainment
- GWAR
- HGTV
- International Monetary Fund
- Lifetime
- Lucasfilm
- Mundet
- NBC
- NFL
- Playboy
- SOJA
- Sony
- STIHL
- TASER
- THQ
- TV Land
- Walt Disney Pictures
- World Bank

GWAR remains part of the career narrative, but there is no matching item in the approved visual
archive. TASER and other roles may have separate portfolio records, but this ticket intentionally
links only to the 16-item working archive.

## Presentation contract

- Linked and static marks keep the same dimensions and position in the compact index.
- Linked marks receive an always-visible north-east arrow plus orange hover/focus treatment.
- Every link uses an accessible name in the form `View archived work related to {mark}`.
- Static marks do not receive a link, button, arrow, hover treatment, or keyboard stop.
- Destinations preserve the existing site-relative `#legacy-*` evidence/deep-link boundary.

No push or deployment is part of this ticket.
