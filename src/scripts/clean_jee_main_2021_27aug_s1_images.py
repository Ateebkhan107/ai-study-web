#!/usr/bin/env python3
"""Normalize 27 August 2021 Shift 1 figures and isolate graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-27AUG-S1"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER


def normalize(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    corner = image.crop((0, 0, min(24, image.width), min(24, image.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        image = ImageOps.invert(image)
    # Suppress pale compression noise and translucent source watermarks.
    return ImageOps.grayscale(image).point(lambda value: 255 if value >= 205 else 0).convert("RGB")


def trim(image: Image.Image, padding: int = 12) -> Image.Image:
    box = ImageChops.difference(image, Image.new("RGB", image.size, "white")).getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    return image.crop((max(0, left-padding), max(0, top-padding), min(image.width, right+padding), min(image.height, bottom+padding)))


def save_crop(source: Image.Image, box, filename: str) -> None:
    trim(normalize(source.crop(box))).save(IMAGE_DIR / filename)


raw = {}
for source_path in IMAGE_DIR.glob("q*_raw.png"):
    number = int(source_path.stem.split("_")[0][1:])
    source = Image.open(source_path).convert("RGB")
    raw[number] = source
    trim(normalize(source)).save(IMAGE_DIR / f"q{number}.png")


def split(number: int, question_box, option_boxes) -> None:
    source = raw[number]
    if question_box is None:
        (IMAGE_DIR / f"q{number}.png").unlink(missing_ok=True)
    else:
        save_crop(source, question_box, f"q{number}.png")
    for letter, box in zip("abcd", option_boxes):
        save_crop(source, box, f"q{number}_opt_{letter}.png")


# SHM graph followed by four graphical alternatives.
split(20, (0, 0, 814, 290), [
    (55, 270, 814, 565), (55, 545, 814, 850),
    (55, 830, 814, 1140), (55, 1120, 814, 1429),
])

# Organic reaction followed by a 2x2 choice grid.
split(32, (0, 0, 953, 215), [
    (75, 230, 475, 465), (530, 230, 953, 465),
    (75, 440, 475, 653), (530, 440, 953, 653),
])

# Four vertical uracil tautomers; no separate question diagram.
split(45, None, [
    (100, 0, 358, 330), (100, 315, 358, 655),
    (100, 640, 358, 985), (100, 970, 358, 1302),
])

# Grignard reaction and four vertical structural alternatives.
split(47, (0, 0, 1170, 150), [
    (250, 155, 1170, 300), (250, 300, 1170, 445),
    (250, 445, 1170, 585), (250, 585, 1170, 709),
])

# Recover the two Jarvis omissions from the cleanest available source pages.
local = ROOT / "scratch/jee2021/local" / PAPER / "physics/pages"
page2 = Image.open(local / "page-2.png").convert("RGB")
save_crop(page2, (210, 1040, 830, 1515), "q5.png")

page4 = Image.open(local / "page-4.png").convert("RGB")
save_crop(page4, (220, 450, 825, 700), "q14.png")
for letter, box in zip("abcd", [
    (280, 690, 790, 1015), (280, 995, 790, 1320),
    (280, 1300, 790, 1650), (280, 1630, 790, 1990),
]):
    save_crop(page4, box, f"q14_opt_{letter}.png")

print({"normalized_sources": len(raw), "graphical_option_questions": 5, "option_images": 20})
