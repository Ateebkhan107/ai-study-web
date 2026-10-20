#!/usr/bin/env python3
"""Normalize 17 March 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-17MAR-S2"
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

source = originals["q42.png"]
(IMAGE_DIR / "q42.png").unlink(missing_ok=True)
for letter, box in zip("abcd", [(65, 26, 610, 202), (680, 26, 1231, 202), (65, 245, 610, 435), (680, 245, 1231, 435)]):
    save_crop(source, box, f"q42_opt_{letter}.png")

source = originals["q46.png"]
save_crop(source, (0, 0, 939, 224), "q46.png")
for letter, box in zip("abcd", [(55, 224, 939, 466), (55, 492, 939, 722), (55, 738, 939, 978), (55, 993, 939, 1235)]):
    save_crop(source, box, f"q46_opt_{letter}.png")

print({"normalized_sources": len(originals), "graphical_option_questions": 2, "option_images": 8})
