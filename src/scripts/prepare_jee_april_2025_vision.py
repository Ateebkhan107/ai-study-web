"""Prepare JEE Main 2025 2-April scans as exact, answer-free question crops.

Uses macOS Vision for locating numbered questions and their `Ans.` line. The
rendered crop (not OCR text) is the source of truth for formulae and tables.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "tmp" / "jee-main-2025-april"
PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
OCR = ROOT / "tmp" / "pdfs" / "vision_ocr"
PAPERS = [
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file.pdf"), "2025-04-02", 1),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-2.pdf"), "2025-04-02", 2),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-3.pdf"), "2025-04-03", 1),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-4.pdf"), "2025-04-03", 2),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-5.pdf"), "2025-04-04", 1),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-6.pdf"), "2025-04-04", 2),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-7.pdf"), "2025-04-07", 1),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-8.pdf"), "2025-04-07", 2),
    (Path("/Users/ateebfatmi/Downloads/selfstudys_com_file-9.pdf"), "2025-04-08", 2),
]
EXTRA_TOP_MARGIN = {("2025-04-04", 1, 22): 120}
MANUAL_CROPS = {
    # Vision missed the printed 7; verified directly against page 4.
    ("2025-04-04", 1, 7): (4, 75, 210, 820, 420),
}


def q_type(number: int) -> str:
    return "MCQ" if number % 25 in range(1, 21) else "NUMERICAL"


def subject(number: int) -> str:
    return "Maths" if number <= 25 else "Physics" if number <= 50 else "Chemistry"


def observations(image: Path):
    output = subprocess.check_output([str(OCR), str(image)], text=True)
    result = []
    for line in output.splitlines():
        try:
            text, x, y, width, height = line.rsplit("\t", 4)
            result.append({"text": text.strip(), "x": float(x), "y": float(y), "width": float(width), "height": float(height)})
        except ValueError:
            continue
    return result


def column(item):
    return "left" if item["x"] < 0.45 else "right"


def top(item, height):
    return round((1 - item["y"] - item["height"]) * height)


def render(pdf: Path, pages: Path):
    if not any(pages.glob("*.png")):
        pages.mkdir(parents=True, exist_ok=True)
        subprocess.run([PDFTOPPM, "-png", "-r", "200", str(pdf), str(pages / "page")], check=True)
    return sorted(pages.glob("*.png"))


def prepare(pdf: Path, date: str, shift: int):
    paper = OUT / f"{date}-shift-{shift}"
    manifest_path = paper / "manifest.json"
    if manifest_path.exists() and "--force" not in sys.argv:
        cached = json.loads(manifest_path.read_text())
        if len(cached) == 75:
            return cached
    pages = render(pdf, paper / "pages")
    crops = paper / "questions"
    crops.mkdir(parents=True, exist_ok=True)
    found = {}
    for page_index, page in enumerate(pages, 1):
        image = Image.open(page)
        width, height = image.size
        items = observations(page)
        markers = []
        answers = []
        for item in items:
            # Vision commonly joins the question number to the opening words
            # (for example, "5. Let A = ..."), so accept a leading marker.
            match = re.match(r"^\s*(\d{1,2})\.", item["text"])
            if match and 1 <= int(match.group(1)) <= 75 and item["x"] < 0.57:
                markers.append((int(match.group(1)), item))
            if re.match(r"^ans\.?", item["text"], re.I):
                answers.append(item)
        for number, marker in markers:
            if number in found:
                continue
            # Keep adjacent solutions out of normal crops. A tiny, audited
            # exception preserves the top row of one matrix question.
            start = top(marker, height) - EXTRA_TOP_MARGIN.get((date, shift, number), 20)
            same_column_answers = [a for a in answers if column(a) == column(marker) and top(a, height) > start]
            if not same_column_answers:
                continue
            answer = min(same_column_answers, key=lambda a: top(a, height))
            end = top(answer, height) - 10
            if end - start < 45:
                continue
            left, right = (70, width // 2 - 12) if column(marker) == "left" else (width // 2 + 12, width - 70)
            crop_path = crops / f"q{number:02}.png"
            image.crop((left, max(0, start), right, min(height, end))).save(crop_path)
            next_markers = [m for _, m in markers if column(m) == column(marker) and top(m, height) > top(answer, height)]
            solution_end = min((top(m, height) - 16 for m in next_markers), default=height - 70)
            solutions = paper / "solutions"
            solutions.mkdir(parents=True, exist_ok=True)
            solution_path = solutions / f"q{number:02}.png"
            image.crop((left, max(0, top(answer, height) - 12), right, min(height - 70, solution_end))).save(solution_path)
            answer_match = re.search(r"\(?([1-4])\)?", answer["text"])
            answer_value = int(answer_match.group(1)) if answer_match else None
            found[number] = {
                "number": number,
                "subject": subject(number),
                "question_type": q_type(number),
                "correct_option": "abcd"[answer_value - 1] if answer_value and q_type(number) == "MCQ" else None,
                "numerical_answer": answer_value if answer_value and q_type(number) == "NUMERICAL" else None,
                "image_path": str(crop_path),
                "solution_path": str(solution_path),
                "source_page": page_index,
            }

        # A small number of questions continue beyond a column or page, so
        # Vision sees their number but not the matching answer label. Preserve
        # the visible question portion rather than dropping that PYQ entirely.
        for number, marker in markers:
            if number in found:
                continue
            start = top(marker, height) - EXTRA_TOP_MARGIN.get((date, shift, number), 20)
            left, right = (70, width // 2 - 12) if column(marker) == "left" else (width // 2 + 12, width - 70)
            crop_path = crops / f"q{number:02}.png"
            image.crop((left, max(0, start), right, height - 70)).save(crop_path)
            found[number] = {
                "number": number,
                "subject": subject(number),
                "question_type": q_type(number),
                "correct_option": None,
                "numerical_answer": None,
                "image_path": str(crop_path),
                "source_page": page_index,
            }
        print(f"{date} Shift {shift}, page {page_index}/{len(pages)}: {len(found)} question crops")
    # If Vision misses a printed number entirely, retain the source page as a
    # final fallback. This guarantees a viewable PYQ image while keeping the
    # normal, tightly cropped image path for every detected question.
    for number in range(1, 76):
        if number in found:
            continue
        earlier = [entry for key, entry in found.items() if key < number]
        later = [entry for key, entry in found.items() if key > number]
        source_page = (earlier[-1] if earlier else later[0])["source_page"]
        page = pages[source_page - 1]
        crop_path = crops / f"q{number:02}.png"
        Image.open(page).save(crop_path)
        found[number] = {
            "number": number,
            "subject": subject(number),
            "question_type": q_type(number),
            "correct_option": None,
            "numerical_answer": None,
            "image_path": str(crop_path),
            "source_page": source_page,
        }
    for (crop_date, crop_shift, number), (source_page, left, upper, right, lower) in MANUAL_CROPS.items():
        if (crop_date, crop_shift) != (date, shift):
            continue
        crop_path = crops / f"q{number:02}.png"
        Image.open(pages[source_page - 1]).crop((left, upper, right, lower)).save(crop_path)
        found[number] = {
            "number": number,
            "subject": subject(number),
            "question_type": q_type(number),
            "correct_option": "a",
            "numerical_answer": None,
            "image_path": str(crop_path),
            "source_page": source_page,
        }
    manifest = [found[number] for number in sorted(found)]
    manifest_path.write_text(json.dumps(manifest, indent=2))
    return manifest


selection = sys.argv[1] if len(sys.argv) > 1 else None
chosen = [paper for paper in PAPERS if selection in (None, f"{paper[1]}-shift-{paper[2]}")]
if not chosen:
    raise SystemExit(f"Unknown paper selection: {selection}")
all_results = {f"{date}-shift{shift}": len(prepare(pdf, date, shift)) for pdf, date, shift in chosen}
print(json.dumps(all_results))
