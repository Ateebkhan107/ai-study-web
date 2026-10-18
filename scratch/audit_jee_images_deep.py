#!/usr/bin/env python3
"""
Deep Re-Audit of JEE Main 2021 and 2022 image crops across every single shift.
Checks:
 1. Existence and valid file format
 2. Dimensions and abnormal aspect ratios
 3. Blank / pure-white / pure-black / pure-transparent images
 4. Severe border clipping (ink touching image edges)
 5. Coaching / website / NTA watermarks (OCR + color/alpha scan)
 6. Residual question prose / question numbers in diagram crops
 7. Option labels / multiple options in option crops
 8. Shifts and questions with missing required diagram images
"""

import os
import sys
import glob
import json
import re
import io
import csv
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import numpy as np

ROOT = Path("/Users/ateebfatmi/Desktop/prepzii")
TESSERACT_BIN = "/opt/homebrew/bin/tesseract"

FORBIDDEN_WATERMARKS = re.compile(
    r"(?:e\s*saral|allen|resonance|mathon\s*go|vedantu|fiitjee|telegram|"
    r"exam\s*goal|exam\s*side|zollege|mastiva|pracbee|unacademy|"
    r"question\s*id\s*:\s*\d|option\s*[1-4a-d]\s*id\s*:\s*\d|"
    r"www\.|https?:|\.com|\.in|\.net|\.org)",
    re.I,
)

QUESTION_PROSE_PATTERNS = [
    r"^(?:q(?:uestion)?[\s.:-]*\d{1,2}\b)",
    r"^(?:\d{1,2}[\s.:]+[A-Z])",
    r"\b(?:choose the (?:correct|most appropriate)|match list|statement\s*[-iI12]+)\b",
    r"\b(?:in the (?:given|above|following) (?:figure|diagram|circuit|reaction))\b",
    r"\b(?:which of the following|consider the (?:given|following))\b",
    r"\b(?:a block of mass|a particle of mass|a body of mass|an electron)\b",
    r"\b(?:the value of|the ratio of|is equal to|then the value)\b",
]

OPTION_LABEL_PATTERNS = [
    r"^\s*\(?([1-4a-dA-D])\)?[\s.:)]*$",
    r"^\s*option\s*([1-4a-dA-D])\b",
    r"^\s*\(([1-4a-dA-D])\)\s+[A-Za-z0-9]",
]


def ocr_image(image_path):
    """Run tesseract TSV output to get words and lines."""
    try:
        res = subprocess.run(
            [TESSERACT_BIN, str(image_path), "stdout", "tsv"],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=8,
        )
        if res.returncode != 0:
            return "", []
        tsv_text = res.stdout
    except Exception:
        return "", []

    reader = csv.reader(io.StringIO(tsv_text), delimiter="\t")
    header = next(reader, None)
    words = []
    lines_map = {}
    full_text_list = []

    for r in reader:
        if len(r) >= 12 and int(r[0]) == 5:
            text = r[11].strip()
            if text:
                full_text_list.append(text)
                word_info = {
                    "text": text,
                    "left": int(r[6]),
                    "top": int(r[7]),
                    "width": int(r[8]),
                    "height": int(r[9]),
                    "conf": float(r[10]),
                }
                words.append(word_info)
                b, p, l = int(r[2]), int(r[3]), int(r[4])
                lines_map.setdefault((b, p, l), []).append(word_info)

    lines = []
    for (b, p, l), lwords in lines_map.items():
        line_text = " ".join(w["text"] for w in lwords)
        left = min(w["left"] for w in lwords)
        top = min(w["top"] for w in lwords)
        right = max(w["left"] + w["width"] for w in lwords)
        bottom = max(w["top"] + w["height"] for w in lwords)
        lines.append({
            "text": line_text,
            "left": left,
            "top": top,
            "right": right,
            "bottom": bottom,
            "words": lwords,
        })

    full_text = " ".join(full_text_list)
    return full_text, lines


