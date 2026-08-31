#!/usr/bin/env python3
"""Reject reaction animation frames that redraw Jolene's face."""

from pathlib import Path

from PIL import Image


FRAME_DIR = Path(__file__).resolve().parents[1] / "art-source" / "jolene-four-frame-reactions" / "v1-static-sheet" / "frames-105x115"
FACE_PATCH = (38, 18, 73, 52)
UPPER_FACE_PATCH = (38, 18, 73, 41)


def rgba(name: str) -> Image.Image:
    return Image.open(FRAME_DIR / name).convert("RGBA")


def assert_patch_matches(anchor_name: str, frame_names: tuple[str, ...], patch: tuple[int, int, int, int]) -> None:
    expected = rgba(anchor_name).crop(patch).tobytes()
    for frame_name in frame_names:
        actual = rgba(frame_name).crop(patch).tobytes()
        assert actual == expected, f"{frame_name} redraws the face locked by {anchor_name}"


assert_patch_matches("03-attentive.png", ("09-listen-1.png", "10-listen-2.png"), FACE_PATCH)
assert_patch_matches("11-speak-1.png", ("12-speak-mouth.png", "13-speak-3.png"), UPPER_FACE_PATCH)
assert_patch_matches("05-evidence.png", ("14-evidence-1.png", "15-evidence-2.png", "16-evidence-3.png"), FACE_PATCH)
assert_patch_matches(
    "06-boundary-offline.png",
    ("17-boundary-1.png", "18-boundary-2.png", "19-offline-0.png", "20-offline-1.png", "21-offline-2.png"),
    FACE_PATCH,
)

for frame_path in sorted(FRAME_DIR.glob("*.png")):
    alpha_values = set(rgba(frame_path.name).getchannel("A").get_flattened_data())
    assert not alpha_values - {0, 255}, f"{frame_path.name} contains non-binary alpha"

print("Jolene face consistency passed: animated reactions preserve their locked face; only the speaking mouth changes.")
