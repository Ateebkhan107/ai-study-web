#!/usr/bin/env python3
"""Normalize 26 August 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-26AUG-S2"
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


referenced = [5, 9, 10, 12, 16, 18, 20, 28, 29, 30, 31, 37, 39, 45, 49, 50, 75, 77]
originals = {f"q{n}.png": Image.open(IMAGE_DIR / f"q{n}.png").convert("RGB") for n in referenced}
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


split(12, None, [(0, 0, 710, 490), (0, 485, 710, 975), (0, 970, 710, 1460), (0, 1450, 710, 1949)])
split(31, None, [(0, 0, 315, 238), (0, 230, 315, 475), (0, 465, 315, 710), (0, 700, 315, 944)])
split(39, (0, 0, 942, 330), [(0, 305, 471, 665), (471, 305, 942, 665), (0, 640, 471, 1000), (471, 640, 942, 1000)])
split(49, (0, 0, 821, 420), [(0, 400, 821, 610), (0, 590, 821, 810), (0, 790, 821, 1010), (0, 990, 821, 1202)])
split(50, (0, 0, 928, 300), [(0, 280, 464, 600), (464, 280, 928, 600), (0, 575, 464, 878), (464, 575, 928, 878)])

# Jarvis omitted Chemistry Q17; recover its four structural choices from the paper page.
page4 = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "chemistry/pages/page-4.png").convert("RGB")
for letter, box in zip("abcd", [(180, 1600, 430, 1900), (430, 1600, 700, 1900), (180, 1880, 430, 2180), (430, 1880, 700, 2180)]):
    save_crop(page4, box, f"q47_opt_{letter}.png")

print({"normalized_sources": len(originals), "recovered_option_questions": 1, "graphical_option_questions": 6, "option_images": 24})
