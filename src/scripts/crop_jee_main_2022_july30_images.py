"""Create clean diagram/graphic-option crops for the exceptional 30 July paper."""

from pathlib import Path

from PIL import Image


PAPER = "JEE-MAIN-22-30JUL-S2"
ROOT = Path.cwd()
SOURCE = ROOT / "tmp" / "jee-main-2022" / PAPER / "source-crops"
OUTPUT = ROOT / "scratch" / "jee2022" / "images" / PAPER

# Coordinates were measured against the lossless NTA crops. They exclude item
# metadata, question prose, option labels, page numbers, and topic footers.
CROPS = {
    "q6.png": (6, (250, 755, 575, 1180)),
    "q11.png": (11, (270, 210, 610, 470)),
    "q16.png": (16, (265, 680, 875, 1018)),
    "q18.png": (18, (265, 530, 700, 850)),
    "q25.png": (25, (260, 765, 620, 1135)),
    "q44.png": (44, (245, 220, 755, 340)),
    "q60.png": (60, (250, 250, 1245, 425)),
    "q78.png": (78, (245, 215, 1070, 290)),
    "q84.png": (84, (260, 650, 800, 935)),
    "q33_opt_a.png": (33, (240, 230, 440, 398)),
    "q33_opt_b.png": (33, (240, 400, 440, 568)),
    "q33_opt_c.png": (33, (240, 570, 440, 754)),
    "q33_opt_d.png": (33, (240, 755, 440, 934)),
    "q43_opt_a.png": (43, (240, 195, 360, 278)),
    "q43_opt_b.png": (43, (240, 280, 360, 362)),
    "q43_opt_c.png": (43, (240, 364, 360, 448)),
    "q43_opt_d.png": (43, (240, 450, 360, 553)),
    "q44_opt_a.png": (44, (245, 350, 750, 485)),
    "q44_opt_b.png": (44, (245, 852, 750, 978)),
    "q44_opt_c.png": (44, (245, 994, 750, 1112)),
    "q44_opt_d.png": (44, (245, 1129, 750, 1246)),
    "q46_opt_a.png": (46, (245, 235, 535, 345)),
    "q46_opt_b.png": (46, (245, 362, 535, 470)),
    "q46_opt_c.png": (46, (245, 486, 535, 628)),
    "q46_opt_d.png": (46, (245, 965, 535, 1072)),
}


def clean_and_trim(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b = pixels[x, y]
            if r >= 235 and g >= 235 and b >= 235:
                pixels[x, y] = (255, 255, 255)
    background = Image.new("RGB", image.size, "white")
    difference = Image.new("L", image.size)
    diff_pixels = difference.load()
    source_pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            diff_pixels[x, y] = 255 if source_pixels[x, y] != (255, 255, 255) else 0
    bbox = difference.getbbox()
    if not bbox:
        return background
    left, top, right, bottom = bbox
    padding = 12
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


OUTPUT.mkdir(parents=True, exist_ok=True)
for filename, (number, bounds) in CROPS.items():
    source = Image.open(SOURCE / f"q{number}.png")
    output = clean_and_trim(source.crop(bounds))
    output.save(OUTPUT / filename, "PNG", optimize=True)

print({"paper_code": PAPER, "images": len(CROPS), "output": str(OUTPUT)})