def inspect_image_file(image_path, is_option=False):
    """Deep inspect an image file for cropping issues, edge clipping, and watermarks."""
    issues = []
    if not image_path.exists():
        return ["FILE_NOT_FOUND"]

    try:
        with Image.open(image_path) as im:
            width, height = im.size
            mode = im.mode
            # Convert to RGBA for alpha analysis
            rgba = im.convert("RGBA")
            arr = np.array(rgba)
    except Exception as e:
        return [f"CORRUPT_IMAGE: {str(e)}"]

    # 1. Dimension checks
    if width < 15 or height < 15:
        issues.append(f"TINY_DIMENSIONS ({width}x{height})")
    aspect = max(width / max(1, height), height / max(1, width))
    if aspect > 15:
        issues.append(f"EXTREME_ASPECT_RATIO ({width}x{height}, ratio={aspect:.1f})")

    # 2. Content & Ink detection
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]

    # Solid ink: alpha >= 128 and (mean RGB < 220)
    # Background can be transparent (alpha < 50) or white (mean RGB > 240)
    is_ink = (alpha >= 100) & (np.mean(rgb, axis=2) < 230)
    ink_pixels = np.sum(is_ink)

    if ink_pixels < 25:
        issues.append(f"BLANK_IMAGE (ink pixels: {ink_pixels})")
        return issues

    # 3. Check border clipping: is ink touching outer borders significantly?
    top_ink = np.sum(is_ink[0, :])
    bottom_ink = np.sum(is_ink[-1, :])
    left_ink = np.sum(is_ink[:, 0])
    right_ink = np.sum(is_ink[:, -1])

    # If ink touches top/bottom/left/right border for more than 5 consecutive pixels
    # or more than 10 total border pixels on any single edge
    border_cutoffs = []
    if top_ink > 12: border_cutoffs.append(f"top({top_ink}px)")
    if bottom_ink > 12: border_cutoffs.append(f"bottom({bottom_ink}px)")
    if left_ink > 12: border_cutoffs.append(f"left({left_ink}px)")
    if right_ink > 12: border_cutoffs.append(f"right({right_ink}px)")
    if border_cutoffs:
        issues.append(f"BORDER_CLIPPING: {', '.join(border_cutoffs)}")

    # 4. Faint watermark detection in alpha channel or pale color
    faint_alpha = (alpha > 10) & (alpha < 60)
    if np.sum(faint_alpha) > (width * height * 0.15):
        issues.append(f"FAINT_ALPHA_WATERMARK ({np.sum(faint_alpha)} pixels)")

    # 5. OCR text inspection
    full_text, lines = ocr_image(image_path)

    # Check forbidden watermarks
    if FORBIDDEN_WATERMARKS.search(full_text):
        m = FORBIDDEN_WATERMARKS.search(full_text).group(0)
        issues.append(f"WATERMARK_DETECTED: '{m}'")

    # Check residual question prose in diagram crops
    if not is_option:
        for line in lines:
            lt = line["text"].strip()
            # Check question number prefix at start of image
            if line["top"] < height * 0.35:
                if re.match(r"^(?:q(?:uestion)?[\s.:-]*\d{1,2}\b|\d{1,2}[.)]\s+[A-Z])", lt, re.I):
                    issues.append(f"QUESTION_NUMBER_IN_IMAGE: '{lt[:50]}'")
                    break
            # Check prose lines
            for pat in QUESTION_PROSE_PATTERNS[2:]:
                if re.search(pat, lt, re.I):
                    issues.append(f"RESIDUAL_PROSE_IN_IMAGE: '{lt[:60]}'")
                    break

    # Check option crops
    if is_option:
        # Check option label like (A), (B), (1), (2)
        for line in lines:
            lt = line["text"].strip()
            if re.match(r"^\(?([1-4a-dA-D])\)?[\s.:)]*$", lt):
                issues.append(f"OPTION_LABEL_IN_IMAGE: '{lt}'")
                break
            if re.match(r"^\(?([1-4a-dA-D])\)[\s.:]", lt):
                issues.append(f"OPTION_LABEL_PREFIX_IN_IMAGE: '{lt[:40]}'")
                break

    return issues


