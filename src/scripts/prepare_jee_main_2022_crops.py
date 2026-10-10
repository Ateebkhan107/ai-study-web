"""Render and crop all JEE Main 2022 Paper 1 questions without solutions."""

import json
import re
import csv
import io
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
WORK = ROOT / "tmp" / "jee-main-2022"
SOURCES = WORK / "sources"
PDFTOPPM = Path("/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftoppm")
SUBJECT_OFFSETS = {"physics": 0, "chemistry": 30, "mathematics": 60}


def observations(image_path: Path):
    output = subprocess.check_output(
        ["tesseract", str(image_path), "stdout", "--psm", "3", "tsv"],
        text=True, stderr=subprocess.DEVNULL,
    )
    width, height = Image.open(image_path).size
    lines = {}
    for row in csv.DictReader(io.StringIO(output), delimiter="\t"):
        if row.get("level") != "5" or not row.get("text", "").strip():
            continue
        key = (row["block_num"], row["par_num"], row["line_num"])
        lines.setdefault(key, []).append(row)
    result = []
    for words in lines.values():
        left = min(int(word["left"]) for word in words)
        top = min(int(word["top"]) for word in words)
        right = max(int(word["left"]) + int(word["width"]) for word in words)
        bottom = max(int(word["top"]) + int(word["height"]) for word in words)
        result.append({
            "text": " ".join(word["text"] for word in words),
            "x": left / width, "y": 1 - bottom / height,
            "width": (right - left) / width, "height": (bottom - top) / height,
        })
    return result


def pixel_top(item, height):
    return round((1 - item["y"] - item["height"]) * height)


def render(pdf_path: Path, pages_dir: Path):
    existing = sorted(pages_dir.glob("page-*.png"))
    if existing:
        return existing
    pages_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        str(PDFTOPPM), "-png", "-r", "180", str(pdf_path), str(pages_dir / "page")
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return sorted(pages_dir.glob("page-*.png"))


def extract_answer(text):
    match = re.search(r"\(([A-D1-4]|-?\d+(?:\.\d+)?)\)", text, re.I)
    if not match:
        return None
    value = match.group(1).lower()
    return {"1": "a", "2": "b", "3": "c", "4": "d"}.get(value, value)


def crop_solution_pdf(paper_code: str, subject: str, pdf_path: Path):
    offset = SUBJECT_OFFSETS[subject]
    paper_dir = WORK / paper_code
    pages = render(pdf_path, paper_dir / "pages" / subject)
    crops_dir = paper_dir / "crops"
    crops_dir.mkdir(parents=True, exist_ok=True)
    found = {}
    for page_number, page_path in enumerate(pages, 1):
        image = Image.open(page_path)
        width, height = image.size
        items = observations(page_path)
        markers = []
        answers = []
        for item in items:
            marker = re.match(r"^(\d{1,2})\s*[.)]", item["text"])
            if marker and 1 <= int(marker.group(1)) <= 30:
                markers.append((int(marker.group(1)), item))
            if re.match(r"^(official\s+)?ans", item["text"], re.I):
                answers.append(item)
        for local_number, marker in markers:
            global_number = offset + local_number
            if global_number in found:
                continue
            left_column = marker["x"] < 0.48
            left = 58 if left_column else width // 2 + 8
            right = width // 2 - 8 if left_column else width - 58
            start = max(0, pixel_top(marker, height) - 16)
            candidates = [
                item for item in answers
                if (item["x"] < 0.48) == left_column and pixel_top(item, height) > start
            ]
            if not candidates:
                continue
            answer = min(candidates, key=lambda item: pixel_top(item, height))
            end = pixel_top(answer, height) - 8
            if end - start < 35:
                continue
            crop_path = crops_dir / f"q{global_number}.png"
            image.crop((left, start, right, min(end, height - 55))).save(crop_path)
            found[global_number] = {
                "question_number": global_number,
                "source_number": local_number,
                "subject": subject.capitalize() if subject != "mathematics" else "Mathematics",
                "question_type": "NUMERICAL" if local_number > 20 else "MCQ",
                "correct_option": extract_answer(answer["text"]),
                "crop": str(crop_path),
                "source_page": page_number,
                "source": str(pdf_path),
            }
        print(f"{paper_code} {subject} page {page_number}/{len(pages)}: {len(found)}/30")
    return found


def source_to_global(number):
    if number <= 30:
        return number + 60, "Mathematics", number
    if number <= 60:
        return number - 30, "Physics", number - 30
    return number - 30, "Chemistry", number - 60


def crop_official_pdf(paper_code: str, pdf_path: Path):
    paper_dir = WORK / paper_code
    pages = render(pdf_path, paper_dir / "pages" / "official")
    crops_dir = paper_dir / "crops"
    crops_dir.mkdir(parents=True, exist_ok=True)
    found = {}
    for page_number, page_path in enumerate(pages, 1):
        image = Image.open(page_path)
        width, height = image.size
        items = observations(page_path)
        markers = []
        for item in items:
            match = re.match(r"^Q\s*[:.]\s*(\d{1,2})\b", item["text"], re.I)
            if match and 1 <= int(match.group(1)) <= 90:
                markers.append((int(match.group(1)), item))
        markers.sort(key=lambda row: pixel_top(row[1], height))
        for index, (source_number, marker) in enumerate(markers):
            global_number, subject, local_number = source_to_global(source_number)
            start = max(0, pixel_top(marker, height) - 8)
            end = pixel_top(markers[index + 1][1], height) - 10 if index + 1 < len(markers) else height - 18
            if end - start < 35:
                continue
            crop_path = crops_dir / f"q{global_number}.png"
            image.crop((8, start, width - 8, end)).save(crop_path)
            found[global_number] = {
                "question_number": global_number,
                "source_number": source_number,
                "subject": subject,
                "question_type": "NUMERICAL" if local_number > 20 else "MCQ",
                "correct_option": None,
                "crop": str(crop_path),
                "source_page": page_number,
                "source": str(pdf_path),
            }
        print(f"{paper_code} official page {page_number}/{len(pages)}: {len(found)}/90")
    return found


def process_paper(paper_dir: Path):
    paper_code = paper_dir.name
    official = paper_dir / "official.pdf"
    if "--render-only" in sys.argv:
        if official.exists():
            render(official, WORK / paper_code / "pages" / "official")
        else:
            for subject in SUBJECT_OFFSETS:
                render(paper_dir / f"{subject}.pdf", WORK / paper_code / "pages" / subject)
        print(json.dumps({"paper_code": paper_code, "rendered": True}))
        return 0
    if official.exists():
        found = crop_official_pdf(paper_code, official)
    else:
        found = {}
        for subject in SUBJECT_OFFSETS:
            found.update(crop_solution_pdf(paper_code, subject, paper_dir / f"{subject}.pdf"))
    manifest = [found[number] for number in sorted(found)]
    output = WORK / paper_code / "crop-manifest.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"paper_code": paper_code, "questions": len(manifest), "missing": [n for n in range(1, 91) if n not in found]}))
    return len(manifest)


selection = next((arg for arg in sys.argv[1:] if not arg.startswith("--")), None)
paper_dirs = sorted(path for path in SOURCES.iterdir() if path.is_dir() and (selection is None or path.name == selection))
if not paper_dirs:
    raise SystemExit(f"No matching paper: {selection}")
results = {paper_dir.name: process_paper(paper_dir) for paper_dir in paper_dirs}
print(json.dumps(results, indent=2))
