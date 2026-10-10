#!/usr/bin/env python3
"""Normalize 18 March 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-18MAR-S2"
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


split(7, (0, 0, 1251, 320), [(60, 310, 625, 745), (665, 310, 1251, 745), (60, 720, 625, 1173), (665, 720, 1251, 1173)])
split(17, None, [(50, 0, 615, 375), (665, 0, 1231, 375), (50, 360, 615, 738), (665, 360, 1231, 738)])
split(35, None, [(55, 0, 1231, 245), (55, 235, 1231, 490), (55, 480, 1231, 735), (55, 725, 1231, 965)])
split(44, (0, 0, 1251, 270), [(55, 260, 1251, 555), (55, 545, 1251, 840), (55, 830, 1251, 1125), (55, 1110, 1251, 1389)])

print({"normalized_sources": len(originals), "graphical_option_questions": 4, "option_images": 16})
