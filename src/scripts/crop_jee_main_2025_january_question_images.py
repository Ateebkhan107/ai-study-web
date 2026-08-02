from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path.cwd()
SOURCE_ROOT = ROOT / "tmp" / "jee-main-january-ocr-cache"
OUTPUT_ROOT = ROOT / "tmp" / "jee-main-2025-january-clean-question-images"
PAPER_CODES = [
    "JEE-MAIN-25-22JAN-S1",
    "JEE-MAIN-25-22JAN-S2",
    "JEE-MAIN-25-23JAN-S1",
    "JEE-MAIN-25-23JAN-S2",
    "JEE-MAIN-25-24JAN-S1",
    "JEE-MAIN-25-24JAN-S2",
    "JEE-MAIN-25-28JAN-S1",
    "JEE-MAIN-25-28JAN-S2",
    "JEE-MAIN-25-29JAN-S1",
    "JEE-MAIN-25-29JAN-S2",
]


def trim_white(image: Image.Image) -> Image.Image:
    background = Image.new("RGB", image.size, (255, 255, 255))
    diff = ImageChops.difference(image, background)
    bbox = diff.getbbox()
    return image.crop(bbox) if bbox else image


def remove_section_divider(image: Image.Image) -> Image.Image:
    gray = image.convert("L")
    width, height = gray.size
    start_y = int(height * 0.55)
    consecutive = 0
    cut_y = None

    for y in range(start_y, height):
        row = gray.crop((0, y, width, y + 1))
        dark_pixels = sum(1 for value in row.getdata() if value < 180)
        if dark_pixels > width * 0.4:
            consecutive += 1
            if consecutive >= 2:
                cut_y = max(0, y - consecutive - 12)
                break
        else:
            consecutive = 0

    if cut_y:
        image = image.crop((0, 0, width, cut_y))

    return image


def tight_crop(image_path: Path, output_path: Path) -> None:
    image = Image.open(image_path).convert("RGB")
    image = image.crop((40, 10, image.size[0] - 40, image.size[1] - 40))
    image = trim_white(image)
    image = image.crop((6, 0, image.size[0] - 10, image.size[1]))
    image = trim_white(image)
    image = remove_section_divider(image)
    image = trim_white(image)
    framed = Image.new("RGB", (image.size[0] + 12, image.size[1] + 12), "white")
    framed.paste(image, (6, 6))
    framed.save(output_path, optimize=True)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    for paper_code in PAPER_CODES:
        source_dir = SOURCE_ROOT / paper_code
        if not source_dir.exists():
            raise FileNotFoundError(f"Missing source folder: {source_dir}")

        output_dir = OUTPUT_ROOT / paper_code
        output_dir.mkdir(parents=True, exist_ok=True)

        for number in range(1, 76):
            source_path = source_dir / f"q{number:02}.png"
            if not source_path.exists():
                raise FileNotFoundError(f"Missing source image: {source_path}")

            output_path = output_dir / f"q{number:02}.png"
            tight_crop(source_path, output_path)

        print(paper_code)


if __name__ == "__main__":
    main()
