#!/usr/bin/env python3
"""Normalize 25 July 2021 Shift 1 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-25JUL-S1"
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


split(33, (650, 0, 1850, 193), [(0, 229, 1245, 404), (1245, 229, 2495, 404), (0, 417, 1245, 602), (1245, 417, 2495, 602)])
split(37, (520, 0, 1975, 248), [(0, 281, 1245, 535), (1245, 281, 2495, 535), (0, 544, 1245, 774), (1245, 544, 2495, 774)])
split(41, None, [(0, 0, 830, 385), (820, 0, 1657, 385), (0, 375, 830, 756), (820, 375, 1657, 756)])
split(44, None, [(0, 0, 736, 255), (725, 0, 1472, 255), (0, 245, 736, 503), (725, 245, 1472, 503)])

print({"normalized_sources": len(originals), "graphical_option_questions": 4, "option_images": 16})
