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
split(31, (0, 0, 1035, 285), [(55, 275, 1035, 590), (55, 575, 1035, 885), (55, 870, 1035, 1180), (55, 1160, 1035, 1483)])
split(33, None, [(45, 0, 475, 380), (500, 0, 947, 380), (45, 365, 475, 749), (500, 365, 947, 749)])
split(37, (0, 0, 947, 255), [(45, 245, 947, 470), (45, 455, 947, 675), (45, 660, 947, 875), (45, 860, 947, 1065)])
split(43, None, [(55, 0, 1250, 305), (55, 295, 1250, 615), (55, 600, 1250, 925), (55, 910, 1250, 1218)])
split(45, (0, 0, 947, 280), [(35, 270, 475, 625), (500, 270, 947, 625), (35, 610, 475, 962), (500, 610, 947, 962)])

print({"normalized_sources": len(originals), "graphical_option_questions": 6, "option_images": 24})
