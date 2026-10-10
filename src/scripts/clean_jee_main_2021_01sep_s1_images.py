#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-01SEP-S1"
DIR = ROOT / "scratch/jee2021/images" / PAPER
CHEM_PAGE_2 = ROOT / "scratch/jee2021/local" / PAPER / "chemistry/pages/page-2.png"
CHEM_PAGE_3 = ROOT / "scratch/jee2021/local" / PAPER / "chemistry/pages/page-3.png"


def norm(image):
    image = image.convert("RGB")
    corner = image.crop((0, 0, min(24, image.width), min(24, image.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        image = ImageOps.invert(image)
    return ImageOps.grayscale(image).point(lambda value: 255 if value >= 205 else 0).convert("RGB")


def trim(image, padding=12):
    bounds = ImageChops.difference(image, Image.new("RGB", image.size, "white")).getbbox()
    if not bounds:
        return image
    left, top, right, bottom = bounds
    return image.crop((
        max(0, left - padding), max(0, top - padding),
        min(image.width, right + padding), min(image.height, bottom + padding),
    ))


def save(image, box, name):
    trim(norm(image.crop(box))).save(DIR / name)


raw = {}
for source_path in DIR.glob("q*_raw.png"):
    number = int(source_path.stem.split("_")[0][1:])
    raw[number] = Image.open(source_path).convert("RGB")
    trim(norm(raw[number])).save(DIR / f"q{number}.png")


def split(number, question_box, option_boxes):
    source = raw[number]
    if question_box:
        save(source, question_box, f"q{number}.png")
    else:
        (DIR / f"q{number}.png").unlink(missing_ok=True)
    for letter, box in zip("abcd", option_boxes):
        save(source, box, f"q{number}_opt_{letter}.png")


# Physics Q15: surface profile followed by four vertically stacked force graphs.
split(15, (80, 0, 650, 250), [
    (120, 250, 650, 665), (120, 665, 650, 1190),
    (120, 1190, 650, 1715), (120, 1715, 650, 2514),
])

# Chemistry Q4: four rate-constant graphs in a 2x2 grid.
split(34, None, [
    (235, 0, 690, 350), (735, 0, 1190, 350),
    (235, 350, 690, 724), (735, 350, 1190, 724),
])

# Chemistry Q5: reaction scheme followed by four vertically stacked structures.
split(35, (200, 0, 1000, 310), [
    (80, 310, 700, 690), (80, 690, 700, 930),
    (80, 930, 700, 1130), (80, 1130, 700, 1348),
])

# Chemistry Q16: four structural choices in a 2x2 grid.
split(46, None, [
    (210, 0, 700, 245), (700, 0, 1200, 245),
    (210, 245, 700, 490), (700, 245, 1200, 490),
])

# Chemistry Q10 is absent from the secondary source; recover its four structures
# from the official solution page while excluding the source header and watermark.
page_2 = Image.open(CHEM_PAGE_2).convert("RGB")
save(page_2, (1180, 2080, 1400, 2280), "q40_opt_a.png")
save(page_2, (1550, 2080, 1690, 2220), "q40_opt_b.png")
save(page_2, (1160, 2260, 1290, 2470), "q40_opt_c.png")
save(page_2, (1540, 2280, 1685, 2470), "q40_opt_d.png")

# Chemistry Q14 reaction scheme only; text and choices are stored separately.
page_3 = Image.open(CHEM_PAGE_3).convert("RGB")
save(page_3, (1090, 190, 1900, 280), "q44.png")

print({
    "normalized_sources": len(raw),
    "graphical_option_questions": 5,
    "option_images": 20,
    "recovered_official_diagrams": 2,
})
