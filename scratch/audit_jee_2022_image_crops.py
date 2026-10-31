#!/usr/bin/env python3
"""
Comprehensive Image Crop Audit for all 24 papers of JEE Main 2022.
Audits:
- Physical validity, dimensions, aspect ratio
- Border clipping (ink touching outer borders)
- Unnecessary whitespace / padding
- Leftover option labels embedded in option crops: (1), (2), (3), (4), (A), (B), (C), (D)
- Question numbers or question text prose embedded in diagram crops
- Watermarks or coaching site stamps
- Missing image references & orphaned image files
"""

import os
import re
import sys
import glob
import json
import io
import csv
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import numpy as np

ROOT = Path("/Users/ateebfatmi/Desktop/prepzii")
TRANSCRIBED_DIR = ROOT / "scratch/jee2022/transcribed"
IMAGES_DIR = ROOT / "scratch/jee2022/images"
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

def inspect_image(image_path, is_option=False):
    """Audits a single image for cropping precision and artifacts."""
    issues = []
    if not image_path.exists():
        return ["FILE_NOT_FOUND"], {}

    try:
        with Image.open(image_path) as im:
            width, height = im.size
            rgba = im.convert("RGBA")
            arr = np.array(rgba)
    except Exception as e:
        return [f"CORRUPT_IMAGE: {str(e)}"], {}

    info = {
        "width": width,
        "height": height,
        "size_bytes": image_path.stat().st_size,
    }

    # 1. Dimensions
    if width < 15 or height < 15:
        issues.append(f"TINY_IMAGE: {width}x{height}")
    aspect = max(width / max(1, height), height / max(1, width))
    if aspect > 15:
        issues.append(f"EXTREME_ASPECT_RATIO: {width}x{height} (ratio {aspect:.1f})")

    # 2. Content & Ink
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]
    is_ink = (alpha >= 100) & (np.mean(rgb, axis=2) < 230)
    ink_pixels = int(np.sum(is_ink))
    info["ink_pixels"] = ink_pixels

    if ink_pixels < 25:
        issues.append(f"BLANK_OR_EMPTY_IMAGE: only {ink_pixels} ink pixels")
        return issues, info

    # 3. Border Clipping (ink touching edge boundaries)
    # Check top, bottom, left, right edge lines
    top_ink = int(np.sum(is_ink[0, :]))
    bottom_ink = int(np.sum(is_ink[-1, :]))
    left_ink = int(np.sum(is_ink[:, 0]))
    right_ink = int(np.sum(is_ink[:, -1]))

    clips = []
    # Only flag if significant ink touches border (e.g. cut-off diagram line or letter)
    # Diagrams may legitimately have axis lines, but large contiguous touching is often a bad crop
    if top_ink > 15: clips.append(f"top({top_ink}px)")
    if bottom_ink > 15: clips.append(f"bottom({bottom_ink}px)")
    if left_ink > 15: clips.append(f"left({left_ink}px)")
    if right_ink > 15: clips.append(f"right({right_ink}px)")

    if clips:
        issues.append(f"BORDER_CLIPPING: {', '.join(clips)}")

    # 4. Excessive White Margins
    # Find bounding box of ink
    y_indices, x_indices = np.where(is_ink)
    if len(y_indices) > 0 and len(x_indices) > 0:
        min_y, max_y = int(np.min(y_indices)), int(np.max(y_indices))
        min_x, max_x = int(np.min(x_indices)), int(np.max(x_indices))
        content_w = max_x - min_x + 1
        content_h = max_y - min_y + 1
        pad_top = min_y
        pad_bottom = height - 1 - max_y
        pad_left = min_x
        pad_right = width - 1 - max_x

        # If whitespace accounts for > 80% of image area and image is large
        content_area = content_w * content_h
        total_area = width * height
        if total_area > 40000 and (content_area / total_area) < 0.15:
            issues.append(f"EXCESSIVE_PADDING: content uses only {int(content_area/total_area*100)}% of image ({width}x{height})")

    # 5. OCR & Label Detection
    full_text, lines = ocr_image(image_path)
    info["ocr_text"] = full_text

    # Forbidden watermarks
    if FORBIDDEN_WATERMARKS.search(full_text):
        m = FORBIDDEN_WATERMARKS.search(full_text).group(0)
        issues.append(f"WATERMARK_FOUND: '{m}'")

    if is_option:
        # Check for option labels embedded inside option image
        for line in lines:
            lt = line["text"].strip()
            # Standalone label like (1), (2), (A), (B), (a), (b), 1., 2.
            if re.match(r"^\(?([1-4a-dA-D])\)?[\s.:)]*$", lt):
                issues.append(f"OPTION_LABEL_IN_IMAGE: '{lt}'")
                break
            # Option prefix like (1) CH3-CH2-...
            if re.match(r"^\(?([1-4a-dA-D])\)[\s.:]", lt):
                issues.append(f"OPTION_LABEL_PREFIX_IN_IMAGE: '{lt[:40]}'")
                break
    else:
        # Question diagram: check for residual question numbers or text prose
        for line in lines:
            lt = line["text"].strip()
            # If in top portion of image
            if line["top"] < height * 0.35:
                if re.match(r"^(?:q(?:uestion)?[\s.:-]*\d{1,2}\b|\d{1,2}[.)]\s+[A-Z])", lt, re.I):
                    issues.append(f"QUESTION_NUMBER_IN_IMAGE: '{lt[:50]}'")
                    break
            for pat in QUESTION_PROSE_PATTERNS[2:]:
                if re.search(pat, lt, re.I):
                    issues.append(f"RESIDUAL_PROSE_IN_IMAGE: '{lt[:60]}'")
                    break

    return issues, info

