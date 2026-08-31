# V1 reaction sprite sheet

This is the append-only v1 local-runtime reaction candidate.

- Nine compatibility poses plus thirteen face-locked reaction frames.
- Native cell: 105 x 115.
- Full sheet: 2310 x 115.
- Integer display sizes: 315 x 345 at 3x, or 420 x 460 at 4x.
- Every recovered character pixel remains inside its cell.
- No interpolated arm movement, runtime rotation, runtime scaling, or pose tweening.
- Default blink changes only the eye patch of the exact idle frame.
- Rest retains its known-good closed-eye pose, and Think retains the stable attentive pose until identity-locked art exists.
- Animated reaction frames preserve their anchor face; only the speaking mouth changes.
- Blink timing target: one 120 ms blink every 4–7 seconds while idle.
- Reduced-motion presentation remains static.

Frame order:

1. `idle`
2. `blink`
3. `greet`
4. `attentive` — reduced-motion listening representative
5. `speak` — reduced-motion speaking representative
6. `evidence`
7. `boundary-offline`
8. `rest`
9. `typing-peek` — clasped hands, forward lean, downward gaze

After these nine compatibility cells, face-locked source frames are appended
for listen, speak, evidence, boundary, and offline. The first nine cells retain
their positions, dimensions, scale, and decoded RGBA pixels. Unstable Rest and
Think variants are excluded from the atlas rather than treated as completed art.

`jolene-v1-static-sheet.png` is the indexed transparent PNG sheet.
`jolene-v1-static-sheet.gif` is the equivalent GIF sheet.
`jolene-v1-idle-blink-preview.gif` remains the focused idle-blink preview.

The build script stages the PNG sheet and idle fallback under
`public/jolene/v1-static-sheet/`. The local site maps interaction signals to
timed authored sequences and retains static representative frames for reduced
motion. Deployment and public use remain separately gated.
