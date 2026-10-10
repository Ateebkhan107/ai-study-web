#!/usr/bin/env python3
"""Normalize 20 July 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-20JUL-S2"
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


originals = {p.name: Image.open(p).convert("RGB") for p in IMAGE_DIR.glob("q*.png") if "_opt_" not in p.name}
for name, image in originals.items():
    trim(normalize(image)).save(IMAGE_DIR / name)


def split(number: int, question_box, option_boxes) -> None:
    source = originals[f"q{number}.png"]
    if question_box is None:
        (IMAGE_DIR / f"q{number}.png").unlink(missing_ok=True)
    else:
        save_crop(source, question_box, f"q{number}.png")
    for letter, box in zip("abcd", option_boxes):
        save_crop(source, box, f"q{number}_opt_{letter}.png")


split(8, None, [(0, 0, 725, 358), (715, 0, 1449, 358), (0, 348, 725, 716), (715, 348, 1449, 716)])
split(31, None, [(80, 0, 1135, 270), (80, 250, 1135, 520), (80, 500, 1135, 775), (80, 750, 1135, 1022)])
split(32, (0, 0, 1092, 900), [(80, 880, 1092, 1210), (80, 1180, 1092, 1515), (80, 1490, 1092, 1830), (80, 1800, 1092, 2103)])
split(33, (0, 0, 1451, 445), [(0, 420, 725, 725), (715, 420, 1451, 725), (0, 700, 725, 1000), (715, 700, 1451, 1000)])
split(45, (0, 0, 1659, 510), [(180, 490, 1659, 820), (180, 790, 1659, 1040), (180, 1010, 1659, 1260), (180, 1230, 1659, 1476)])
split(46, (0, 0, 1638, 320), [(0, 300, 819, 600), (810, 300, 1638, 600), (0, 575, 819, 862), (810, 575, 1638, 862)])

print({"normalized_sources": len(originals), "graphical_option_questions": 6, "option_images": 24})
