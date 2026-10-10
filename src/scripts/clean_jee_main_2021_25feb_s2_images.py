#!/usr/bin/env python3
"""Normalize Shift 2 diagrams and split graphical answer choices."""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-25FEB-S2"
IMAGE_DIR = ROOT / "scratch" / "jee2021" / "images" / PAPER
TRANSCRIBED = ROOT / "scratch" / "jee2021" / "transcribed"


def normalize_dark(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    corner = image.crop((0, 0, min(20, image.width), min(20, image.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        image = ImageOps.invert(image)
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b = pixels[x, y]
            if min(r, g, b) >= 242:
                pixels[x, y] = (255, 255, 255)
            elif max(r, g, b) <= 28:
                pixels[x, y] = (0, 0, 0)
    return image


def normalize_scan(image: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(image)
    # Removes the pale diagonal coaching watermark while retaining printed ink.
    gray = gray.point(lambda value: 255 if value >= 185 else 0)
    return gray.convert("RGB")


def trim(image: Image.Image, padding: int = 12) -> Image.Image:
    box = ImageChops.difference(image, Image.new("RGB", image.size, "white")).getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    return image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))


originals = {p.name: Image.open(p).convert("RGB") for p in IMAGE_DIR.glob("q*.png") if "_opt_" not in p.name}
for name, image in originals.items():
    normalize_dark(image).save(IMAGE_DIR / name)


def save_options(number: int, image: Image.Image, boxes, question_box=None):
    if question_box:
        trim(normalize_dark(image.crop(question_box))).save(IMAGE_DIR / f"q{number}.png")
    for letter, box in zip("abcd", boxes):
        trim(normalize_dark(image.crop(box))).save(IMAGE_DIR / f"q{number}_opt_{letter}.png")


# Chemistry graphical option sets.
save_options(32, originals["q32.png"], [(20, 0, 270, 245), (275, 0, 510, 245), (525, 0, 780, 245), (785, 0, 1030, 245)])
save_options(33, originals["q33.png"], [(0, 0, 1500, 353), (0, 353, 1500, 706), (0, 706, 1500, 1059), (0, 1059, 1500, 1412)])
save_options(38, originals["q38.png"], [(0, 280, 1500, 570), (0, 580, 1500, 845), (0, 855, 1500, 1110), (0, 1115, 1500, 1330)], (0, 0, 1500, 250))
save_options(49, originals["q49.png"], [(250, 190, 530, 558), (600, 190, 890, 558), (1020, 190, 1300, 558), (1380, 190, 1600, 558)], (250, 0, 1250, 190))

# The missing logic-circuit card comes directly from the source PDF. Split the
# circuit and four truth tables, then aggressively remove its pale watermark.
logic = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "physics/crops/q17.png").convert("RGB")
trim(normalize_scan(logic.crop((180, 45, 970, 315)))).save(IMAGE_DIR / "q17.png")
logic_boxes = [(285, 315, 610, 545), (285, 585, 610, 830), (285, 865, 610, 1110), (285, 1145, 610, 1405)]
for letter, box in zip("abcd", logic_boxes):
    trim(normalize_scan(logic.crop(box))).save(IMAGE_DIR / f"q17_opt_{letter}.png")

for subject in ("Physics", "Chemistry", "Mathematics"):
    source = TRANSCRIBED / f"{PAPER}_{subject}.json"
    rows = json.loads(source.read_text(encoding="utf-8"))
    for row in rows:
        number = row["question_number"]
        if number in (17, 32, 33, 38, 49):
            if number in (32, 33):
                row["question_image"] = None
                row["needs_question_image"] = False
            for letter in "abcd":
                row[f"option_{letter}"] = ""
                row[f"option_{letter}_needs_image"] = True
                row[f"option_{letter}_image"] = str(IMAGE_DIR / f"q{number}_opt_{letter}.png")
        for letter in "abcd":
            value = row[f"option_{letter}"].strip()
            if value and re.fullmatch(r"(?:[A-Da-d]|[+\-–]?\d+(?:\.\d+)?)", value):
                row[f"option_{letter}"] = f"${value.replace('–', '-')} $".replace(" $", "$")
    source.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(json.dumps({"normalized": len(originals), "graphical_option_questions": 5, "option_images": 20}))