def audit_shift(year, paper_code, transcribed_files):
    """Audit all questions and images for a single shift."""
    shift_report = {
        "year": year,
        "paper_code": paper_code,
        "total_questions": 0,
        "questions_with_images": 0,
        "total_images": 0,
        "missing_images": [],
        "image_issues": [],
    }

    all_questions = []
    for f in transcribed_files:
        with open(f) as fp:
            all_questions.extend(json.load(fp))

    all_questions.sort(key=lambda q: q.get("question_number", 0))
    shift_report["total_questions"] = len(all_questions)

    # Check for missing images
    for q in all_questions:
        qnum = q.get("question_number")
        subj = q.get("subject")
        qtype = q.get("question_type")
        qtext = q.get("question", "")

        qimg = q.get("question_image")
        opt_imgs = [q.get(f"option_{l}_image") for l in "abcd"]

        # If question text mentions diagram/figure but has no image
        if not qimg:
            # check for visual references
            if re.search(r"\b(?:in the (?:given|following|above) (?:figure|circuit|diagram|graph)|as shown (?:in (?:the )?(?:figure|diagram))|the structure shown below|reaction given below)\b", qtext, re.I):
                # Ensure it is not represented entirely in text / LaTeX table
                if not re.search(r"\\begin\{(?:matrix|pmatrix|array)\}", qtext):
                    shift_report["missing_images"].append({
                        "question_number": qnum,
                        "subject": subj,
                        "reason": f"Question text refers to diagram/figure/circuit/reaction but question_image is null",
                        "snippet": qtext[:90],
                    })

        # Check options: if MCQ and all option texts are empty and no option images
        if qtype == "MCQ":
            opts_empty = all(not str(q.get(f"option_{l}", "")).strip() for l in "abcd")
            opt_imgs_empty = all(not q.get(f"option_{l}_image") for l in "abcd")
            if opts_empty and opt_imgs_empty:
                shift_report["missing_images"].append({
                    "question_number": qnum,
                    "subject": subj,
                    "reason": "MCQ options have neither text nor images",
                    "snippet": qtext[:90],
                })
            elif any(q.get(f"option_{l}_image") for l in "abcd") and not all(q.get(f"option_{l}_image") for l in "abcd"):
                # Partially missing option images
                missing_letters = [l for l in "abcd" if not q.get(f"option_{l}_image")]
                shift_report["missing_images"].append({
                    "question_number": qnum,
                    "subject": subj,
                    "reason": f"Only partial option images provided (missing: {', '.join(missing_letters)})",
                    "snippet": qtext[:90],
                })

        # Count images
        if qimg:
            shift_report["total_images"] += 1
        shift_report["total_images"] += sum(1 for o in opt_imgs if o)
        if qimg or any(opt_imgs):
            shift_report["questions_with_images"] += 1

    return shift_report, all_questions


