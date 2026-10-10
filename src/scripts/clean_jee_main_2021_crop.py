"""Remove light coaching watermarks and normalize a diagram crop to pure white."""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np


def clean(source: Path, destination: Path) -> None:
    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Could not read {source}")

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Coaching marks are pale coloured shapes. Remove only high-value coloured
    # pixels; legitimate dark coloured lines are retained and converted to ink.
    pale_colour = (hsv[:, :, 2] >= 178) & (hsv[:, :, 1] >= 12)
    near_white = gray >= 238
    normalized = gray.copy()
    normalized[pale_colour | near_white] = 255
    normalized[normalized < 72] = 0

    # Remove isolated compression specks without eroding diagram lines.
    ink = (normalized < 232).astype(np.uint8) * 255
    components, labels, stats, _ = cv2.connectedComponentsWithStats(ink, 8)
    for label in range(1, components):
        if stats[label, cv2.CC_STAT_AREA] <= 3:
            normalized[labels == label] = 255

    ys, xs = np.where(normalized < 245)
    if len(xs):
        pad = 12
        left, right = max(0, int(xs.min()) - pad), min(normalized.shape[1], int(xs.max()) + pad + 1)
        top, bottom = max(0, int(ys.min()) - pad), min(normalized.shape[0], int(ys.max()) + pad + 1)
        normalized = normalized[top:bottom, left:right]

    destination.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(destination), normalized, [cv2.IMWRITE_PNG_COMPRESSION, 9]):
        raise RuntimeError(f"Could not write {destination}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: clean_jee_main_2021_crop.py SOURCE DESTINATION")
    clean(Path(sys.argv[1]), Path(sys.argv[2]))
