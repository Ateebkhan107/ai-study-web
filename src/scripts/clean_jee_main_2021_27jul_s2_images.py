#!/usr/bin/env python3
"""Normalize 27 July 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-27JUL-S2"
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

# Jarvis omitted this diagram, so recover the diagram-only region from the source PDF page.
page = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "physics/pages/page-3.png").convert("RGB")
save_crop(page, (1080, 390, 1900, 835), "q15.png")


def split(number: int, question_box, option_boxes) -> None:
    source = originals[f"q{number}.png"]
    if question_box is None:
        (IMAGE_DIR / f"q{number}.png").unlink(missing_ok=True)
    else:
        save_crop(source, question_box, f"q{number}.png")
    for letter, box in zip("abcd", option_boxes):
        save_crop(source, box, f"q{number}_opt_{letter}.png")


split(2, None, [(0, 0, 1022, 459), (1022, 0, 2043, 459), (0, 459, 1022, 917), (1022, 459, 2043, 917)])
split(11, (0, 0, 804, 206), [(150, 317, 650, 605), (150, 660, 650, 946), (150, 1000, 650, 1337), (150, 1391, 650, 1726)])
split(12, (430, 0, 1630, 314), [(0, 440, 1032, 833), (1032, 440, 2063, 833), (0, 844, 1032, 1190), (1032, 844, 2063, 1190)])
split(32, (200, 0, 1450, 270), [(0, 245, 823, 545), (823, 245, 1646, 545), (0, 530, 823, 872), (823, 530, 1646, 872)])
split(48, (100, 0, 1510, 500), [(0, 490, 813, 765), (813, 490, 1625, 765), (0, 755, 813, 1118), (813, 755, 1625, 1118)])

print({"normalized_sources": len(originals), "recovered_diagrams": 1, "graphical_option_questions": 5, "option_images": 20})
