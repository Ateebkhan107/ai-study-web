#!/usr/bin/env python3
"""Normalize 26 February Shift 1 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-26FEB-S1"
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


def split(number, boxes, question_box=None):
    source = originals[f"q{number}.png"]
    if question_box:
        trim(normalize(source.crop(question_box))).save(IMAGE_DIR / f"q{number}.png")
    for letter, box in zip("abcd", boxes):
        trim(normalize(source.crop(box))).save(IMAGE_DIR / f"q{number}_opt_{letter}.png")


split(31, [(220, 0, 800, 280), (1000, 0, 1950, 280), (220, 260, 900, 598), (980, 280, 2250, 598)])
split(39, [(200, 250, 1200, 590), (200, 600, 1200, 860), (200, 910, 1200, 1190), (200, 1200, 1200, 1554)], (200, 0, 1600, 240))
split(41, [(180, 280, 760, 625), (920, 280, 1600, 625), (180, 630, 760, 956), (920, 630, 1600, 956)], (180, 0, 1200, 225))
split(49, [(0, 120, 400, 245), (480, 120, 800, 260), (0, 245, 400, 443), (480, 300, 900, 443)], (0, 0, 850, 120))
split(50, [(0, 0, 560, 80), (560, 0, 1150, 80), (0, 80, 560, 201), (560, 80, 1150, 201)])

print({"normalized": len(originals), "graphical_option_questions": 5, "option_images": 20})
