import cv2
import numpy as np
import os
import glob
import json

def get_clean_crop(image_path, out_path, is_type2=False):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

    row_sums = np.sum(thresh, axis=1) / 255.0
    has_content = row_sums > 1.5

    raw_blocks = []
    in_block = False
    start = 0
    for y in range(h):
        if has_content[y] and not in_block:
            in_block = True
            start = y
        elif not has_content[y] and in_block:
            in_block = False
            raw_blocks.append((start, y, y - start))
    if in_block:
        raw_blocks.append((start, h, h - start))

    if not raw_blocks:
        return False

    blocks = []
    for b in raw_blocks:
        if not blocks:
            blocks.append(b)
        else:
            prev = blocks[-1]
            gap = b[0] - prev[1]
            if gap <= 6:
                blocks[-1] = (prev[0], b[1], b[1] - prev[0])
            else:
                blocks.append(b)

    header_end_idx = 0
    for i, b in enumerate(blocks):
        block_thresh = thresh[b[0]:b[1], :]
        col_sums = np.sum(block_thresh, axis=0) / 255.0
        cols = np.where(col_sums > 0)[0]
        if len(cols) == 0:
            continue
        min_x = cols[0]
        max_x = cols[-1]
        height = b[2]

        if i == 0:
            header_end_idx = 1
        elif i == header_end_idx and b[0] < h * 0.4 and height <= 38 and min_x < 250:
            header_end_idx = i + 1

    if is_type2:
        target_blocks = blocks[header_end_idx:]
        if not target_blocks:
            target_blocks = blocks
    else:
        diagram_start = header_end_idx
        option_start_idx = len(blocks)
        for i in range(len(blocks) - 1, header_end_idx - 1, -1):
            b = blocks[i]
            height = b[2]
            if b[0] > h * 0.45 and height <= 52:
                option_start_idx = i
            else:
                break
        
        target_blocks = blocks[diagram_start:option_start_idx]
        if not target_blocks:
            target_blocks = blocks[header_end_idx:] if header_end_idx < len(blocks) else blocks

    min_y = target_blocks[0][0]
    max_y = target_blocks[-1][1]

    all_min_x = []
    all_max_x = []
    for b in target_blocks:
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

    pad = 10
    x1 = max(0, min_x - pad)
    y1 = max(0, min_y - pad)
    x2 = min(w, max_x + pad)
    y2 = min(h, max_y + pad)

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
                is_type2 = str(q.get("option_a", "")).lower().startswith("option")
                if get_clean_crop(src, dst, is_type2=is_type2):
                    success += 1
                    if total % 25 == 0:
                        print(f"Processed {total} diagram crops...")

    print(f"\nDone! Regenerated {success}/{total} diagrams.")

if __name__ == "__main__":
    main()
