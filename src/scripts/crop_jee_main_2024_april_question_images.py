from io import BytesIO
import json
from pathlib import Path
import subprocess
import sys
import time

from PIL import Image

ROOT = Path.cwd()
MANIFEST_PATH = ROOT / "tmp" / "jee-main-2024-april-question-image-manifest.json"
OUTPUT_ROOT = ROOT / "tmp" / "jee-main-2024-april-clean-question-images"


def tight_crop(source_bytes: bytes, output_path: Path) -> None:
    image = Image.open(BytesIO(source_bytes)).convert("RGB")
    # April 2024 source images are already question-level crops. A light fixed
    # inset removes the outer frame, then a content-aware trim removes the
    # large white tail while keeping a safe margin around the actual question.
    image = image.crop((12, 4, image.size[0] - 12, image.size[1] - 4))
    grayscale = image.convert("L")
    width, height = image.size
    mask = grayscale.point(lambda pixel: 255 if pixel < 245 else 0)
    x_projection, y_projection = mask.getprojection()

    significant_rows = [index for index, present in enumerate(y_projection) if present]
    significant_cols = [index for index, present in enumerate(x_projection) if present]

    if significant_rows and significant_cols:
        top = significant_rows[0]
        bottom = significant_rows[-1]
        for index in range(len(significant_rows) - 1, 0, -1):
            if significant_rows[index] - significant_rows[index - 1] > 80:
                bottom = significant_rows[index - 1]
                break

        left = significant_cols[0]
        right = significant_cols[-1]

        pad_x = 12
        pad_y = 10
        image = image.crop(
            (
                max(0, left - pad_x),
                max(0, top - pad_y),
                min(width, right + pad_x + 1),
                min(height, bottom + pad_y + 1),
            )
        )

    framed = Image.new("RGB", (image.size[0] + 12, image.size[1] + 12), "white")
    framed.paste(image, (6, 6))
    framed.save(output_path, optimize=True)


def download_bytes(url: str) -> bytes:
    last_error = None
    for _ in range(3):
        try:
            result = subprocess.run(
                ["curl", "-L", "--fail", "--silent", "--connect-timeout", "10", "--max-time", "30", url],
                check=True,
                capture_output=True,
                timeout=35,
            )
            return result.stdout
        except Exception as error:  # noqa: BLE001
            last_error = error
            time.sleep(1)

    raise last_error


def canonical_source_url(paper_code: str, question_number: int, fallback_url: str) -> str:
    marker = "/storage/v1/object/public/pyq-images/"
    if marker in fallback_url:
        base = fallback_url.split(marker, 1)[0]
        return (
            f"{base}{marker}"
            f"jee-main-2024-april-clean/{paper_code}/q{question_number:02}.png"
        )
    return fallback_url


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text())
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    selected_papers = set(sys.argv[1:])

    seen = set()
    for row in manifest:
        paper_code = row["paper_code"]
        question_number = row["question_number"]
        question_image = row["question_image"]

        if selected_papers and paper_code not in selected_papers:
            continue

        if not question_image:
            raise ValueError(f"{paper_code} Q{question_number}: missing question_image")

        output_dir = OUTPUT_ROOT / paper_code
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"q{question_number:02}.png"

        source_bytes = download_bytes(
            canonical_source_url(paper_code, question_number, question_image)
        )
        tight_crop(source_bytes, output_path)
        seen.add((paper_code, question_number))

    print(json.dumps({"outputRoot": str(OUTPUT_ROOT), "images": len(seen)}))


if __name__ == "__main__":
    main()
