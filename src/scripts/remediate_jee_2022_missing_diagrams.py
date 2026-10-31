#!/usr/bin/env python3
"""
Extract all 26 missing physics diagrams for JEE Main 2022.
"""
import json
import shutil
from pathlib import Path
from PIL import Image, ImageOps, ImageChops
import numpy as np

ROOT = Path.cwd()
TMP_2022 = ROOT / "tmp/jee-main-2022"
SCRATCH_2022 = ROOT / "scratch/jee2022"
IMAGES_DIR = SCRATCH_2022 / "images"

def trim_and_pad(im: Image.Image, padding: int = 12) -> Image.Image:
    gray = ImageOps.grayscale(im)
    diff = ImageChops.difference(gray, Image.new("L", gray.size, 255))
    bbox = diff.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    return im.crop((
        max(0, l - padding),
        max(0, t - padding),
        min(im.width, r + padding),
        min(im.height, b + padding)
    ))

def strip_table_grid_lines(arr: np.ndarray) -> np.ndarray:
    clean = arr.copy()
    h_lines = np.where(np.sum(clean < 200, axis=1) > 0.7 * clean.shape[1])[0]
    for h in h_lines:
        clean[max(0, h - 2):min(clean.shape[0], h + 3), :] = 255
    v_lines = np.where(np.sum(clean < 200, axis=0) > 0.7 * clean.shape[0])[0]
    for v in v_lines:
        clean[:, max(0, v - 2):min(clean.shape[1], v + 3)] = 255
    return clean

def extract_diagram_from_source(source_path: Path, y_start_pct=0.25, y_end_pct=0.85, padding=12) -> Image.Image:
    im = Image.open(source_path).convert("L")
    arr = np.array(im)
    h, w = arr.shape
    y1 = int(h * y_start_pct)
    y2 = int(h * y_end_pct)
    cell = arr[y1:y2, :]
    clean_cell = strip_table_grid_lines(cell)
    diff = clean_cell < 200
    ys, xs = np.where(diff)
    if len(ys) == 0:
        return Image.fromarray(clean_cell).convert("RGB")
    ymin, ymax = ys.min(), ys.max()
    xmin, xmax = xs.min(), xs.max()
    crop_arr = clean_cell[
        max(0, ymin - padding):min(clean_cell.shape[0], ymax + padding),
        max(0, xmin - padding):min(clean_cell.shape[1], xmax + padding)
    ]
    return Image.fromarray(crop_arr).convert("RGB")

# List of 26 questions
MISSING = [
    ("JEE-MAIN-22-24JUN-S1", 20),
    ("JEE-MAIN-22-24JUN-S1", 24),
    ("JEE-MAIN-22-24JUN-S1", 28),
    ("JEE-MAIN-22-25JUN-S1", 28),
    ("JEE-MAIN-22-25JUN-S2", 23),
    ("JEE-MAIN-22-25JUN-S2", 30),
    ("JEE-MAIN-22-26JUN-S1", 10),
    ("JEE-MAIN-22-26JUN-S1", 19),
    ("JEE-MAIN-22-26JUN-S1", 23),
    ("JEE-MAIN-22-26JUN-S1", 26),
    ("JEE-MAIN-22-26JUN-S1", 29),
    ("JEE-MAIN-22-26JUN-S1", 30),
    ("JEE-MAIN-22-25JUL-S2", 5),
    ("JEE-MAIN-22-25JUL-S2", 12),
    ("JEE-MAIN-22-25JUL-S2", 26),
    ("JEE-MAIN-22-26JUL-S1", 1),
    ("JEE-MAIN-22-26JUL-S1", 25),
    ("JEE-MAIN-22-26JUL-S1", 26),
    ("JEE-MAIN-22-26JUL-S1", 28),
    ("JEE-MAIN-22-26JUL-S1", 30),
    ("JEE-MAIN-22-26JUL-S2", 15),
    ("JEE-MAIN-22-26JUL-S2", 16),
    ("JEE-MAIN-22-26JUL-S2", 26),
    ("JEE-MAIN-22-27JUL-S1", 7),
    ("JEE-MAIN-22-27JUL-S2", 20),
    ("JEE-MAIN-22-28JUL-S1", 25),
]

def main():
    print("Extracting and saving missing diagrams...")
    for paper, qnum in MISSING:
        dest_dir = IMAGES_DIR / paper
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_file = dest_dir / f"q{qnum}.png"

        # Check if pre-cropped in tmp crops/
        tmp_crop = TMP_2022 / paper / "crops" / f"q{qnum}.png"
        src_crop = TMP_2022 / paper / "source-crops" / f"q{qnum}.png"

        # If tmp_crop exists and is well-sized (not full page), copy it directly
        if tmp_crop.exists() and Image.open(tmp_crop).width < 1000:
            shutil.copy2(tmp_crop, dest_file)
            print(f"  [FROM CROPS] {paper} Q{qnum} -> {dest_file} (size: {Image.open(dest_file).size})")
        elif src_crop.exists():
            # Extract diagram region from source-crop
            extracted = extract_diagram_from_source(src_crop)
            extracted.save(dest_file)
            print(f"  [EXTRACTED]  {paper} Q{qnum} -> {dest_file} (size: {extracted.size})")
        else:
            print(f"  [MISSING]    {paper} Q{qnum} has neither crop nor source-crop!")

        # Update JSON file
        json_path = SCRATCH_2022 / "transcribed" / f"{paper}_physics.json"
        if json_path.exists():
            with open(json_path) as f:
                data = json.load(f)
            updated = False
            for q in data:
                if q["question_number"] == qnum:
                    q["question_image"] = f"scratch/jee2022/images/{paper}/q{qnum}.png"
                    updated = True
                    break
            if updated:
                with open(json_path, "w") as f:
                    json.dump(data, f, indent=2)

    print("Diagram extraction and JSON linking complete.")

if __name__ == "__main__":
    main()
