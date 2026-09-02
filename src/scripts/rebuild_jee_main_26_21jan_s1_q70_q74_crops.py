from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
PAPER = ROOT / "tmp/jee-main-2026-january-clean/JEE-MAIN-26-21JAN-S1"
OUT = PAPER / "final-diagrams"


def font(size: int):
    for path in (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def build_q70():
    source = Image.open(PAPER / "pages/page-21.png").convert("RGB")
    # Preserve the app's A-D ordering: original source options 4, 1, 3, 2.
    rows = {
        1: (195, 200, 1080, 275),
        2: (195, 315, 1080, 420),
        3: (195, 455, 1080, 555),
        4: (195, 575, 1080, 700),
    }
    order = [4, 1, 3, 2]
    canvas = Image.new("RGB", (1030, 500), "white")
    draw = ImageDraw.Draw(canvas)
    label_font = font(34)
    y = 10
    for label, number in zip("ABCD", order):
        row = source.crop(rows[number])
        bbox = row.getbbox()
        if bbox:
            row = row.crop(bbox)
        max_w, max_h = 940, 112
        scale = min(max_w / row.width, max_h / row.height, 1)
        if scale < 1:
            row = row.resize((round(row.width * scale), round(row.height * scale)), Image.Resampling.LANCZOS)
        draw.text((10, y + 28), f"({label})", fill="black", font=label_font)
        canvas.paste(row, (82, y))
        y += 122
    canvas = canvas.crop((0, 0, 1030, y - 4))
    canvas.save(OUT / "q70.png", optimize=True)


def build_q74():
    source = Image.open(PAPER / "pages/page-31.png").convert("RGB")
    # Diagram only: retain every reagent and arrow while excluding repeated prompt/metadata.
    crop = source.crop((145, 1545, 1115, 1735))
    crop.save(OUT / "q74.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    build_q70()
    build_q74()
    for name in ("q70.png", "q74.png"):
        image = Image.open(OUT / name)
        print(name, image.size)
