#!/usr/bin/env python3
"""
Precision Image Cropper for JEE Main 2022.
Applies:
1. Exact diagram isolation for all 27 questions that contained question prose or options in their crops.
2. Tight bounding-box trimming for oversized option images (26JUL-S1 Q43, 25JUL-S2 Q43).
3. Shaving of 1-pixel table divider lines (gray line 128) touching image edges across 30JUL-S2 and 27JUL-S2.
"""

from pathlib import Path
from PIL import Image, ImageOps, ImageChops
import numpy as np

ROOT = Path("/Users/ateebfatmi/Desktop/prepzii")
IMAGES_DIR = ROOT / "scratch/jee2022/images"

# Precision Y-ranges (y_start, y_end) for diagram extraction from raw question crops
DIAGRAM_RANGES = {
    ("JEE-MAIN-22-24JUN-S1", "q20.png"): (162, None),
    ("JEE-MAIN-22-24JUN-S1", "q24.png"): (165, None),
    ("JEE-MAIN-22-24JUN-S1", "q28.png"): (318, 530),
    ("JEE-MAIN-22-25JUN-S1", "q28.png"): (68, None),
    ("JEE-MAIN-22-25JUN-S2", "q23.png"): (122, None),
    ("JEE-MAIN-22-25JUN-S2", "q30.png"): (122, 510),
    ("JEE-MAIN-22-26JUN-S1", "q10.png"): (342, 560),
    ("JEE-MAIN-22-26JUN-S1", "q19.png"): (168, 442),
    ("JEE-MAIN-22-26JUN-S1", "q23.png"): (192, None),
    ("JEE-MAIN-22-26JUN-S1", "q26.png"): (112, None),
    ("JEE-MAIN-22-26JUN-S1", "q29.png"): (218, None),
    ("JEE-MAIN-22-26JUN-S1", "q30.png"): (312, None),
    ("JEE-MAIN-22-25JUL-S2", "q5.png"):  (125, 512),
    ("JEE-MAIN-22-25JUL-S2", "q12.png"): (115, 502),
    ("JEE-MAIN-22-25JUL-S2", "q26.png"): (75, None),
    ("JEE-MAIN-22-26JUL-S1", "q1.png"):  (378, 628),
    ("JEE-MAIN-22-26JUL-S1", "q25.png"): (152, None),
    ("JEE-MAIN-22-26JUL-S1", "q28.png"): (135, 642),
    ("JEE-MAIN-22-26JUL-S1", "q30.png"): (82, None),
    ("JEE-MAIN-22-26JUL-S2", "q15.png"): (252, 542),
    ("JEE-MAIN-22-26JUL-S2", "q16.png"): (208, 522),
    ("JEE-MAIN-22-26JUL-S2", "q26.png"): (302, None),
    ("JEE-MAIN-22-27JUL-S1", "q7.png"):  (238, None),
    ("JEE-MAIN-22-27JUL-S2", "q20.png"): (72, None),
    ("JEE-MAIN-22-28JUL-S1", "q25.png"): (172, None),
    ("JEE-MAIN-22-29JUL-S1", "q48.png"): (62, None),
    ("JEE-MAIN-22-29JUL-S2", "q14.png"): (88, None),
}

def remove_edge_border_lines(arr: np.ndarray) -> np.ndarray:
    """Shaves off solid divider lines (e.g. gray line 128 or black line) on outer 3 pixels."""
    h, w = arr.shape[:2]
    # Check top rows
    top_shave = 0
    for r in range(min(5, h)):
        row_vals = arr[r, :, :3]
        if np.mean(row_vals < 200) > 0.6:  # >60% border line
            top_shave = r + 1
        else:
            break
            
    # Check bottom rows
    bot_shave = 0
    for r in range(min(5, h)):
        row_idx = h - 1 - r
        row_vals = arr[row_idx, :, :3]
        if np.mean(row_vals < 200) > 0.6:
            bot_shave = r + 1
        else:
            break

    # Check left cols
    left_shave = 0
    for c in range(min(5, w)):
        col_vals = arr[:, c, :3]
        if np.mean(col_vals < 200) > 0.6:
            left_shave = c + 1
        else:
            break

    # Check right cols
    right_shave = 0
    for c in range(min(5, w)):
        col_idx = w - 1 - c
        col_vals = arr[:, col_idx, :3]
        if np.mean(col_vals < 200) > 0.6:
            right_shave = c + 1
        else:
            break

    y1 = top_shave
    y2 = h - bot_shave
    x1 = left_shave
    x2 = w - right_shave

    if y2 > y1 and x2 > x1:
        return arr[y1:y2, x1:x2]
    return arr

