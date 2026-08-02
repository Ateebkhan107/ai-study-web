from io import BytesIO
import json
from pathlib import Path
import subprocess
import time

from PIL import Image

ROOT = Path.cwd()
MANIFEST_PATH = ROOT / "tmp" / "jee-advanced-2023-question-image-manifest.json"
OUTPUT_ROOT = ROOT / "tmp" / "jee-advanced-2023-clean-question-images"


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


def canonical_source_url(fallback_url: str) -> str:
    return fallback_url.split("?", 1)[0]


def tight_crop(source_bytes: bytes, output_path: Path) -> None:
    image = Image.open(BytesIO(source_bytes)).convert("RGB")
    image = image.crop((14, 6, image.size[0] - 14, image.size[1] - 8))

    grayscale = image.convert("L")
    width, height = image.size
    mask = grayscale.point(lambda pixel: 255 if pixel < 245 else 0)
    x_projection, y_projection = mask.getprojection()

    significant_rows = [index for index, present in enumerate(y_projection) if present]
    significant_cols = [index for index, present in enumerate(x_projection) if present]

    if significant_rows and significant_cols:
        clusters = []
        start = significant_rows[0]
        previous = significant_rows[0]
        for row in significant_rows[1:]:
            if row - previous > 10:
                clusters.append((start, previous))
                start = row
            previous = row
        clusters.append((start, previous))

        while len(clusters) > 1:
            cluster_start, cluster_end = clusters[-1]
            cluster_height = cluster_end - cluster_start + 1
            if cluster_height <= 35 and cluster_start >= height - 140:
                clusters.pop()
                continue
            break

        top = significant_rows[0]
        bottom = clusters[-1][1]
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

        source_bytes = download_bytes(canonical_source_url(question_image))
        tight_crop(source_bytes, output_path)
        seen.add((paper_code, question_number))

    print(json.dumps({"outputRoot": str(OUTPUT_ROOT), "images": len(seen)}))


if __name__ == "__main__":
    main()
