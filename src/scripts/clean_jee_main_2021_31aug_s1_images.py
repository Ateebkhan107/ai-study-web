#!/usr/bin/env python3
"""Normalize 31 August 2021 Shift 1 figures and isolate graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-31AUG-S1"
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


# Two-by-two graph choice grids.
split(6, None, [(35, 0, 600, 370), (630, 0, 1231, 370), (35, 375, 600, 747), (630, 375, 1231, 747)])
split(32, None, [(35, 0, 600, 310), (630, 0, 1231, 310), (35, 315, 600, 629), (630, 315, 1231, 629)])
split(46, None, [(35, 0, 600, 325), (630, 0, 1231, 325), (35, 330, 600, 656), (630, 330, 1231, 656)])

# Four vertically stacked structural/order choices.
split(31, None, [(0, 0, 991, 285), (0, 290, 991, 580), (0, 585, 991, 875), (0, 880, 991, 1173)])
split(50, None, [(330, 0, 1255, 285), (330, 285, 1255, 580), (330, 580, 1255, 875), (210, 875, 1255, 1152)])

# Reaction schemes followed by paired/structural answer choices.
split(36, (0, 0, 1234, 205), [(55, 210, 1234, 415), (55, 420, 1234, 625), (55, 630, 1234, 835), (55, 840, 1234, 1045)])
split(39, (0, 0, 1255, 250), [(55, 255, 1255, 480), (55, 485, 1255, 720), (55, 725, 1255, 930), (55, 935, 1255, 1202)])

# Jarvis omitted Physics Q11; recover its circuit and four waveform choices.
page4 = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "physics/pages/page-04.png").convert("RGB")
save_crop(page4, (210, 1630, 850, 1930), "q11.png")
for letter, box in zip("abcd", [
    (260, 1940, 840, 2220), (260, 2240, 840, 2530),
    (1160, 180, 1850, 500), (1160, 500, 1850, 820),
]):
    save_crop(page4, box, f"q11_opt_{letter}.png")

print({"normalized_sources": len(raw), "graphical_option_questions": 8, "option_images": 32})