def main():
    print("=" * 70)
    print("JEE MAIN 2022 IMAGE CROPS AUDIT")
    print("=" * 70)

    # 1. Collect all referenced images from transcribed JSON files
    json_files = sorted(glob.glob(str(TRANSCRIBED_DIR / "JEE-MAIN-22-*.json")))
    print(f"Found {len(json_files)} transcribed subject files.")

    referenced_images = []
    questions_by_paper = {}
    for f in json_files:
        with open(f, "r") as fp:
            data = json.load(fp)
            for q in data:
                p_code = q.get("paper_code")
                q_num = q.get("question_number")
                subj = q.get("subject")
                
                # Question image
                if q.get("question_image"):
                    referenced_images.append({
                        "paper_code": p_code,
                        "question_number": q_num,
                        "subject": subj,
                        "field": "question_image",
                        "rel_path": q["question_image"],
                        "is_option": False,
                    })
                
                # Option images
                for opt in ["a", "b", "c", "d"]:
                    key = f"option_{opt}_image"
                    if q.get(key):
                        referenced_images.append({
                            "paper_code": p_code,
                            "question_number": q_num,
                            "subject": subj,
                            "field": key,
                            "rel_path": q[key],
                            "is_option": True,
                        })

    print(f"Total referenced images in JSON: {len(referenced_images)}")

    # 2. Check for disk images not referenced
    all_disk_images = sorted(glob.glob(str(IMAGES_DIR / "*/*.png")))
    print(f"Total image files on disk: {len(all_disk_images)}")

    ref_paths_set = set(str(ROOT / item["rel_path"]) for item in referenced_images)
    unreferenced_disk_images = [p for p in all_disk_images if p not in ref_paths_set]
    print(f"Unreferenced disk images: {len(unreferenced_disk_images)}")

    # 3. Parallel audit of all referenced images
    print("\nAuditing image dimensions, border clipping, labels, and watermarks...")
    
    def process_item(item):
        p = ROOT / item["rel_path"]
        issues, info = inspect_image(p, is_option=item["is_option"])
        return {
            **item,
            "path": str(p),
            "issues": issues,
            "info": info,
        }

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(process_item, referenced_images))

    # 4. Group results
    issue_counts = {}
    items_with_issues = []
    paper_issues = {}

    for res in results:
        paper = res["paper_code"]
        if paper not in paper_issues:
            paper_issues[paper] = []
        if res["issues"]:
            items_with_issues.append(res)
            paper_issues[paper].append(res)
            for iss in res["issues"]:
                # Group by prefix before colon
                category = iss.split(":")[0].strip()
                issue_counts[category] = issue_counts.get(category, 0) + 1

    print("\n" + "=" * 70)
    print("AUDIT RESULTS SUMMARY")
    print("=" * 70)
    print(f"Total Images Audited: {len(results)}")
    print(f"Images with Potential Issues: {len(items_with_issues)}")
    print(f"Issue Breakdown by Category:")
    for cat, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
        print(f"  - {cat}: {count}")

    # Output detailed report to JSON
    report_out = ROOT / "scratch/jee2022/reports/image-crop-audit-report.json"
    report_out.parent.mkdir(parents=True, exist_ok=True)
    with open(report_out, "w") as fp:
        json.dump({
            "total_images": len(results),
            "total_issues": len(items_with_issues),
            "issue_counts": issue_counts,
            "unreferenced_count": len(unreferenced_disk_images),
            "unreferenced_images": [os.path.relpath(p, ROOT) for p in unreferenced_disk_images[:50]],
            "issues": [
                {
                    "paper_code": it["paper_code"],
                    "question_number": it["question_number"],
                    "field": it["field"],
                    "rel_path": it["rel_path"],
                    "issues": it["issues"],
                    "dimensions": f"{it['info'].get('width', 0)}x{it['info'].get('height', 0)}",
                    "ocr_text": it["info"].get("ocr_text", "")[:100],
                }
                for it in items_with_issues
            ]
        }, fp, indent=2)

    print(f"\nDetailed report written to: {report_out}")

    # Print top issues for inspection
    if items_with_issues:
        print("\n" + "=" * 70)
        print("SAMPLE DETECTED ISSUES (FIRST 15):")
        print("=" * 70)
        for i, it in enumerate(items_with_issues[:15]):
            print(f"[{i+1}] {it['paper_code']} Q{it['question_number']} ({it['field']}):")
            print(f"    Path: {it['rel_path']}")
            print(f"    Issues: {', '.join(it['issues'])}")
            if it['info'].get('ocr_text'):
                print(f"    OCR: {it['info']['ocr_text'][:80]}")

if __name__ == "__main__":
    main()
