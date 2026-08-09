from io import BytesIO
import json
from pathlib import Path
import subprocess
import time

from PIL import Image, ImageChops

ROOT = Path.cwd()
OUTPUT_ROOT = ROOT / "tmp" / "jee-main-2023-24jan-s1-target-recrops"
MANIFEST_PATH = OUTPUT_ROOT / "manifest.json"
PAPER_CODE = "JEE-MAIN-23-24JAN-S1"
TARGET_QUESTIONS = list(range(43, 65)) + [83, 84]


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


def trim_white(image: Image.Image, border: int = 4) -> Image.Image:
    background = Image.new("RGB", image.size, (255, 255, 255))
    diff = ImageChops.difference(image, background)
    bbox = diff.getbbox()
    if not bbox:
        return image
    return image.crop(
        (
            max(0, bbox[0] - border),
            max(0, bbox[1] - border),
            min(image.width, bbox[2] + border),
            min(image.height, bbox[3] + border),
        )
    )


def recrop_image(source_bytes: bytes, output_path: Path) -> None:
    image = Image.open(BytesIO(source_bytes)).convert("RGB")
    image = image.crop((6, 2, image.size[0] - 6, image.size[1] - 2))
    image = trim_white(image, border=3)
    image.save(output_path, optimize=True)


def main() -> None:
    rows = json.loads(MANIFEST_PATH.read_text())
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    output_rows = []
    for row in rows:
        question_number = row["question_number"]
        if question_number not in TARGET_QUESTIONS:
            continue
        output_path = OUTPUT_ROOT / f"q{question_number:02}.png"
        source_bytes = download_bytes(row["question_image"])
        recrop_image(source_bytes, output_path)
        output_rows.append(
            {
                "id": row["id"],
                "paper_code": row["paper_code"],
                "question_number": question_number,
                "original_question_image": row["question_image"],
                "local_image_path": str(output_path),
            }
        )

    (OUTPUT_ROOT / "recrop-manifest.json").write_text(json.dumps(output_rows, indent=2))
    print(json.dumps({"outputRoot": str(OUTPUT_ROOT), "images": len(output_rows)}))


if __name__ == "__main__":
    main()
