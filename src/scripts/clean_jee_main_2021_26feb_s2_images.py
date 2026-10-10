#!/usr/bin/env python3
"""Normalize 26 February Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-26FEB-S2"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER


def normalize(image: Image.Image) -> Image.Image:
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


def trim(image: Image.Image, padding: int = 12) -> Image.Image:
    box = ImageChops.difference(image, Image.new("RGB", image.size, "white")).getbbox()
    if not box:
        return image
    l, t, r, b = box
    return image.crop((max(0, l-padding), max(0, t-padding), min(image.width, r+padding), min(image.height, b+padding)))


originals = {p.name: Image.open(p).convert("RGB") for p in IMAGE_DIR.glob("q*.png") if "_opt_" not in p.name}
for name, image in originals.items():
    trim(normalize(image)).save(IMAGE_DIR / name)


def split(number, boxes, question_box):
    source = originals[f"q{number}.png"]
    trim(normalize(source.crop(question_box))).save(IMAGE_DIR / f"q{number}.png")
    for letter, box in zip("abcd", boxes):
        trim(normalize(source.crop(box))).save(IMAGE_DIR / f"q{number}_opt_{letter}.png")


split(15, [(0, 327, 650, 505), (0, 510, 650, 688), (0, 689, 650, 866), (0, 866, 650, 1056)], (0, 0, 1235, 326))
split(41, [(250, 190, 1100, 470), (1100, 190, 1950, 470), (250, 470, 1100, 671), (1100, 470, 1950, 671)], (250, 0, 1900, 180))
split(42, [(250, 250, 1100, 550), (1100, 250, 1950, 550), (250, 570, 1100, 792), (1100, 570, 1950, 792)], (250, 0, 1900, 220))
split(45, [(0, 175, 280, 350), (280, 175, 560, 350), (560, 175, 840, 350), (840, 175, 1123, 350)], (0, 0, 1123, 170))
split(47, [(250, 400, 1100, 740), (1100, 400, 1950, 740), (250, 750, 1100, 1089), (1100, 750, 1950, 1089)], (250, 0, 1950, 330))

print({"normalized": len(originals), "graphical_option_questions": 5, "option_images": 20})
