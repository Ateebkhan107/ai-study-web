#!/usr/bin/env python3
"""Normalize 25 July 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-25JUL-S2"
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


split(38, (350, 0, 1810, 350), [(0, 320, 1085, 705), (1070, 320, 2168, 705), (0, 680, 1085, 1062), (1070, 680, 2168, 1062)])
split(41, None, [(0, 0, 896, 481), (885, 0, 1792, 481), (0, 470, 896, 962), (885, 470, 1792, 962)])
split(46, (250, 0, 1600, 206), [(0, 237, 1858, 472), (0, 493, 1858, 704), (0, 725, 1858, 936), (0, 957, 1858, 1169)])
split(48, (120, 0, 1850, 345), [(0, 320, 990, 610), (980, 320, 1980, 610), (0, 590, 990, 888), (980, 590, 1980, 888)])

source = originals["q50.png"]
(IMAGE_DIR / "q50.png").unlink(missing_ok=True)
save_crop(source, (820, 0, 1656, 210), "q50_opt_b.png")
save_crop(source, (0, 195, 828, 406), "q50_opt_c.png")
save_crop(source, (820, 195, 1656, 406), "q50_opt_d.png")

print({"normalized_sources": len(originals), "graphical_option_questions": 5, "option_images": 19})
