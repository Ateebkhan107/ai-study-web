#!/usr/bin/env python3
"""Create clean visual assets for JEE Main 17 March 2021 Shift 1."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-17MAR-S1"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER
LOCAL = ROOT / "scratch/jee2021/local" / PAPER


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


split(32, None, [(65, 0, 615, 190), (680, 0, 1235, 190), (65, 175, 615, 367), (680, 175, 1235, 367)])
split(33, (0, 0, 1251, 243), [(65, 243, 1251, 454), (65, 516, 1251, 732), (65, 800, 1251, 1065), (65, 1130, 1251, 1385)])
split(36, None, [(70, 20, 1235, 365), (70, 403, 1235, 672), (70, 712, 1235, 1056), (70, 1094, 1235, 1369)])
split(41, None, [(70, 36, 1235, 307), (70, 362, 1235, 558), (70, 607, 1235, 803), (70, 861, 1235, 1157)])

# Missing Chemistry Q14: reaction scheme plus four structural options.
page3 = Image.open(LOCAL / "chemistry/pages/page-3.png").convert("RGB")
save_crop(page3, (1120, 900, 1680, 1115), "q44.png")
for letter, box in zip("abcd", [(1200, 1120, 1640, 1370), (1200, 1340, 1640, 1585), (1200, 1560, 1640, 1810), (1200, 1780, 1640, 2015)]):
    save_crop(page3, box, f"q44_opt_{letter}.png")

# Missing Chemistry Q20: only the Ellingham diagram belongs in the image.
page5 = Image.open(LOCAL / "chemistry/pages/page-5.png").convert("RGB")
save_crop(page5, (245, 450, 960, 1125), "q50.png")

print({"normalized_sources": len(originals), "graphical_option_questions": 5, "option_images": 20})
