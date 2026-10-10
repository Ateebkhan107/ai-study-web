#!/usr/bin/env python3
"""Normalize 16 March 2021 Shift 2 diagrams and split graphical choices."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-16MAR-S2"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER


def normalize(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    corner = image.crop((0, 0, min(24, image.width), min(24, image.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        image = ImageOps.invert(image)
    image = ImageOps.grayscale(image).point(lambda value: 255 if value >= 205 else 0)
    return image.convert("RGB")


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

# Chemistry Q13: all four choices are condensed structural formulae.
source = originals["q43.png"]
(IMAGE_DIR / "q43.png").unlink(missing_ok=True)
for letter, box in zip("abcd", [(45, 0, 742, 115), (45, 105, 742, 255), (45, 245, 742, 350), (45, 340, 742, 454)]):
    save_crop(source, box, f"q43_opt_{letter}.png")

# Chemistry Q20: retain the reaction scheme above the prompt and split the
# four molecular choices, omitting their printed option numbers.
source = originals["q50.png"]
save_crop(source, (0, 0, 930, 285), "q50.png")
for letter, box in zip("abcd", [(40, 330, 465, 635), (500, 330, 930, 635), (40, 620, 465, 935), (500, 620, 930, 935)]):
    save_crop(source, box, f"q50_opt_{letter}.png")

print({"normalized_sources": len(originals), "graphical_option_questions": 2, "option_images": 8})
