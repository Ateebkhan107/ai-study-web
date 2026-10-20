#!/usr/bin/env python3
"""Create clean, diagram-only visual assets for 16 March 2021 Shift 1."""

from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-16MAR-S1"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER
LOCAL = ROOT / "scratch/jee2021/local" / PAPER


def normalize(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    corner = image.crop((0, 0, min(24, image.width), min(24, image.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        image = ImageOps.invert(image)
    image = ImageOps.grayscale(image)
    # The source material is line art. This removes pale logos/watermarks and
    # compression noise while retaining axes, bonds, labels and circuit lines.
    image = image.point(lambda value: 255 if value >= 205 else 0)
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

# Preserve and normalize every diagram-backed question before replacing the
# four files that also contain graphical choices.
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


split(17, (0, 0, 691, 325), [(45, 325, 691, 510), (45, 505, 691, 690), (45, 680, 691, 875), (45, 870, 691, 1067)])
split(34, (0, 0, 1250, 285), [(45, 313, 1250, 416), (45, 455, 1250, 628), (45, 679, 1250, 928), (45, 973, 1250, 1101)])
split(37, (0, 0, 1250, 280), [(85, 313, 1250, 485), (85, 529, 1250, 700), (85, 748, 1250, 921), (85, 965, 1250, 1166)])
split(41, (0, 0, 1110, 461), [(390, 461, 1110, 660), (390, 660, 1110, 858), (390, 858, 1110, 1055), (390, 1055, 1110, 1258)])

# Physics Q14 is absent from the structured source. Extract only the input
# graph and the four answer graphs from the cleanest available source page.
physics_page = Image.open(LOCAL / "physics/pages/page-05.png").convert("RGB")
save_crop(physics_page, (500, 1120, 855, 1455), "q14.png")
for letter, box in zip("abcd", [
    (390, 1580, 840, 1935),
    (390, 1990, 840, 2345),
    (1190, 205, 1660, 550),
    (1190, 590, 1660, 860),
]):
    save_crop(physics_page, box, f"q14_opt_{letter}.png")

# Chemistry Q15 likewise only exists in the PDF crop. Keep the reaction
# schemes, but exclude the question prose and numbered choice labels.
chemistry_q15 = Image.open(LOCAL / "chemistry/crops/q15.png").convert("RGB")
for letter, box in zip("abcd", [
    (350, 105, 980, 285),
    (350, 275, 980, 430),
    (350, 420, 980, 665),
    (350, 650, 980, 871),
]):
    save_crop(chemistry_q15, box, f"q45_opt_{letter}.png")

print({"normalized_sources": len(originals), "graphical_option_questions": 6, "option_images": 24})
