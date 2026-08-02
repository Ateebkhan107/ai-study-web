from io import BytesIO
import json
from pathlib import Path
import subprocess
import sys
import time

from PIL import Image, ImageChops

ROOT = Path.cwd()
MANIFEST_PATH = ROOT / "tmp" / "jee-main-2024-january-question-image-manifest.json"
OUTPUT_ROOT = ROOT / "tmp" / "jee-main-2024-january-clean-question-images"


def trim_white(image: Image.Image) -> Image.Image:
    background = Image.new("RGB", image.size, (255, 255, 255))
    diff = ImageChops.difference(image, background)
    bbox = diff.getbbox()
    return image.crop(bbox) if bbox else image


def tight_crop(source_bytes: bytes, output_path: Path) -> None:
    image = Image.open(BytesIO(source_bytes)).convert("RGB")
    # January 2024 source images are already question-level crops.  A light
    # fixed inset removes the outer frame without risking clipped options.
    image = image.crop((12, 4, image.size[0] - 12, image.size[1] - 4))

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
            f"jee-main-2024-clean/{paper_code}/q{question_number:02}.png"
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
