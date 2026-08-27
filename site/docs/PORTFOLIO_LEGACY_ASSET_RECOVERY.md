# Legacy asset recovery record

Status: **internal review only**

Ticket: `PORT-ARCHIVE-002`

Machine-readable record: [`legacy-asset-recovery.v1.json`](./legacy-asset-recovery.v1.json)

This pass searched the legacy portfolio for stronger versions of the selected archive candidates and for motion artifacts worth preserving. It did not copy assets into the portfolio, execute Flash content, play private media, or make a publication decision.

## Outcome

- **Almost Alice:** a 3 MB file named `.png` is actually an RGB Photoshop document. A temporary local JPEG preview confirmed the composition. It may be a useful private editing source, but it is not larger than the existing JPEG and must never be served with the false extension.
- **TASER:** a lossless 821 × 480 PNG alternate exists. It remains private-only because fidelity does not clear the sensitivity, confidentiality, or rights boundary.
- **Fox Million Moments:** a 561 × 521 alternate bracket state exists. It is useful secondary evidence, not a resolution upgrade over the selected 647 × 649 image.
- **yU+co:** a 562 × 214 static two-state overview adds system context. The GIF contains four encoded frames: three meaningful standalone navigation states and one frame that does not render meaningfully without composition. Visible states also contain a legacy business-contact footer. Any derivative must be composited and privacy-cropped before rights and attribution review; neither source is a hero image.
- **Darksiders II:** a second 240 × 162 thumbnail exists and does not solve the resolution problem.
- **Superman 75, Bolthouse Frozen, and PrimaLoft:** no stronger local source was found in this repository pass.

## Legacy motion boundary

Three legacy motion files survive:

| Artifact | Structural finding | Decision |
| --- | --- | --- |
| Just Go With It SWF | Compressed Flash 10, 300 × 250 stage, 18 fps timeline metadata | Quarantine; do not execute; restore only after project selection and rights review |
| Just Go With It FLV | 300 × 250, 16.015 seconds, 23.976 fps, VP6 video, MP3 audio | Offline media inspection only; do not transcode until selected |
| Ben Hur SWF | Compressed Flash 10, 300 × 250 stage, 24 fps timeline metadata | Quarantine; do not execute; stronger provenance required |

The SWF frame counts describe the authored timeline header and may not describe ActionScript-driven behavior. They are structural metadata, not proof that the creative is static.

## Safe restoration protocol

If Carl selects one of these motion projects:

1. verify the exact source hash against the recovery manifest;
2. copy the file into an owner-only temporary directory, never `public/`;
3. use an offline, disposable conversion environment with networking disabled;
4. extract frames or transcode media without running ActionScript or a browser plugin;
5. composite delta frames where the format requires it and inspect every output frame for private data, licensed content, and visual quality;
6. record the tool version and exact transformation command; and
7. move only an approved derivative into the portfolio after the rights and caption decision is recorded.

No conversion is justified yet. The surviving SWF/FLV work is small-format advertising material and is not part of the approved archive queue.
