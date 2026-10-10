"""Remap exact official crops to Prepzii's Physics/Chemistry/Mathematics order.

NTA's three 30-question blocks are not in a consistent subject order across shifts.
The already-created crop manifest retains source_number, allowing a lossless remap.
"""

import json
import re
import shutil
from pathlib import Path

ROOT = Path.cwd() / "tmp" / "jee-main-2022"
OFFSETS = {"physics": 0, "chemistry": 30, "mathematics": 60}
ORDER_OVERRIDES = {
    "JEE-MAIN-22-28JUL-S2": {1: "physics", 31: "chemistry", 61: "mathematics"},
    "JEE-MAIN-22-30JUL-S2": {1: "physics", 31: "chemistry", 61: "mathematics"},
}


def detect_subject(text):
    lowered = text.lower()
    matches = [subject for subject in OFFSETS if re.search(rf"\b{subject}\b", lowered)]
    return matches[-1] if matches else None


for paper_dir in sorted(ROOT.glob("JEE-MAIN-22-*")):
    manifest_file = paper_dir / "official-crop-manifest.json"
    crop_dir = paper_dir / "source-crops"
    ocr_dir = paper_dir / "official-ocr"
    if not manifest_file.exists() or not crop_dir.exists() or not ocr_dir.exists():
        continue
    manifest = json.loads(manifest_file.read_text())
    by_source = {row["source_number"]: row for row in manifest}
    subjects = {}
    for source_start in (1, 31, 61):
        current_number = by_source[source_start]["question_number"]
        text_file = ocr_dir / f"q{current_number}.txt"
        subject = detect_subject(text_file.read_text(errors="ignore")) if text_file.exists() else None
        subjects[source_start] = subject
    if paper_dir.name in ORDER_OVERRIDES:
        subjects = ORDER_OVERRIDES[paper_dir.name]
    missing = [source_start for source_start, subject in subjects.items() if subject is None]
    if len(missing) == 1:
        subjects[missing[0]] = (set(OFFSETS) - set(subjects.values())).pop()
    elif missing:
        # The common NTA order is Mathematics, Physics, Chemistry. Some scans omit
        # all three footer labels from OCR; the exceptional order is still detected
        # whenever the labels are present (notably 28 July Shift 2).
        subjects = {1: "mathematics", 31: "physics", 61: "chemistry"}
    if any(subject is None for subject in subjects.values()) or len(set(subjects.values())) != 3:
        raise RuntimeError(f"{paper_dir.name}: invalid subject blocks {subjects}")

    crop_temp = paper_dir / "source-crops-remapped"
    ocr_temp = paper_dir / "official-ocr-remapped"
    if crop_temp.exists():
        shutil.rmtree(crop_temp)
    if ocr_temp.exists():
        shutil.rmtree(ocr_temp)
    crop_temp.mkdir()
    ocr_temp.mkdir()
    remapped = []
    for source_number in range(1, 91):
        row = by_source[source_number]
        old_number = row["question_number"]
        block_start = ((source_number - 1) // 30) * 30 + 1
        new_number = OFFSETS[subjects[block_start]] + ((source_number - 1) % 30) + 1
        shutil.copy2(crop_dir / f"q{old_number}.png", crop_temp / f"q{new_number}.png")
        old_ocr = ocr_dir / f"q{old_number}.txt"
        if old_ocr.exists():
            shutil.copy2(old_ocr, ocr_temp / f"q{new_number}.txt")
        remapped.append({**row, "question_number": new_number, "crop": str(crop_dir / f"q{new_number}.png")})
    shutil.rmtree(crop_dir)
    crop_temp.rename(crop_dir)
    shutil.rmtree(ocr_dir)
    ocr_temp.rename(ocr_dir)
    remapped.sort(key=lambda row: row["question_number"])
    manifest_file.write_text(json.dumps(remapped, indent=2) + "\n")
    print(f"{paper_dir.name}: {subjects}")
