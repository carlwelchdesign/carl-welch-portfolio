# Jolene avatar production art direction

Status: review-ready brief. No artwork in this document is approved for production or public use.

## Creative target

A playful, poised, waist-up Dolly Parton-inspired Jolene who feels drawn for an early-1980s arcade cabinet—not a photograph with a pixel filter, a modern high-resolution illustration, a bobblehead, or a comedy caricature.

The first read is a warm, quick-witted host waiting at the bottom-right of Carl's portfolio. The second read is early-career Dolly: enormous blonde hair, bright eyes, hoop earrings, a red tied patterned blouse, and confident posture. She should feel delighted to help without becoming a mascot that competes with Carl's work.

## Locked production proposal

- Native frame: **48 × 56 pixels**, waist-up, transparent background.
- Occupied silhouette: no more than 44 × 54 pixels; preserve two transparent pixels at every outer edge.
- Display sizes: 144 × 168 CSS pixels at 3× and 192 × 224 at 4× only.
- Color budget: **15 opaque colors plus full transparency**. No partial alpha.
- Pixel shape: one native pixel is always one square display block. No subpixel transforms.
- Perspective: three-quarter or near-front view; eyes within one pixel of a shared horizontal line.
- Pose: shoulders angled slightly, chin level, one hand or forearm available for a restrained evidence gesture.
- Bottom-right launcher: keep the face above the chat label and preserve iPhone safe-area insets.

This grid is deliberately smaller than a 64-bit-style portrait while retaining enough pixels for readable eyes, mouth shapes, hair volume, and a tied blouse. Do not increase the native grid to solve drawing problems.

## Palette budget

| Slot | Use | Target |
| --- | --- | --- |
| 0 | transparency | alpha 0 only |
| 1 | outline/deep shadow | near-black plum, not pure black |
| 2–4 | skin | shadow, base, highlight |
| 5–8 | hair | deep gold, honey, pale blonde, cream highlight |
| 9–11 | blouse | burgundy shadow, red base, coral highlight |
| 12 | blouse pattern | warm cream |
| 13 | eyes/details | deep brown |
| 14 | lips/cheek accent | rose |
| 15 | jewelry/specular | pale warm white |

All colors are opaque. Dithering is hand-placed and limited to hair or blouse transitions; never use checkerboard dithering on the face.

## Silhouette checkpoints

The sprite must remain identifiable when filled as a single dark shape at 3× display size:

1. Hair is the widest mass, with a high crown and two large side waves rather than many tiny curls.
2. Head is smaller than the hair mass; avoid chibi proportions, an oversized face, or a narrow neck with a floating head.
3. Shoulders form a confident shallow diagonal; posture is not hunched or doll-like.
4. Hoop earrings read as one-pixel arcs with deliberate gaps, not noisy circles.
5. The blouse knot and collar form one clear secondary shape below the face.

If the silhouette does not pass in one color, added facial pixels will not fix it.

## Expression language

- `idle`: soft closed-mouth smile, attentive eyes.
- `blink`: one or two frames; no eyelid smear.
- `greet`: brighter smile and two-pixel hand lift or shoulder turn.
- `listen`: mouth neutral, eyes attentive; do not pantomime confusion.
- `think`: one-pixel eye shift and restrained chin/hand cue.
- `speak`: three mouth shapes—closed, narrow open, wide open—without lip-sync claims.
- `evidence`: small outward hand/forearm gesture toward the cited page content.
- `boundary`: warm but firm neutral mouth and level gaze; never scold or look embarrassed.
- `offline`: static calm pose with a small UI status mark outside the character silhouette.

The character represents confidence and hospitality. Avoid winks as a default, exaggerated eyebrow bouncing, constant hair motion, toothy flapping, or pin-up posing.

## Four artist studies

Produce these as materially distinct **48 × 56 native sprites**, shown at 1× and 4×. They are studies, not four resolutions.

### A — Cabinet portrait

Boldest silhouette, three-value face, largest hair masses, minimal blouse pattern. Closest to an early arcade character select portrait. Best animation economy.

### B — Country host

Slight three-quarter pose, clearer blouse knot, one visible forearm for evidence gestures. Warmest conversational read without becoming cartoonish.

### C — Glam close-up

Face and hair occupy more of the frame; shoulders are cropped lower. Strongest likeness cues, least room for hand animation. Must still avoid portrait-level micro-detail.

### D — Porch-wave host

More asymmetric shoulder line and a compact lifted hand. Most playful study, but reject it if the gesture makes the resting launcher visually busy.

Each study uses the same palette ceiling and grid. An artist may move masses and anchors but may not add antialiasing, extra colors, partial alpha, or a larger source canvas.

## Review board

Every study must be presented on:

- transparent checkerboard at 1×;
- portfolio light background at 4×;
- portfolio red, orange, and green section backgrounds at 4×;
- a 390 × 844 mobile launcher mockup at the actual bottom-right size;
- a one-color silhouette panel;
- a three-frame blink and three-mouth speaking strip.

Score silhouette, recognizable cues, warmth, professionalism, readability, animation feasibility, and portfolio fit from 1–5. A study fails if it blurs, depends on high-resolution detail, blocks content, or reads as goofy regardless of total score.

## Rendering contract

- Master assets are indexed-color PNGs or a lossless sprite sheet exported at native resolution.
- Use integer frame coordinates and one fixed origin across every state.
- CSS uses `image-rendering: pixelated`; Canvas 2D uses `imageSmoothingEnabled = false`.
- Never use filtered scaling, fractional CSS dimensions, fractional translation, blur, glow, SVG smoothing, JPEG, or a generated 1254 × 1254 source downsampled into a sprite.
- Static fallback is the approved `idle` frame.
- Reduced motion shows the static frame with at most user-initiated state changes.
- Renderer and state manifest remain replaceable; no chat/model provider logic belongs in the asset.

## Approval and rights boundary

Carl must select one study and approve its silhouette, likeness cues, palette, grid, anchors, and expression language before sprite-sheet production. The current assumption is personal, noncommercial portfolio exploration. Public deployment of a recognizable living person's likeness remains a separate rights and launch decision; documenting that boundary does not change the visual brief or substitute a different character.

Rejected generated concepts are reference evidence only. They must not be copied into the repository, traced, rigged, or treated as production art.
