#!/usr/bin/env python3
"""Normalize 27 August 2021 Shift 2 figures and isolate graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-27AUG-S2"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER


def normalize(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    corner = image.crop((0, 0, min(24, image.width), min(24, image.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        image = ImageOps.invert(image)
    return ImageOps.grayscale(image).point(lambda value: 255 if value >= 205 else 0).convert("RGB")


def trim(image: Image.Image, padding: int = 12) -> Image.Image:
    box = ImageChops.difference(image, Image.new("RGB", image.size, "white")).getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    return image.crop((max(0, left-padding), max(0, top-padding), min(image.width, right+padding), min(image.height, bottom+padding)))


def save_crop(source: Image.Image, box, filename: str) -> None:
    trim(normalize(source.crop(box))).save(IMAGE_DIR / filename)


raw = {}
for source_path in IMAGE_DIR.glob("q*_raw.png"):
    number = int(source_path.stem.split("_")[0][1:])
    source = Image.open(source_path).convert("RGB")
    raw[number] = source
    trim(normalize(source)).save(IMAGE_DIR / f"q{number}.png")


def split(number: int, question_box, option_boxes) -> None:
    source = raw[number]
    if question_box is None:
        (IMAGE_DIR / f"q{number}.png").unlink(missing_ok=True)
    else:
        save_crop(source, question_box, f"q{number}.png")
    for letter, box in zip("abcd", option_boxes):
        save_crop(source, box, f"q{number}_opt_{letter}.png")


# Four structural choices only.
split(36, None, [
    (75, 0, 648, 190), (75, 195, 648, 395),
    (75, 405, 648, 610), (75, 620, 648, 828),
])

# Reaction scheme followed by four vertically stacked product choices.
split(40, (0, 0, 1270, 290), [
    (65, 295, 1270, 560), (65, 565, 1270, 840),
    (65, 875, 1270, 1120), (65, 1125, 1270, 1396),
])
split(41, (0, 0, 1251, 260), [
    (65, 265, 1251, 590), (65, 595, 1251, 880),
    (65, 900, 1251, 1135), (65, 1140, 1251, 1388),
])
split(44, (0, 0, 1250, 280), [
    (65, 285, 1250, 600), (65, 605, 1250, 835),
    (65, 840, 1250, 1020), (65, 1025, 1250, 1219),
])

# Each answer choice is a pair of labelled structures, so retain each full row.
split(50, (0, 0, 1250, 300), [
    (60, 305, 1250, 650), (60, 655, 1250, 1180),
    (60, 1185, 1250, 1650), (60, 1655, 1250, 2131),
])

print({"normalized_sources": len(raw), "graphical_option_questions": 5, "option_images": 20})
