from io import BytesIO
import json
from pathlib import Path
from urllib.request import urlopen

from PIL import Image, ImageChops

ROOT = Path.cwd()
MANIFEST_PATH = ROOT / "tmp" / "jee-main-2025-april-question-image-manifest.json"
OUTPUT_ROOT = ROOT / "tmp" / "jee-main-2025-april-clean-question-images"


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


def tight_crop(source_bytes: bytes, output_path: Path) -> None:
    image = Image.open(BytesIO(source_bytes)).convert("RGB")
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
    manifest = json.loads(MANIFEST_PATH.read_text())
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    seen = set()
    for row in manifest:
        paper_code = row["paper_code"]
        question_number = row["question_number"]
        question_image = row["question_image"]

        if not question_image:
            raise ValueError(f"{paper_code} Q{question_number}: missing question_image")

        output_dir = OUTPUT_ROOT / paper_code
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"q{question_number:02}.png"

        with urlopen(question_image) as response:
            source_bytes = response.read()

        tight_crop(source_bytes, output_path)
        seen.add((paper_code, question_number))

    print(json.dumps({"outputRoot": str(OUTPUT_ROOT), "images": len(seen)}))


if __name__ == "__main__":
    main()
