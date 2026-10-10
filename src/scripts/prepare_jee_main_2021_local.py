"""Prepare question-only crops and local OCR text without any remote API."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import csv
import io
from collections import defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path.cwd()
WORK = ROOT / "scratch" / "jee2021"
MANIFEST = json.loads((WORK / "source" / "manifest.json").read_text())
SUBJECTS = ("physics", "chemistry", "mathematics")
OFFSETS = {"physics": 0, "chemistry": 30, "mathematics": 60}
PDFTOPPM = Path("/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm")


def render(pdf_path: Path, output: Path, dpi: int = 240) -> None:
    output.mkdir(parents=True, exist_ok=True)
    if list(output.glob("page-*.png")):
        return
    subprocess.run(
        [str(PDFTOPPM), "-png", "-r", str(dpi), str(pdf_path), str(output / "page")],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env={**__import__("os").environ, "XDG_CACHE_HOME": "/tmp/codex-font-cache"},
    )


def line_groups(words: list[dict]) -> list[dict]:
    groups: list[list[dict]] = []
    for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
        for group in reversed(groups[-4:]):
            if abs(group[0]["top"] - word["top"]) <= 2.5:
                group.append(word)
                break
        else:
            groups.append([word])
    return [
        {
            "top": min(word["top"] for word in group),
            "bottom": max(word["bottom"] for word in group),
            "x0": min(word["x0"] for word in group),
            "x1": max(word["x1"] for word in group),
            "text": " ".join(word["text"] for word in sorted(group, key=lambda item: item["x0"])),
            "words": group,
        }
        for group in groups
    ]


def column_of(x: float, width: float) -> str:
    return "left" if x < width / 2 else "right"


def ocr_words(image_path: Path, psm: int = 3) -> list[dict]:
    result = subprocess.run(
        ["/opt/homebrew/bin/tesseract", str(image_path), "stdout", "--psm", str(psm), "tsv"],
        check=True, capture_output=True, text=True,
    )
    words = []
    for row in csv.DictReader(io.StringIO(result.stdout), delimiter="\t"):
        text = (row.get("text") or "").strip()
        if row.get("level") != "5" or not text:
            continue
        left, top = int(row["left"]), int(row["top"])
        words.append({
            "text": text, "x0": left, "top": top,
            "x1": left + int(row["width"]), "bottom": top + int(row["height"]),
        })
    return words


def find_questions(page_paths: list[Path]) -> list[dict]:
    found: dict[int, dict] = {}
    section = "A"
    for page_number, page_path in enumerate(page_paths, start=1):
        page_image = Image.open(page_path)
        page_width, page_height = page_image.size
        words = ocr_words(page_path, 3)
        anchor_words = ocr_words(page_path, 6)
        lines = line_groups(words)
        page_text = " ".join(line["text"] for line in lines)
        if re.search(r"SECTION\s*[-–]?\s*B", page_text, re.I):
            section = "B"

        anchors = []
        for word in anchor_words:
            token = word["text"].strip().replace("I", "1").replace("l", "1")
            match = re.fullmatch(r"(\d{1,2})\.", token)
            if not match:
                continue
            printed = int(match.group(1))
            local = printed if section == "A" else 20 + printed
            if local < 1 or local > 30 or local in found:
                continue
            # Question numerals align close to the left edge of either column.
            normalized_x = word["x0"] if word["x0"] < page_width / 2 else word["x0"] - page_width / 2
            if normalized_x < page_width * 0.035 or normalized_x > page_width * 0.16:
                continue
            if word["top"] > page_height * 0.94:
                continue
            anchors.append({"local": local, "top": word["top"], "column": column_of(word["x0"], page_width)})

        for anchor in anchors:
            answer_words = [word for word in words if column_of(word["x0"], page_width) == anchor["column"] and word["top"] > anchor["top"] and re.fullmatch(r"Official|OfficialAns\.?", word["text"], re.I)]
            if not answer_words:
                continue
            answer_top = min(word["top"] for word in answer_words)
            later_anchors = [item["top"] for item in anchors if item["column"] == anchor["column"] and item["top"] > anchor["top"]]
            if later_anchors and min(later_anchors) < answer_top:
                continue
            found[anchor["local"]] = {**anchor, "page": page_number, "answer_top": answer_top}
    return [found[number] for number in sorted(found)]


def crop_questions(pdf_path: Path, paper_code: str, subject: str) -> list[dict]:
    output = WORK / "local" / paper_code / subject
    pages_dir = output / "pages"
    crops_dir = output / "crops"
    ocr_dir = output / "ocr"
    crops_dir.mkdir(parents=True, exist_ok=True)
    ocr_dir.mkdir(parents=True, exist_ok=True)
    render(pdf_path, pages_dir)

    page_paths = sorted(pages_dir.glob("page-*.png"), key=lambda item: int(item.stem.split("-")[-1]))
    locations = find_questions(page_paths)

    rows = []
    for location in locations:
        page_path = page_paths[location["page"] - 1]
        image = Image.open(page_path).convert("RGB")
        if location["column"] == "left":
            left, right = 20, int(image.width / 2 - 20)
        else:
            left, right = int(image.width / 2 + 20), image.width - 20
        top = max(0, int(location["top"] - 15))
        bottom = min(image.height, int(location["answer_top"] - 8))
        crop_path = crops_dir / f"q{location['local']:02}.png"
        image.crop((left, top, right, bottom)).save(crop_path, optimize=True)
        ocr_path = ocr_dir / f"q{location['local']:02}.txt"
        if not ocr_path.exists():
            result = subprocess.run(["/opt/homebrew/bin/tesseract", str(crop_path), "stdout"], check=True, capture_output=True, text=True)
            ocr_path.write_text(result.stdout)
        rows.append({
            "local_number": location["local"],
            "question_number": OFFSETS[subject] + location["local"],
            "question_type": "MCQ" if location["local"] <= 20 else "NUMERICAL",
            "source_page": location["page"],
            "crop": str(crop_path),
            "ocr": str(ocr_path),
        })
    (output / "manifest.json").write_text(json.dumps(rows, indent=2) + "\n")
    return rows


def main() -> None:
    requested = set(sys.argv[1:])
    reports = []
    for paper in MANIFEST:
        if requested and paper["paper_code"] not in requested:
            continue
        for subject in SUBJECTS:
            pdf_path = WORK / "source" / "pdfs" / paper["paper_code"] / f"{subject}.pdf"
            rows = crop_questions(pdf_path, paper["paper_code"], subject)
            reports.append({"paper_code": paper["paper_code"], "subject": subject, "questions": len(rows)})
            print(f"{paper['paper_code']} {subject}: {len(rows)}/30 local crops", flush=True)
    (WORK / "reports" / "local-extraction.json").write_text(json.dumps(reports, indent=2) + "\n")
    incomplete = [item for item in reports if item["questions"] != 30]
    if incomplete:
        raise RuntimeError(f"{len(incomplete)} subject PDFs need anchor repair; see local-extraction.json")


if __name__ == "__main__":
    main()
