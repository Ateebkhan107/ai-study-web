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
split(32, (0, 0, 1092, 911), [(80, 942, 1092, 1233), (80, 1250, 1092, 1539), (80, 1556, 1092, 1846), (80, 1863, 1092, 2063)])
split(33, (0, 0, 1451, 279), [(0, 293, 725, 687), (725, 293, 1451, 687), (0, 696, 725, 991), (725, 696, 1451, 991)])
split(45, (0, 0, 1659, 495), [(180, 526, 1659, 840), (180, 880, 1659, 1057), (180, 1079, 1659, 1257), (180, 1280, 1659, 1457)])
split(46, (0, 0, 1638, 249), [(0, 280, 819, 613), (819, 280, 1638, 613), (0, 635, 819, 843), (819, 635, 1638, 843)])

print({"normalized_sources": len(originals), "graphical_option_questions": 6, "option_images": 24})