def trim_and_pad(im: Image.Image, padding: int = 12) -> Image.Image:
    """Tightly bounds ink and adds clean white padding."""
    arr = np.array(im.convert("RGB"))
    arr = remove_edge_border_lines(arr)
    
    # Threshold for ink pixels
    is_ink = np.mean(arr, axis=2) < 235
    ys, xs = np.where(is_ink)
    if len(ys) == 0 or len(xs) == 0:
        return Image.fromarray(arr)
        
    ymin, ymax = int(ys.min()), int(ys.max())
    xmin, xmax = int(xs.min()), int(xs.max())
    
    # Crop to ink + padding
    h, w = arr.shape[:2]
    c_y1 = max(0, ymin - padding)
    c_y2 = min(h, ymax + padding + 1)
    c_x1 = max(0, xmin - padding)
    c_x2 = min(w, xmax + padding + 1)
    
    cropped = arr[c_y1:c_y2, c_x1:c_x2]
    return Image.fromarray(cropped)

def recrop_diagrams():
    print("Recropping diagrams to isolate graphics...")
    for (paper, fname), (y_start, y_end) in DIAGRAM_RANGES.items():
        p = IMAGES_DIR / paper / fname
        if not p.exists():
            print(f"  Missing: {p}")
            continue
            
        im = Image.open(p)
        w, h = im.size
        y1 = y_start if y_start is not None else 0
        y2 = y_end if y_end is not None else h
        
        # Crop region
        region = im.crop((0, y1, w, y2))
        clean = trim_and_pad(region, padding=14)
        clean.save(p)
        print(f"  [RE-CROPPED] {paper}/{fname}: original {w}x{h} -> new {clean.width}x{clean.height}")

def clean_option_images():
    print("\nTightening oversized option crops & removing border lines...")
    # 26JUL-S1 Q43 options
    for opt in ["a", "b", "c", "d"]:
        p = IMAGES_DIR / "JEE-MAIN-22-26JUL-S1" / f"q43_opt_{opt}.png"
        if p.exists():
            im = Image.open(p)
            w, h = im.size
            clean = trim_and_pad(im, padding=12)
            clean.save(p)
            print(f"  [TIGHTENED] 26JUL-S1 q43_opt_{opt}: {w}x{h} -> {clean.width}x{clean.height}")

    # 25JUL-S2 Q43 options
    for opt in ["a", "b", "c", "d"]:
        p = IMAGES_DIR / "JEE-MAIN-22-25JUL-S2" / f"q43_opt_{opt}.png"
        if p.exists():
            im = Image.open(p)
            w, h = im.size
            clean = trim_and_pad(im, padding=12)
            clean.save(p)
            print(f"  [TIGHTENED] 25JUL-S2 q43_opt_{opt}: {w}x{h} -> {clean.width}x{clean.height}")

    # July 30 and 27JUL-S2 border line shaves
    shave_targets = [
        ("JEE-MAIN-22-30JUL-S2", "q33_opt_a.png"),
        ("JEE-MAIN-22-30JUL-S2", "q33_opt_c.png"),
        ("JEE-MAIN-22-30JUL-S2", "q33_opt_d.png"),
        ("JEE-MAIN-22-30JUL-S2", "q43_opt_a.png"),
        ("JEE-MAIN-22-30JUL-S2", "q43_opt_d.png"),
        ("JEE-MAIN-22-30JUL-S2", "q44_opt_c.png"),
        ("JEE-MAIN-22-30JUL-S2", "q78.png"),
        ("JEE-MAIN-22-30JUL-S2", "q84.png"),
        ("JEE-MAIN-22-30JUL-S2", "q11.png"),
        ("JEE-MAIN-22-30JUL-S2", "q18.png"),
        ("JEE-MAIN-22-27JUL-S2", "q46_opt_a.png"),
        ("JEE-MAIN-22-27JUL-S2", "q46_opt_b.png"),
        ("JEE-MAIN-22-27JUL-S2", "q46_opt_c.png"),
        ("JEE-MAIN-22-27JUL-S2", "q46_opt_d.png"),
    ]
    for paper, fname in shave_targets:
        p = IMAGES_DIR / paper / fname
        if p.exists():
            im = Image.open(p)
            w, h = im.size
            clean = trim_and_pad(im, padding=12)
            clean.save(p)
            print(f"  [SHAVED BORDER] {paper}/{fname}: {w}x{h} -> {clean.width}x{clean.height}")

def main():
    recrop_diagrams()
    clean_option_images()
    print("\nAll target image recrops completed successfully!")

if __name__ == "__main__":
    main()
