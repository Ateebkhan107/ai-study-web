#!/usr/bin/env python3
"""Normalize 26 August 2021 Shift 1 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-26AUG-S1"
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

page1 = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "physics/pages/page-1.png").convert("RGB")
save_crop(page1, (1250, 430, 1725, 850), "q2.png")

page4 = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "physics/pages/page-4.png").convert("RGB")
save_crop(page4, (1280, 560, 1780, 900), "q13.png")
for letter, box in zip("abcd", [(1210, 900, 1780, 1200), (1210, 1200, 1780, 1490), (1210, 1490, 1780, 1770), (1210, 1770, 1780, 2070)]):
    save_crop(page4, box, f"q13_opt_{letter}.png")


def split(number: int, question_box, option_boxes) -> None:
    source = originals[f"q{number}.png"]
    save_crop(source, question_box, f"q{number}.png")
    for letter, box in zip("abcd", option_boxes):
        save_crop(source, box, f"q{number}_opt_{letter}.png")


split(34, (100, 0, 900, 290), [(80, 270, 920, 535), (0, 515, 994, 805), (70, 785, 930, 1070), (70, 1045, 930, 1361)])
split(35, (130, 0, 1150, 275), [(180, 255, 1050, 545), (180, 525, 1100, 830), (180, 805, 1080, 1110), (180, 1080, 1080, 1382)])
split(36, (160, 0, 1100, 180), [(0, 165, 625, 365), (625, 165, 1250, 365), (0, 385, 625, 578), (625, 385, 1250, 578)])
split(39, (220, 0, 1100, 300), [(140, 280, 1110, 600), (140, 625, 1110, 930), (140, 970, 1110, 1270), (140, 1310, 1110, 1625)])

print({"normalized_sources": len(originals), "recovered_diagrams": 2, "graphical_option_questions": 5, "option_images": 20})
