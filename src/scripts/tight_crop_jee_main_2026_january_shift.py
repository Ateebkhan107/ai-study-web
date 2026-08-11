from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path.cwd()
SOURCE_ROOT = ROOT / "tmp" / "jee-main-2026-january-clean-question-images"
OUTPUT_ROOT = ROOT / "tmp" / "jee-main-2026-january-tight-question-images"
REPORT_PATH = ROOT / "tmp" / "jee-main-2026-january-tight-crop-report.json"
VISUAL_REVIEW_BY_PAPER = {
    "JEE-MAIN-26-21JAN-S1": {58, 62, 70, 75},
}


def is_content_pixel(red: int, green: int, blue: int) -> bool:
    gray = (red * 30 + green * 59 + blue * 11) // 100
    is_pink_watermark = red > 170 and red > green + 8 and red > blue + 8
    return gray < 232 and not is_pink_watermark


def find_content_box(image: Image.Image) -> tuple[int, int, int, int, dict[str, int | float | bool]]:
    width, height = image.size
    pixels = image.load()
    mask = [[False] * width for _ in range(height)]

    for y in range(8, max(8, height - 8)):
        for x in range(12, max(12, width - 12)):
            if is_content_pixel(*pixels[x, y]):
                mask[y][x] = True

    def clear_component(start_x: int, start_y: int) -> tuple[int, int, int, int, int]:
        stack = [(start_x, start_y)]
        mask[start_y][start_x] = False
        min_x = max_x = start_x
        min_y = max_y = start_y
        area = 0
        while stack:
            x, y = stack.pop()
            area += 1
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
            for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= next_x < width and 0 <= next_y < height and mask[next_y][next_x]:
                    mask[next_y][next_x] = False
                    stack.append((next_x, next_y))
        return min_x, min_y, max_x, max_y, area

    for y in range(height):
        for x in (*range(0, min(28, width)), *range(max(0, width - 28), width)):
            if mask[y][x]:
                clear_component(x, y)

    for x in range(width):
        for y in (*range(0, min(18, height)), *range(max(0, height - 18), height)):
            if mask[y][x]:
                clear_component(x, y)

    visited = [[False] * width for _ in range(height)]
    components_to_clear: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            if not mask[y][x] or visited[y][x]:
                continue
            stack = [(x, y)]
            visited[y][x] = True
            min_x = max_x = x
            min_y = max_y = y
            area = 0
            while stack:
                current_x, current_y = stack.pop()
                area += 1
                min_x = min(min_x, current_x)
                max_x = max(max_x, current_x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if (
                        0 <= next_x < width
                        and 0 <= next_y < height
                        and mask[next_y][next_x]
                        and not visited[next_y][next_x]
                    ):
                        visited[next_y][next_x] = True
                        stack.append((next_x, next_y))

            component_width = max_x - min_x + 1
            component_height = max_y - min_y + 1
            is_line_artifact = (
                (component_width > 240 and component_height <= 10)
                or (component_height > 240 and component_width <= 10)
            )
            is_sparse_page_artifact = (
                area < max(12, component_width * component_height * 0.02)
                and (component_width > 420 or component_height > 420)
            )
            if is_line_artifact or is_sparse_page_artifact:
                components_to_clear.append((x, y))

    for x, y in components_to_clear:
        if mask[y][x]:
            clear_component(x, y)

    row_counts = [sum(row) for row in mask]
    col_counts = [sum(mask[y][x] for y in range(height)) for x in range(width)]

    for y, count in enumerate(row_counts):
        if count > width * 0.55:
            for x in range(width):
                mask[y][x] = False

    for x, count in enumerate(col_counts):
        if count > height * 0.45:
            for y in range(height):
                mask[y][x] = False

    row_counts = [sum(row) for row in mask]
    col_counts = [sum(mask[y][x] for y in range(height)) for x in range(width)]

    significant_rows = [index for index, count in enumerate(row_counts) if count >= 4]
    significant_cols = [index for index, count in enumerate(col_counts) if count >= 3]

    if not significant_rows or not significant_cols:
        return (0, 0, width, height), {
            "contentPixels": 0,
            "heightRatio": 1,
            "widthRatio": 1,
            "fallback": True,
        }

    top = significant_rows[0]
    bottom = significant_rows[-1]
    last_row = top
    max_content_gap = 140
    for row in significant_rows[1:]:
        if row - last_row > max_content_gap:
            bottom = last_row
            break
        last_row = row

    scoped_col_counts = [
        sum(mask[y][x] for y in range(top, bottom + 1)) for x in range(width)
    ]
    significant_cols = [index for index, count in enumerate(scoped_col_counts) if count >= 3]
    if not significant_cols:
        significant_cols = [index for index, count in enumerate(col_counts) if count >= 3]

    left = significant_cols[0]
    right = significant_cols[-1]

    pad_x = 22
    pad_y = 14
    box = (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(width, right + pad_x + 1),
        min(height, bottom + pad_y + 1),
    )
    watermark_rows = []
    for y in range(box[1], box[3]):
        pink_pixels = 0
        for x in range(box[0], box[2], 2):
            red, green, blue = pixels[x, y]
            if red > 170 and red > green + 8 and red > blue + 8:
                pink_pixels += 1
        if pink_pixels > 18:
            watermark_rows.append(y)

    if watermark_rows and watermark_rows[0] - box[1] > 120:
        box = (box[0], box[1], box[2], max(box[1] + 1, watermark_rows[0] - 50))

    return box, {
        "contentPixels": sum(row_counts),
        "heightRatio": round((box[3] - box[1]) / height, 4),
        "widthRatio": round((box[2] - box[0]) / width, 4),
        "fallback": False,
    }


def make_contact_sheets(paper_code: str, image_paths: list[Path]) -> list[str]:
    sheet_paths = []
    font = ImageFont.load_default()
    for sheet_index, start in enumerate(range(0, len(image_paths), 25), start=1):
        batch = image_paths[start : start + 25]
        thumbs = []
        for path in batch:
            image = Image.open(path).convert("RGB")
            image.thumbnail((360, 260), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (380, 306), "white")
            draw = ImageDraw.Draw(canvas)
            draw.text((8, 8), path.stem.upper(), fill=(30, 30, 30), font=font)
            canvas.paste(image, ((380 - image.width) // 2, 36))
            draw.rectangle((0, 0, 379, 305), outline=(220, 220, 220))
            thumbs.append(canvas)

        cols = 5
        rows = (len(thumbs) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * 380, rows * 306), (245, 246, 248))
        for index, thumb in enumerate(thumbs):
            sheet.paste(thumb, ((index % cols) * 380, (index // cols) * 306))

        sheet_path = OUTPUT_ROOT / paper_code / f"contact-sheet-{sheet_index:02}.png"
        sheet.save(sheet_path, optimize=True)
        sheet_paths.append(str(sheet_path))
    return sheet_paths


def crop_shift(paper_code: str) -> dict:
    source_dir = SOURCE_ROOT / paper_code
    output_dir = OUTPUT_ROOT / paper_code
    if not source_dir.exists():
        raise FileNotFoundError(f"Missing source images for {paper_code}: {source_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    output_paths = []
    visual_review_numbers = VISUAL_REVIEW_BY_PAPER.get(paper_code, set())

    for number in range(1, 76):
        source_path = source_dir / f"q{number:02}.png"
        output_path = output_dir / source_path.name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source image: {source_path}")

        image = Image.open(source_path).convert("RGB")
        box, metrics = find_content_box(image)
        cropped = image.crop(box)
        cropped.save(output_path, optimize=True)
        output_paths.append(output_path)

        needs_review = (
            metrics["fallback"]
            or metrics["heightRatio"] > 0.94
            or cropped.height < 70
            or cropped.width < 220
            or number in visual_review_numbers
        )
        rows.append(
            {
                "questionNumber": number,
                "sourcePath": str(source_path),
                "outputPath": str(output_path),
                "originalSize": image.size,
                "croppedSize": cropped.size,
                "cropBox": box,
                "metrics": metrics,
                "needsManualReview": bool(needs_review),
            }
        )

    return {
        "paperCode": paper_code,
        "totalQuestions": len(rows),
        "correctlyCropped": sum(1 for row in rows if not row["needsManualReview"]),
        "couldNotConfidentlyCrop": sum(1 for row in rows if row["needsManualReview"]),
        "manualReviewQuestionNumbers": [
            row["questionNumber"] for row in rows if row["needsManualReview"]
        ],
        "outputDirectory": str(output_dir),
        "contactSheets": make_contact_sheets(paper_code, output_paths),
        "rows": rows,
    }


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: tight_crop_jee_main_2026_january_shift.py PAPER_CODE")

    paper_code = sys.argv[1]
    report = crop_shift(paper_code)
    existing = {}
    if REPORT_PATH.exists():
        existing = json.loads(REPORT_PATH.read_text())
    existing[paper_code] = report
    REPORT_PATH.write_text(json.dumps(existing, indent=2))
    print(json.dumps({key: report[key] for key in (
        "paperCode",
        "totalQuestions",
        "correctlyCropped",
        "couldNotConfidentlyCrop",
        "manualReviewQuestionNumbers",
        "outputDirectory",
        "contactSheets",
    )}, indent=2))


if __name__ == "__main__":
    main()
