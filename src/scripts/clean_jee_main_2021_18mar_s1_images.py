#!/usr/bin/env python3
"""Normalize 18 March 2021 Shift 1 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-18MAR-S1"
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


split(14, None, [(55, 0, 1250, 315), (55, 300, 1250, 630), (55, 615, 1250, 945), (55, 930, 1250, 1252)])
split(31, (0, 0, 1035, 326), [(55, 338, 1035, 650), (55, 681, 1035, 906), (55, 921, 1035, 1147), (55, 1163, 1035, 1471)])
split(33, None, [(45, 24, 475, 404), (500, 24, 947, 404), (45, 432, 475, 749), (500, 432, 947, 749)])
split(37, (0, 0, 947, 226), [(45, 241, 947, 413), (45, 429, 947, 602), (45, 617, 947, 789), (45, 804, 947, 1053)])
split(43, None, [(55, 0, 1230, 304), (55, 304, 1230, 609), (55, 609, 1230, 913), (55, 913, 1230, 1218)])
split(45, (0, 0, 947, 307), [(35, 322, 475, 619), (500, 322, 947, 619), (35, 634, 475, 950), (500, 634, 947, 950)])

print({"normalized_sources": len(originals), "graphical_option_questions": 6, "option_images": 24})
