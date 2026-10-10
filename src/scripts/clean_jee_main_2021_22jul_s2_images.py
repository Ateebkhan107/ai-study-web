#!/usr/bin/env python3
"""Normalize 22 July 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-22JUL-S2"
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


split(1, (720, 0, 1800, 410), [(0, 390, 1250, 755), (1210, 390, 2495, 755), (0, 720, 1250, 1111), (1210, 720, 2495, 1111)])
split(34, None, [(0, 0, 1238, 405), (1225, 0, 2475, 405), (0, 390, 1238, 809), (1225, 390, 2475, 809)])

source = originals["q35.png"]
(IMAGE_DIR / "q35.png").unlink(missing_ok=True)
trim(normalize(source)).save(IMAGE_DIR / "q35_opt_d.png")

split(48, None, [(120, 0, 2128, 435), (120, 410, 2128, 850), (120, 825, 2128, 1260), (120, 1235, 2128, 1679)])
split(49, None, [(100, 0, 2475, 370), (100, 345, 2475, 730), (100, 705, 2475, 1085), (100, 1060, 2475, 1443)])

print({"normalized_sources": len(originals), "graphical_option_questions": 5, "option_images": 21})
