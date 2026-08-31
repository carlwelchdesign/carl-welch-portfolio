# Jolene four-frame reaction references

These five files are Carl-supplied reference sheets from the earlier reaction
exploration. They are preserved byte-for-byte under `references/`.

They are the preferred visual direction for reaction work. Do not redraw them,
replace their identity, or use the rejected independent-frame generation and
arm-grafting workflow.

## Candidate state mapping

| Source | Visual action | Candidate avatar state |
| --- | --- | --- |
| `exec-298dd526-dc20-4db4-a521-9b16f8081bda.png` | Neutral pose with eye/blink variation | `idle`, `blink`, `listen` |
| `exec-83bf7940-2a70-459c-81cf-1f7d4d008a5f.png` | Raised-hand greeting | `greet` |
| `exec-bd7ef225-a69e-41a2-ad4e-7f146150cfb7.png` | Eye and mouth cadence | `speak`, possible `think` hold |
| `exec-a174c933-aa69-42ca-a7c4-dbcdb591e32c.png` | Directional pointing gesture | `evidence` |
| `exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png` | Palms-up knowing shrug | `offline`, possible `boundary` |

The existing provider-independent signal contract remains authoritative:

| UI signal | State |
| --- | --- |
| Chat opens or intro begins | `greet` |
| Visitor types in the textarea | `excited` |
| Visitor input pauses before submit | `listen` |
| Request begins and the server is pending | `think` |
| Answer begins | `speak` state using the authored mouth-and-eye cadence |
| Answer finishes | `idle` |
| Evidence is opened or highlighted | `evidence` |
| Jolene cannot verify a claim | `boundary` |
| Service fails or is unavailable | `offline` |
| Inactivity timeout | `rest` |
| Activity resumes | `idle` |

## Current technical boundary

- Each source contains four visual frames.
- The sources are RGB images with a baked checkerboard, not transparent sprites.
- Canvas sizes differ, and at least one width is not evenly divisible by four.
- Extraction must therefore detect each character silhouette rather than blindly
  split every sheet into four equal columns.
- Extracted frames are normalized to fixed 105 x 115 native cells with every
  character pixel contained inside its cell.
- The reviewed sheet is wired into the local runtime for site review.
- Local integration does not authorize deployment or public use.

## Asana records checked

- `PORT-AVATAR-003.1`: provider-independent states, signals, transitions, timing,
  interruption, and reduced-motion behavior.
- `PORT-AVATAR-004.2`: intro, open/close, visitor input, request waiting, answer,
  evidence, boundary, offline, inactivity, and reduced-motion event wiring.
- `PORT-AVATAR-005.7`: records rejection of independent state redraws because of
  identity, alpha, proportion, and inflation defects.
- `PORT-AVATAR-005.7C`: records the failed arm-graft anatomy/seam approach and the
  later direction to favor a few strong authored poses over synthetic filler.

This directory remains the reproducible art source for the local runtime asset.

## V1 runtime direction

The current v1 runtime candidate is in `v1-static-sheet/`. Its first nine
105 x 115 cells remain pixel-identical to the reviewed static sheet. Thirteen
face-locked frames are appended for listen, speak, evidence, boundary, and
offline. Rest and Think stay on stable V1 poses because their independent
generated variants failed face-continuity review. The runtime advances only
the accepted frames and uses one representative frame when reduced motion is
requested. No pose interpolation, runtime rotation, or runtime scaling is used.
