"""Crop the only genuinely graphical reported question in 8 Apr Shift 2."""
from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "tmp/jee-main-2025-april/2025-04-08-shift-2/questions/q64.png"
OUTPUT = ROOT / "tmp/jee-main-2025-april/2025-04-08-shift-2/final-diagrams/q64.png"

image = Image.open(SOURCE).convert("RGB").crop((105, 18, 744, 825))
gray = ImageOps.grayscale(image)
bbox = ImageChops.difference(gray, Image.new("L", gray.size, 255)).point(
    lambda p: 255 if p > 18 else 0
).getbbox()
if bbox:
    left, top, right, bottom = bbox
    image = image.crop((max(0, left-10), max(0, top-10), min(image.width, right+10), min(image.height, bottom+10)))
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUTPUT, optimize=True)
print(f"{OUTPUT}: {image.width}x{image.height}")
