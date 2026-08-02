from io import BytesIO
import json
from pathlib import Path
from urllib.request import urlopen

from PIL import Image, ImageChops

ROOT = Path.cwd()
MANIFEST_PATH = ROOT / "tmp" / "jee-advanced-2025-question-image-manifest.json"
OUTPUT_ROOT = ROOT / "tmp" / "jee-advanced-2025-clean-question-images"


def trim_white(image: Image.Image) -> Image.Image:
    background = Image.new("RGB", image.size, (255, 255, 255))
    diff = ImageChops.difference(image, background)
    bbox = diff.getbbox()
    return image.crop(bbox) if bbox else image


def tight_crop(source_bytes: bytes, output_path: Path) -> None:
    image = Image.open(BytesIO(source_bytes)).convert("RGB")

    # Remove the outer screenshot frame while preserving option-table borders.
    inset_x = min(18, max(8, image.size[0] // 80))
    inset_top = min(12, max(6, image.size[1] // 120))
    inset_bottom = min(18, max(8, image.size[1] // 80))
    image = image.crop((inset_x, inset_top, image.size[0] - inset_x, image.size[1] - inset_bottom))
    image = trim_white(image)

    framed = Image.new("RGB", (image.size[0] + 12, image.size[1] + 12), "white")
    framed.paste(image, (6, 6))
    framed.save(output_path, quality=92, optimize=True, progressive=True)


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
        output_path = output_dir / f"q{question_number:02}.jpg"

        with urlopen(question_image) as response:
            source_bytes = response.read()

        tight_crop(source_bytes, output_path)
        seen.add((paper_code, question_number))

    print(json.dumps({"outputRoot": str(OUTPUT_ROOT), "images": len(seen)}))


if __name__ == "__main__":
    main()
