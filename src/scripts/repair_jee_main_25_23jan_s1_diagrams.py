"""Create tight, diagram-only assets for reported 23 Jan Shift 1 rows."""
from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "tmp/jee-main-2025-january-clean/JEE-MAIN-25-23JAN-S1"
OUTPUT = BASE / "final-diagrams"

# Live question number: crop box within its official full-question crop.
BOXES = {
    32: (105, 75, 570, 265),       # capacitor/resistor/key circuit
    44: (105, 185, 360, 420),      # two perpendicular dipoles
    50: (80, 40, 630, 205),        # variable-resistor/inductor circuit
    53: (75, 115, 680, 775),       # complete structures A through E
    74: (65, 65, 820, 250),        # complete reaction scheme
}


def trim(image: Image.Image, margin: int = 10) -> Image.Image:
    gray = ImageOps.grayscale(image)
    bbox = ImageChops.difference(gray, Image.new("L", gray.size, 255)).point(
        lambda p: 255 if p > 18 else 0
    ).getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    return image.crop((
        max(0, left - margin), max(0, top - margin),
        min(image.width, right + margin), min(image.height, bottom + margin),
    ))


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for number, box in BOXES.items():
        source = Image.open(BASE / "crops" / f"q{number:02}.png").convert("RGB")
        output = trim(source.crop(box))
        output.save(OUTPUT / f"q{number:02}.png", optimize=True)
        print(f"Q{number}: {output.width}x{output.height}")


if __name__ == "__main__":
    main()
