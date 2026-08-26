"""Extract only the six diagrams required by 29 Jan 2025 Shift 2.

The source review sheet is a vertical concatenation of the official question
crops.  Coordinates deliberately exclude question text, answer choices,
metadata, borders, and page whitespace.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "tmp/jee-main-2025-january-clean/29s2-image-review.png"
OUTPUT = ROOT / "tmp/jee-main-2025-january-clean/JEE-MAIN-25-29JAN-S2/final-diagrams"

# live question number: source-review pixel box
BOXES = {
    26: (300, 130, 570, 265),      # three spheres and their velocity arrows
    31: (100, 1130, 450, 1245),    # two concave refracting surfaces
    34: (105, 2260, 350, 2565),    # charged sheet and dipole orientation
    36: (130, 3410, 405, 3568),    # two-capacitor switch circuit
    41: (70, 4310, 590, 4555),     # the two lens cuts
    43: (65, 5280, 455, 5405),     # logic-gate circuit only
}


def trim(image: Image.Image, margin: int = 10) -> Image.Image:
    gray = ImageOps.grayscale(image)
    background = Image.new("L", gray.size, 255)
    bbox = ImageChops.difference(gray, background).point(lambda p: 255 if p > 18 else 0).getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(image.width, right + margin)
    bottom = min(image.height, bottom + margin)
    return image.crop((left, top, right, bottom))


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for number, box in BOXES.items():
        diagram = trim(source.crop(box))
        diagram.save(OUTPUT / f"q{number:02}.png", optimize=True)
        print(f"Q{number}: {diagram.width}x{diagram.height}")


if __name__ == "__main__":
    main()
