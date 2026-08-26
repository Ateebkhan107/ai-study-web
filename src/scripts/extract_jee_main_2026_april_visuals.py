"""Extract only genuine embedded source visuals and attach them to structured questions."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from io import BytesIO
from pathlib import Path

import pdfplumber
from PIL import Image


ROOT = Path.cwd()
SOURCE = ROOT / "tmp" / "jee-main-2026-april-input"
STRUCTURED = ROOT / "tmp" / "jee-main-2026-april" / "structured"
VISUAL_ROOT = ROOT / "tmp" / "jee-main-2026-april" / "visuals"
PAPERS = [
    ("JEE_Main_2026_02_April_Shift_1.pdf", "JEE-MAIN-26-02APR-S1"),
    ("JEE_Main_2026_02_April_Shift_2.pdf", "JEE-MAIN-26-02APR-S2"),
    ("JEE_Main_2026_04_April_Shift_1.pdf", "JEE-MAIN-26-04APR-S1"),
    ("JEE_Main_2026_04_April_Shift_2.pdf", "JEE-MAIN-26-04APR-S2"),
    ("JEE_Main_2026_05_April_Shift_1.pdf", "JEE-MAIN-26-05APR-S1"),
    ("JEE_Main_2026_05_April_Shift_2.pdf", "JEE-MAIN-26-05APR-S2"),
    ("JEE_Main_2026_06_April_Shift_1.pdf", "JEE-MAIN-26-06APR-S1"),
    ("JEE_Main_2026_06_April_Shift_2.pdf", "JEE-MAIN-26-06APR-S2"),
    ("JEE_Main_2026_08_April_Shift_2.pdf", "JEE-MAIN-26-08APR-S2"),
]


def decode_image(item: dict) -> Image.Image:
    width, height = item["srcsize"]
    data = item["stream"].get_data()
    pixels = width * height
    if len(data) == pixels:
        mode = "L"
    elif len(data) == pixels * 3:
        mode = "RGB"
    elif len(data) == pixels * 4:
        mode = "CMYK"
    else:
        try:
            return Image.open(BytesIO(data)).convert("RGB")
        except Exception as error:
            raise ValueError(f"Unsupported decoded image length {len(data)} for {width}x{height}") from error
    return Image.frombytes(mode, (width, height), data).convert("RGB")


def combine(images: list[Image.Image]) -> Image.Image:
    width = max(image.width for image in images)
    gap = 16
    height = sum(image.height for image in images) + gap * (len(images) - 1)
    output = Image.new("RGB", (width, height), "white")
    top = 0
    for image in images:
        output.paste(image, ((width - image.width) // 2, top))
        top += image.height + gap
    return output


def main() -> None:
    report = []
    selected = PAPERS
    if len(sys.argv) > 1:
        requested = set(sys.argv[1:])
        selected = [paper for paper in PAPERS if paper[0] in requested or paper[1] in requested]
        if not selected:
            raise SystemExit(f"No matching paper for: {', '.join(sys.argv[1:])}")
    for filename, paper_code in selected:
        manifest_path = STRUCTURED / f"{paper_code}.json"
        manifest = json.loads(manifest_path.read_text())
        by_number = {int(row["number"]): row for row in manifest["questions"]}
        out = VISUAL_ROOT / paper_code
        out.mkdir(parents=True, exist_ok=True)
        grouped: dict[int, list[dict]] = defaultdict(list)
        with pdfplumber.open(SOURCE / filename) as document:
            for page in document.pages:
                anchors = []
                for word in page.extract_words():
                    match = re.fullmatch(r"Q(\d{1,2})\.", word["text"])
                    if match:
                        anchors.append((int(match.group(1)), float(word["top"])))
                anchors.sort(key=lambda item: item[1])
                for item in sorted(page.images, key=lambda image: (image["top"], image["x0"])):
                    preceding = [anchor for anchor in anchors if anchor[1] < float(item["top"]) + 2]
                    if not preceding:
                        continue
                    grouped[preceding[-1][0]].append(item)
            details = []
            for number, items in sorted(grouped.items()):
                if number not in by_number:
                    continue
                images = [decode_image(item) for item in items]
                row = by_number[number]
                if len(images) in {4, 5} and row["question_type"] == "MCQ":
                    option_images = images[-4:]
                    for index, image in enumerate(option_images):
                        path = out / f"q{number:02d}-option-{chr(97 + index)}.png"
                        image.save(path, optimize=True)
                        row[f"option_{chr(97 + index)}_image"] = str(path)
                    if len(images) == 5:
                        path = out / f"q{number:02d}-question.png"
                        images[0].save(path, optimize=True)
                        row["question_image"] = str(path)
                    details.append({"number": number, "images": len(images), "kind": "question+options" if len(images) == 5 else "options"})
                else:
                    path = out / f"q{number:02d}-question.png"
                    combine(images).save(path, optimize=True)
                    row["question_image"] = str(path)
                    details.append({"number": number, "images": len(images), "kind": "question"})
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        report.append({"paper_code": paper_code, "questions_with_visuals": len(details), "details": details})
    (STRUCTURED / "visual-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
