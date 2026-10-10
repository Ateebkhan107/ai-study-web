import cv2
import numpy as np
import os
import glob
import json

def get_clean_crop(image_path, out_path, is_numerical=False, is_structural_options=False):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

    row_sums = np.sum(thresh, axis=1) / 255.0
    has_content = row_sums > 1.5

    blocks = []
    in_block = False
    start = 0
    for y in range(h):
        if has_content[y] and not in_block:
            in_block = True
            start = y
        elif not has_content[y] and in_block:
            in_block = False
            blocks.append((start, y, y - start))
    if in_block:
        blocks.append((start, h, h - start))

    if not blocks:
        return False

    # Header detection: all contiguous lines at top starting with min_x < 220 and height <= 52
    header_end = 0
    for i, b in enumerate(blocks):
        block_thresh = thresh[b[0]:b[1], :]
        col_sums = np.sum(block_thresh, axis=0) / 255.0
        cols = np.where(col_sums > 0)[0]
        if len(cols) == 0: continue
        min_x = cols[0]
        max_x = cols[-1]
        height = b[2]

        if i == header_end and min_x < 220 and height <= 52 and (max_x > 300 or i == 0):
            header_end = i + 1
        else:
            break

    # Options detection (from bottom)
    option_start = len(blocks)
    if not is_numerical and not is_structural_options:
        for i in range(len(blocks) - 1, header_end - 1, -1):
            b = blocks[i]
            block_thresh = thresh[b[0]:b[1], :]
            col_sums = np.sum(block_thresh, axis=0) / 255.0
            cols = np.where(col_sums > 0)[0]
            if len(cols) == 0: continue
            min_x = cols[0]
            height = b[2]

            if height <= 2:
                continue
            if min_x < 220 and height <= 55:
                option_start = i
            else:
                break

    target = [b for b in blocks[header_end:option_start] if b[2] > 2]
    if not target:
        target = blocks[header_end:] if header_end < len(blocks) else blocks

    # Vertical bounds: exact start and end of target blocks
    y1 = target[0][0]
    y2 = target[-1][1]

    # Horizontal bounds
    all_min_x = []
    all_max_x = []
    for b in target:
        block_thresh = thresh[b[0]:b[1], :]
        col_sums = np.sum(block_thresh, axis=0) / 255.0
        cols = np.where(col_sums > 0)[0]
        if len(cols) > 0:
            all_min_x.append(cols[0])
            all_max_x.append(cols[-1])

    if not all_min_x:
        min_x = 0
        max_x = w
    else:
        min_x = min(all_min_x)
        max_x = max(all_max_x)

    pad_x = 10
    x1 = max(0, min_x - pad_x)
    x2 = min(w, max_x + pad_x)

    crop = img[y1:y2, x1:x2]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, crop)
    return True

def main():
    json_files = glob.glob("scratch/jee2023/transcribed/*.json")
    total = 0
    success = 0
    for jf in json_files:
        with open(jf, "r") as f:
            data = json.load(f)
        for q in data:
            if q.get("has_diagram") and q.get("image_path"):
                total += 1
                paper = q["paper_code"]
                qnum = q["question_number"]
                src = q["image_path"]
                dst = f"scratch/jee2023/diagram_crops/{paper}/q{qnum:02d}.png"
                
                is_numerical = str(q.get("question_type", "")).upper() == "NUMERICAL"
                is_structural_options = str(q.get("option_a", "")).strip().lower().startswith("option")
                
                if get_clean_crop(src, dst, is_numerical=is_numerical, is_structural_options=is_structural_options):
                    success += 1

    print(f"Done! Cleanly cropped {success}/{total} diagrams.")

if __name__ == "__main__":
    main()