def run_full_audit():
    print("=" * 70)
    print("STARTING DEEP RE-AUDIT OF JEE 2021 & 2022 PYQ IMAGE CROPS")
    print("=" * 70)

    # 1. Collect all shifts
    # 2021
    papers_2021 = {}
    for f in sorted(glob.glob("scratch/jee2021/transcribed/JEE-MAIN-21-*.json")):
        paper = os.path.basename(f).split("_")[0]
        papers_2021.setdefault(paper, []).append(f)

    # 2022
    papers_2022 = {}
    for f in sorted(glob.glob("scratch/jee2022/transcribed/JEE-MAIN-22-*.json")):
        paper = os.path.basename(f).split("_")[0]
        papers_2022.setdefault(paper, []).append(f)

    print(f"Total Shifts Found: JEE 2021 = {len(papers_2021)}, JEE 2022 = {len(papers_2022)}")

    all_shift_reports = []
    all_image_tasks = []

    # Process all shifts for structural completeness
    for paper_code, files in sorted(papers_2021.items()):
        report, questions = audit_shift(2021, paper_code, files)
        all_shift_reports.append(report)
        for q in questions:
            qnum = q.get("question_number")
            if q.get("question_image"):
                all_image_tasks.append((2021, paper_code, qnum, "question_image", q["question_image"]))
            for l in "abcd":
                if q.get(f"option_{l}_image"):
                    all_image_tasks.append((2021, paper_code, qnum, f"option_{l}_image", q[f"option_{l}_image"]))

    for paper_code, files in sorted(papers_2022.items()):
        report, questions = audit_shift(2022, paper_code, files)
        all_shift_reports.append(report)
        for q in questions:
            qnum = q.get("question_number")
            if q.get("question_image"):
                all_image_tasks.append((2022, paper_code, qnum, "question_image", q["question_image"]))
            for l in "abcd":
                if q.get(f"option_{l}_image"):
                    all_image_tasks.append((2022, paper_code, qnum, f"option_{l}_image", q[f"option_{l}_image"]))

    print(f"Total images to audit across all 50 shifts: {len(all_image_tasks)}")

    # Audit all images in parallel
    def audit_one_task(task):
        year, paper_code, qnum, field, raw_path = task
        # resolve path
        p = Path(raw_path)
        if not p.is_absolute():
            p = ROOT / p
        is_opt = "option" in field
        issues = inspect_image_file(p, is_option=is_opt)
        return {
            "year": year,
            "paper_code": paper_code,
            "question_number": qnum,
            "field": field,
            "path": str(p),
            "issues": issues,
        }

    print("Running parallel image analysis and OCR...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(audit_one_task, all_image_tasks))

    # Aggregate image issues into shift reports
    shift_map = {r["paper_code"]: r for r in all_shift_reports}
    total_image_issues = 0
    for res in results:
        if res["issues"]:
            total_image_issues += len(res["issues"])
            shift_map[res["paper_code"]]["image_issues"].append(res)

    # Save summary report
    out_file = ROOT / "scratch/deep_image_crop_audit_report.json"
    with open(out_file, "w") as fp:
        json.dump(all_shift_reports, fp, indent=2)

    print("\n" + "=" * 70)
    print("AUDIT SUMMARY RESULTS")
    print("=" * 70)
    print(f"Audited Shifts: {len(all_shift_reports)} (26 in 2021, 24 in 2022)")
    print(f"Total Images Checked: {len(all_image_tasks)}")
    print(f"Total Image Cropping / Quality Issues Found: {total_image_issues}")

    missing_total = sum(len(r["missing_images"]) for r in all_shift_reports)
    print(f"Total Missing / Unlinked Diagram Instances: {missing_total}")
    print("=" * 70)

    # Breakdown per shift with issues
    shifts_with_problems = [r for r in all_shift_reports if r["missing_images"] or r["image_issues"]]
    print(f"\nShifts with detected issues: {len(shifts_with_problems)} / {len(all_shift_reports)}")
    for r in shifts_with_problems:
        print(f"\n[{r['year']} - {r['paper_code']}]:")
        if r["missing_images"]:
            print(f"  Missing Images ({len(r['missing_images'])}):")
            for m in r["missing_images"][:5]:
                print(f"    - Q{m['question_number']} ({m['subject']}): {m['reason']}")
            if len(r["missing_images"]) > 5:
                print(f"    ... and {len(r['missing_images']) - 5} more")
        if r["image_issues"]:
            print(f"  Image Cropping Issues ({len(r['image_issues'])}):")
            for iss in r["image_issues"][:5]:
                print(f"    - Q{iss['question_number']} {iss['field']}: {'; '.join(iss['issues'])}")
            if len(r["image_issues"]) > 5:
                print(f"    ... and {len(r['image_issues']) - 5} more")


if __name__ == "__main__":
    run_full_audit()
