from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path("tmp/jee-main-2026-jan/JEE-MAIN-26-21JAN-S1/crops")
OUT = Path("tmp/jee-main-2026-january-clean/JEE-MAIN-26-21JAN-S1/final-diagrams")
OUT.mkdir(parents=True, exist_ok=True)

# Crop only the information that cannot be represented cleanly as text/LaTeX.
BOXES = {
    38: (115, 35, 690, 190),      # logic circuit
    39: (45, 150, 650, 375),      # suspended rod
    43: (50, 190, 520, 395),      # moving conductor circuit
    44: (145, 1535, 660, 1740),   # venturimeter diagram
    46: (15, 235, 300, 490),      # connected rods
    47: (10, 145, 350, 500),      # resistor bridge circuit
    55: (0, 75, 540, 570),        # four resonance structures
    57: (0, 45, 690, 710),        # reaction and four structures
    60: (0, 0, 475, 1380),        # four graph choices
    61: (0, 430, 455, 690),       # Gibbs-energy graph
    70: (25, 190, 735, 815),      # four structural answer choices
    74: (25, 35, 735, 190),       # reaction sequence
}


def trim_white(image: Image.Image, pad: int = 10) -> Image.Image:
    rgb = image.convert("RGB")
    background = Image.new("RGB", rgb.size, "white")
    diff = ImageChops.difference(rgb, background).convert("L")
    # Ignore faint scan noise and retain meaningful ink.
    mask = diff.point(lambda p: 255 if p > 18 else 0)
    bbox = mask.getbbox()
    if not bbox:
        return rgb
    left, top, right, bottom = bbox
    return rgb.crop((max(0, left - pad), max(0, top - pad), min(rgb.width, right + pad), min(rgb.height, bottom + pad)))


for number, box in BOXES.items():
    source = Image.open(ROOT / f"q{number}.png")
    cleaned = trim_white(source.crop(box))
    cleaned.save(OUT / f"q{number}.png", optimize=True)
    print(f"Q{number}: {source.size} -> {cleaned.size}")
