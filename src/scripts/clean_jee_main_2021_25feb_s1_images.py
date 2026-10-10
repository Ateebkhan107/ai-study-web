#!/usr/bin/env python3
"""Normalize 25 Feb Shift 1 figures and split the two graphical option sets."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-25FEB-S1"
IMAGE_DIR = ROOT / "scratch" / "jee2021" / "images" / PAPER
TRANSCRIBED = ROOT / "scratch" / "jee2021" / "transcribed"


def white_normalize(image: Image.Image) -> Image.Image:
    image = ImageOps.invert(image.convert("RGB"))
    # Make the near-white background exactly white and darken faint strokes.
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b = pixels[x, y]
            if min(r, g, b) >= 242:
                pixels[x, y] = (255, 255, 255)
            elif max(r, g, b) <= 28:
                pixels[x, y] = (0, 0, 0)
    return image


def content_trim(image: Image.Image, padding: int = 12) -> Image.Image:
    background = Image.new("RGB", image.size, "white")
    box = ImageChops.difference(image, background).getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    return image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))


originals = {path.name: Image.open(path).convert("RGB") for path in IMAGE_DIR.glob("q*.png") if "_opt_" not in path.name}

for name, image in originals.items():
    white_normalize(image).save(IMAGE_DIR / name)

# Q35: reaction across the top, four independent structures across the bottom.
q35 = originals["q35.png"]
content_trim(white_normalize(q35.crop((0, 0, q35.width, 300)))).save(IMAGE_DIR / "q35.png")
for letter, box in zip("abcd", [(160, 335, 600, 536), (650, 335, 1100, 536), (1100, 335, 1600, 536), (1620, 335, 2440, 536)]):
    content_trim(white_normalize(q35.crop(box))).save(IMAGE_DIR / f"q35_opt_{letter}.png")

# Q48: reaction at the top, followed by four horizontal A/B structure pairs.
q48 = originals["q48.png"]
content_trim(white_normalize(q48.crop((120, 0, 1500, 270)))).save(IMAGE_DIR / "q48.png")
rows = [(310, 700), (700, 1090), (1090, 1480), (1480, 1843)]
for letter, (top, bottom) in zip("abcd", rows):
    content_trim(white_normalize(q48.crop((150, top, 1250, bottom)))).save(IMAGE_DIR / f"q48_opt_{letter}.png")

chemistry_path = TRANSCRIBED / f"{PAPER}_Chemistry.json"
rows = json.loads(chemistry_path.read_text(encoding="utf-8"))
for number in (35, 48):
    row = next(item for item in rows if item["question_number"] == number)
    for letter in "abcd":
        row[f"option_{letter}"] = ""
        row[f"option_{letter}_needs_image"] = True
        row[f"option_{letter}_image"] = str(IMAGE_DIR / f"q{number}_opt_{letter}.png")
chemistry_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(json.dumps({"normalized": len(originals), "option_images": 8}))
