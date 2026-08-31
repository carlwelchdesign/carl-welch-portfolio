#!/usr/bin/env python3
"""Build the approved nine-pose v1 sheet and its local runtime copy."""

from __future__ import annotations

import hashlib
import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
REFERENCE_DIR = ROOT / "references"
OUTPUT_DIR = ROOT / "v1-static-sheet"
FRAME_DIR = OUTPUT_DIR / "frames-105x115"
PUBLIC_RUNTIME_DIR = ROOT.parents[1] / "public" / "jolene" / "v1-static-sheet"
TYPING_SOURCE = ROOT.parents[1] / "public" / "jolene" / "sprites" / "typing-excited-v1.png"

REVIEW_CELL = (420, 460)
NATIVE_CELL = (105, 115)
NATIVE_EYE_PATCH = (43, 27, 65, 39)
FACE_PATCH = (38, 18, 73, 52)
UPPER_FACE_PATCH = (38, 18, 73, 41)
REVIEW_CHARACTER_HEIGHT = 440
REVIEW_BASELINE_Y = 448
REVIEW_ANCHOR_X = 210

POSES = (
    {
        "id": "idle",
        "source": "exec-298dd526-dc20-4db4-a521-9b16f8081bda.png",
        "sourceFrame": 0,
    },
    {
        "id": "blink",
        "source": "exec-298dd526-dc20-4db4-a521-9b16f8081bda.png",
        "sourceFrame": 2,
    },
    {
        "id": "greet",
        "source": "exec-83bf7940-2a70-459c-81cf-1f7d4d008a5f.png",
        "sourceFrame": 0,
    },
    {
        "id": "attentive",
        "source": "exec-298dd526-dc20-4db4-a521-9b16f8081bda.png",
        "sourceFrame": 1,
    },
    {
        "id": "speak",
        "source": "exec-bd7ef225-a69e-41a2-ad4e-7f146150cfb7.png",
        "sourceFrame": 1,
    },
    {
        "id": "evidence",
        "source": "exec-a174c933-aa69-42ca-a7c4-dbcdb591e32c.png",
        "sourceFrame": 0,
    },
    {
        "id": "boundary-offline",
        "source": "exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png",
        "sourceFrame": 0,
    },
    {
        "id": "rest",
        "source": "exec-bd7ef225-a69e-41a2-ad4e-7f146150cfb7.png",
        "sourceFrame": 2,
    },
    {
        "id": "typing-peek",
        "standalone": str(TYPING_SOURCE),
    },
    # Append-only reaction frames. The first nine cells above remain stable for
    # backwards-compatible review links and fallbacks.
    {"id": "listen-1", "source": "exec-298dd526-dc20-4db4-a521-9b16f8081bda.png", "sourceFrame": 0},
    {"id": "listen-2", "source": "exec-298dd526-dc20-4db4-a521-9b16f8081bda.png", "sourceFrame": 3},
    {"id": "speak-1", "source": "exec-bd7ef225-a69e-41a2-ad4e-7f146150cfb7.png", "sourceFrame": 0},
    {"id": "speak-mouth", "source": "exec-bd7ef225-a69e-41a2-ad4e-7f146150cfb7.png", "sourceFrame": 1},
    {"id": "speak-3", "source": "exec-bd7ef225-a69e-41a2-ad4e-7f146150cfb7.png", "sourceFrame": 3},
    {"id": "evidence-1", "source": "exec-a174c933-aa69-42ca-a7c4-dbcdb591e32c.png", "sourceFrame": 1},
    {"id": "evidence-2", "source": "exec-a174c933-aa69-42ca-a7c4-dbcdb591e32c.png", "sourceFrame": 2},
    {"id": "evidence-3", "source": "exec-a174c933-aa69-42ca-a7c4-dbcdb591e32c.png", "sourceFrame": 3},
    {"id": "boundary-1", "source": "exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png", "sourceFrame": 2},
    {"id": "boundary-2", "source": "exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png", "sourceFrame": 3},
    {"id": "offline-0", "source": "exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png", "sourceFrame": 1},
    {"id": "offline-1", "source": "exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png", "sourceFrame": 2},
    {"id": "offline-2", "source": "exec-9a363e5e-8203-4da6-a90b-b7aeb04251b9.png", "sourceFrame": 3},
)

SIGNAL_TO_POSE = {
    "intro_started": "greet",
    "chat_opened": "greet",
    "visitor_typing": "typing-peek",
    "visitor_input": "listen",
    "request_started": "attentive",
    "answer_started": "speak",
    "answer_finished": "idle",
    "evidence_highlighted": "evidence",
    "cannot_verify": "boundary",
    "service_unavailable": "offline",
    "inactive": "rest",
    "activity_resumed": "idle",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_neutral_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, _alpha = pixel
    return min(red, green, blue) >= 238 and max(red, green, blue) - min(red, green, blue) <= 10


def remove_checkerboard(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    visited = bytearray(width * height)

    for seed in range(width * height):
        if visited[seed]:
            continue
        x, y = seed % width, seed // width
        if not is_neutral_background(pixels[x, y]):
            continue

        queue = [seed]
        visited[seed] = 1
        head = 0
        touches_edge = False
        while head < len(queue):
            index = queue[head]
            head += 1
            x, y = index % width, index // width
            touches_edge = touches_edge or x in (0, width - 1) or y in (0, height - 1)
            neighbors = (
                index - 1 if x else -1,
                index + 1 if x < width - 1 else -1,
                index - width if y else -1,
                index + width if y < height - 1 else -1,
            )
            for neighbor in neighbors:
                if neighbor < 0 or visited[neighbor]:
                    continue
                nx, ny = neighbor % width, neighbor // width
                if is_neutral_background(pixels[nx, ny]):
                    visited[neighbor] = 1
                    queue.append(neighbor)

        if touches_edge or len(queue) >= 150:
            for index in queue:
                x, y = index % width, index // width
                red, green, blue, _alpha = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)

    for _round in range(80):
        remove: list[tuple[int, int]] = []
        for y in range(1, height - 1):
            for x in range(1, width - 1):
                red, green, blue, alpha = pixels[x, y]
                if alpha == 0:
                    continue
                if min(red, green, blue) < 104 or max(red, green, blue) - min(red, green, blue) > 38:
                    continue
                if any(
                    pixels[nx, ny][3] == 0
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                ):
                    remove.append((x, y))
        if not remove:
            break
        for x, y in remove:
            pixels[x, y] = (0, 0, 0, 0)

    return rgba


def connected_components(image: Image.Image) -> list[list[int]]:
    width, height = image.size
    alpha = image.getchannel("A")
    alpha_pixels = alpha.load()
    visited = bytearray(width * height)
    components: list[list[int]] = []

    for y in range(height):
        for x in range(width):
            seed = y * width + x
            if visited[seed] or alpha_pixels[x, y] == 0:
                continue
            queue: deque[int] = deque([seed])
            visited[seed] = 1
            component: list[int] = []
            while queue:
                index = queue.popleft()
                component.append(index)
                px, py = index % width, index // width
                neighbors = (
                    index - 1 if px else -1,
                    index + 1 if px < width - 1 else -1,
                    index - width if py else -1,
                    index + width if py < height - 1 else -1,
                )
                for neighbor in neighbors:
                    if neighbor < 0 or visited[neighbor]:
                        continue
                    nx, ny = neighbor % width, neighbor // width
                    if alpha_pixels[nx, ny] != 0:
                        visited[neighbor] = 1
                        queue.append(neighbor)
            components.append(component)

    return components


def extract_four_characters(path: Path) -> list[Image.Image]:
    cleaned = remove_checkerboard(Image.open(path))
    width, height = cleaned.size
    components = sorted(connected_components(cleaned), key=len, reverse=True)[:4]
    if len(components) != 4:
        raise ValueError(f"{path.name}: expected four character components")

    extracted: list[tuple[int, Image.Image]] = []
    source_pixels = cleaned.load()
    for component in components:
        xs = [index % width for index in component]
        ys = [index // width for index in component]
        left, top, right, bottom = min(xs), min(ys), max(xs) + 1, max(ys) + 1
        sprite = Image.new("RGBA", (right - left, bottom - top))
        sprite_pixels = sprite.load()
        for index in component:
            x, y = index % width, index // width
            sprite_pixels[x - left, y - top] = source_pixels[x, y]
        extracted.append((left, sprite))

    return [sprite for _left, sprite in sorted(extracted, key=lambda entry: entry[0])]


def normalize_pose(sprite: Image.Image) -> Image.Image:
    scale = REVIEW_CHARACTER_HEIGHT / sprite.height
    width = round(sprite.width * scale)
    height = REVIEW_CHARACTER_HEIGHT
    if width > REVIEW_CELL[0] - 12:
        scale = (REVIEW_CELL[0] - 12) / sprite.width
        width = REVIEW_CELL[0] - 12
        height = round(sprite.height * scale)
    resized = sprite.resize((width, height), Image.Resampling.NEAREST)

    alpha = resized.getchannel("A")
    bottom_band_top = max(0, height - max(8, height // 12))
    bottom_band = alpha.crop((0, bottom_band_top, width, height))
    bottom_bbox = bottom_band.getbbox()
    anchor_in_sprite = width // 2
    if bottom_bbox:
        anchor_in_sprite = (bottom_bbox[0] + bottom_bbox[2]) // 2

    x = REVIEW_ANCHOR_X - anchor_in_sprite
    x = min(max(x, 0), REVIEW_CELL[0] - width)
    y = REVIEW_BASELINE_Y - height
    if y < 0:
        raise ValueError("Normalized pose exceeds the top of its cell")

    frame = Image.new("RGBA", REVIEW_CELL)
    frame.alpha_composite(resized, (x, y))
    if frame.getbbox() is None:
        raise ValueError("Normalized pose is empty")
    return frame


def force_binary_alpha(image: Image.Image) -> Image.Image:
    red, green, blue, alpha = image.convert("RGBA").split()
    alpha = alpha.point(lambda value: 255 if value >= 128 else 0)
    return Image.merge("RGBA", (red, green, blue, alpha))


def build_palette(frames: list[Image.Image]) -> Image.Image:
    strip = Image.new("RGB", (NATIVE_CELL[0] * len(frames), NATIVE_CELL[1]), "black")
    for index, frame in enumerate(frames):
        flattened = Image.new("RGB", NATIVE_CELL, "black")
        flattened.paste(frame.convert("RGB"), mask=frame.getchannel("A"))
        strip.paste(flattened, (index * NATIVE_CELL[0], 0))
    return strip.quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def palettize(frame: Image.Image, palette: Image.Image) -> Image.Image:
    flattened = Image.new("RGB", NATIVE_CELL, "black")
    flattened.paste(frame.convert("RGB"), mask=frame.getchannel("A"))
    indexed = flattened.quantize(palette=palette, dither=Image.Dither.NONE)
    indexed_palette = indexed.getpalette()
    indexed_palette[0:3] = [0, 0, 0]
    indexed.putpalette(indexed_palette)
    indexed.putdata(
        [
            0 if alpha == 0 else max(1, value)
            for value, alpha in zip(
                indexed.get_flattened_data(),
                frame.getchannel("A").get_flattened_data(),
                strict=True,
            )
        ]
    )
    indexed.info["transparency"] = 0
    return indexed


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    FRAME_DIR.mkdir(exist_ok=True)
    PUBLIC_RUNTIME_DIR.mkdir(parents=True, exist_ok=True)

    sources: dict[str, list[Image.Image]] = {}
    for pose in POSES:
        if "standalone" in pose:
            continue
        source_name = pose["source"]
        if source_name not in sources:
            sources[source_name] = extract_four_characters(REFERENCE_DIR / source_name)

    native_frames: list[Image.Image] = []
    frame_records: list[dict[str, object]] = []
    for index, pose in enumerate(POSES):
        if "standalone" in pose:
            standalone_path = Path(pose["standalone"])
            standalone = Image.open(standalone_path).convert("RGBA")
            source_bounds = standalone.getbbox()
            if source_bounds is None:
                raise ValueError("Typing-peek source is empty")
            source_sprite = standalone.crop(source_bounds)
            source_reference = str(standalone_path.relative_to(ROOT.parents[1]))
            source_frame = 0
        else:
            source_sprite = sources[pose["source"]][pose["sourceFrame"]]
            source_reference = f"references/{pose['source']}"
            source_frame = pose["sourceFrame"]
        review_frame = normalize_pose(source_sprite)
        native_frame = force_binary_alpha(
            review_frame.resize(NATIVE_CELL, Image.Resampling.NEAREST)
        )
        frame_path = FRAME_DIR / f"{index:02d}-{pose['id']}.png"
        native_frame.save(frame_path, format="PNG", optimize=False)
        native_frames.append(native_frame)
        frame_records.append(
            {
                "index": index,
                "id": pose["id"],
                "source": source_reference,
                "sourceFrame": source_frame,
                "frame": str(frame_path.relative_to(OUTPUT_DIR)),
                "frameSha256": sha256(frame_path),
                "nativeBounds": list(native_frame.getbbox() or (0, 0, 0, 0)),
            }
        )

    # The generated source varies shading and clothing slightly between its open-
    # and closed-eye figures. A blink must not make the whole character shimmer,
    # so preserve the idle frame byte-for-byte outside the closed-eye patch.
    blink_source = native_frames[1]
    blink_frame = native_frames[0].copy()
    blink_frame.paste(
        blink_source.crop(NATIVE_EYE_PATCH),
        NATIVE_EYE_PATCH[:2],
    )
    blink_path = FRAME_DIR / "01-blink.png"
    blink_frame.save(blink_path, format="PNG", optimize=False)
    native_frames[1] = blink_frame
    frame_records[1]["frameSha256"] = sha256(blink_path)
    frame_records[1]["nativeBounds"] = list(blink_frame.getbbox() or (0, 0, 0, 0))

    # The source sheets are independent generations. Preserve their useful
    # gesture changes, but never let an animation redraw Jolene's face.
    frame_index_by_id = {pose["id"]: index for index, pose in enumerate(POSES)}
    locked_frames: set[str] = set()

    def lock_face(anchor_id: str, target_ids: tuple[str, ...], patch: tuple[int, int, int, int]) -> None:
        face = native_frames[frame_index_by_id[anchor_id]].crop(patch)
        for frame_id in target_ids:
            native_frames[frame_index_by_id[frame_id]].paste(face, patch[:2])
            locked_frames.add(frame_id)

    lock_face("attentive", ("listen-1", "listen-2"), FACE_PATCH)
    lock_face("speak-1", ("speak-mouth", "speak-3"), UPPER_FACE_PATCH)
    lock_face("evidence", ("evidence-1", "evidence-2", "evidence-3"), FACE_PATCH)
    lock_face(
        "boundary-offline",
        ("boundary-1", "boundary-2", "offline-0", "offline-1", "offline-2"),
        FACE_PATCH,
    )

    for frame_id in locked_frames:
        index = frame_index_by_id[frame_id]
        frame_path = FRAME_DIR / f"{index:02d}-{frame_id}.png"
        native_frames[index].save(frame_path, format="PNG", optimize=False)
        frame_records[index]["frameSha256"] = sha256(frame_path)
        frame_records[index]["nativeBounds"] = list(native_frames[index].getbbox() or (0, 0, 0, 0))

    # Preserve the original eight cells' shared palette exactly. The appended
    # typing pose is quantized into that palette instead of changing prior art.
    palette = build_palette(native_frames[:8])
    indexed_frames = [palettize(frame, palette) for frame in native_frames]
    sheet = Image.new("P", (NATIVE_CELL[0] * len(indexed_frames), NATIVE_CELL[1]), 0)
    sheet.putpalette(indexed_frames[0].getpalette())
    for index, frame in enumerate(indexed_frames):
        sheet.paste(frame, (index * NATIVE_CELL[0], 0))
    sheet.info["transparency"] = 0

    png_path = OUTPUT_DIR / "jolene-v1-static-sheet.png"
    gif_path = OUTPUT_DIR / "jolene-v1-static-sheet.gif"
    sheet.save(png_path, format="PNG", transparency=0, optimize=False)
    sheet.save(gif_path, format="GIF", transparency=0, optimize=False)
    runtime_sheet_path = PUBLIC_RUNTIME_DIR / png_path.name
    sheet.save(runtime_sheet_path, format="PNG", transparency=0, optimize=False)
    runtime_fallback_path = PUBLIC_RUNTIME_DIR / "idle-fallback.png"
    indexed_frames[0].save(runtime_fallback_path, format="PNG", transparency=0, optimize=False)

    review_path = OUTPUT_DIR / "jolene-v1-static-sheet-review-4x.png"
    review_sheet = sheet.convert("RGBA").resize(
        (REVIEW_CELL[0] * len(indexed_frames), REVIEW_CELL[1]),
        Image.Resampling.NEAREST,
    )
    review_sheet.save(review_path, format="PNG")

    labeled_path = OUTPUT_DIR / "jolene-v1-static-sheet-labeled-review.png"
    labeled = Image.new(
        "RGBA",
        (REVIEW_CELL[0] * len(indexed_frames), REVIEW_CELL[1] + 40),
        "#0c100e",
    )
    labeled.alpha_composite(review_sheet)
    draw = ImageDraw.Draw(labeled)
    for index, pose in enumerate(POSES):
        draw.text(
            (index * REVIEW_CELL[0] + 12, REVIEW_CELL[1] + 12),
            f"{index}  {pose['id'].upper()}",
            fill="white",
        )
    labeled.save(labeled_path, format="PNG")

    blink_path = OUTPUT_DIR / "jolene-v1-idle-blink-preview.gif"
    blink_frames = [indexed_frames[0], indexed_frames[1], indexed_frames[0]]
    blink_frames[0].save(
        blink_path,
        save_all=True,
        append_images=blink_frames[1:],
        duration=[4200, 120, 650],
        loop=0,
        transparency=0,
        disposal=2,
        optimize=False,
    )

    for frame in native_frames:
        alpha_values = set(frame.getchannel("A").get_flattened_data())
        if alpha_values - {0, 255}:
            raise ValueError("A native frame contains non-binary alpha")
        left, top, right, bottom = frame.getbbox() or (0, 0, 0, 0)
        if left < 0 or top < 0 or right > NATIVE_CELL[0] or bottom > NATIVE_CELL[1]:
            raise ValueError("A native frame leaves its cell")

    with Image.open(blink_path) as blink:
        if blink.n_frames != 3:
            raise ValueError("Blink preview must contain idle, blink, idle")

    for y in range(NATIVE_CELL[1]):
        for x in range(NATIVE_CELL[0]):
            if NATIVE_EYE_PATCH[0] <= x < NATIVE_EYE_PATCH[2] and NATIVE_EYE_PATCH[1] <= y < NATIVE_EYE_PATCH[3]:
                continue
            if native_frames[0].getpixel((x, y)) != native_frames[1].getpixel((x, y)):
                raise ValueError("Blink changed pixels outside the eye patch")

    manifest = {
        "schemaVersion": "1.0.0",
        "status": "V1_LOCAL_RUNTIME_REVIEW",
        "runtimeIntegrated": True,
        "publicUseAuthorized": False,
        "nativeCell": {"width": NATIVE_CELL[0], "height": NATIVE_CELL[1]},
        "integerDisplaySizes": [
            {"scale": 3, "width": 315, "height": 345},
            {"scale": 4, "width": 420, "height": 460},
        ],
        "sheet": {
            "columns": len(indexed_frames),
            "rows": 1,
            "width": NATIVE_CELL[0] * len(indexed_frames),
            "height": NATIVE_CELL[1],
            "png": png_path.name,
            "pngSha256": sha256(png_path),
            "gif": gif_path.name,
            "gifSha256": sha256(gif_path),
            "review": review_path.name,
            "reviewSha256": sha256(review_path),
            "labeledReview": labeled_path.name,
            "labeledReviewSha256": sha256(labeled_path),
            "runtimePath": "/jolene/v1-static-sheet/jolene-v1-static-sheet.png",
            "runtimeSha256": sha256(runtime_sheet_path),
            "runtimeFallbackPath": "/jolene/v1-static-sheet/idle-fallback.png",
            "runtimeFallbackSha256": sha256(runtime_fallback_path),
        },
        "frames": frame_records,
        "appendOnlyCompatibility": {
            "preservedLeadingCellCount": 9,
            "preservedLeadingWidth": 945,
            "preservedLeadingRgbaSha256": "05d3a7e4cb29953dec80f6ca702216d74f652094f7a87862909bc84bff5c6070",
        },
        "signalToPose": SIGNAL_TO_POSE,
        "blink": {
            "onlyWhilePose": "idle",
            "runtimeIntervalMs": {"minimum": 4000, "maximum": 7000},
            "blinkDurationMs": 120,
            "sequence": ["idle", "blink", "idle"],
            "disabledForReducedMotion": True,
            "eyePatch": list(NATIVE_EYE_PATCH),
            "changesOutsideEyePatch": 0,
        },
        "invariants": {
            "singleStaticFramePerPose": False,
            "noPoseInterpolation": True,
            "noRuntimeRotationOrScaling": True,
            "binaryAlpha": True,
            "allCharacterPixelsInsideCell": True,
            "nearestNeighborOnly": True,
            "blinkPreservesIdleOutsideEyePatch": True,
            "animatedFacesLockedToStateAnchor": True,
        },
    }
    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Built {png_path.relative_to(ROOT)}")
    print(f"Built {gif_path.relative_to(ROOT)}")
    print(f"Built {blink_path.relative_to(ROOT)}")
    print(f"Built {runtime_sheet_path.relative_to(ROOT.parents[1])}")


if __name__ == "__main__":
    main()
