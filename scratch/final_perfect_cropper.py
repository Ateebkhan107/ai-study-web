import cv2
import numpy as np
import os
import glob
import json

def crop_diagram_image(image_path, out_path, question_type="MCQ", option_a=""):
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

    # 1. Identify Question Statement Header (lines at top to trim)
    header_end_idx = 0
    for i, b in enumerate(blocks):
        block_thresh = thresh[b[0]:b[1], :]
        col_sums = np.sum(block_thresh, axis=0) / 255.0
        cols = np.where(col_sums > 0)[0]
        if len(cols) == 0:
            continue
        min_x = cols[0]
        max_x = cols[-1]
        width = max_x - min_x
        height = b[2]

        if i == 0:
            header_end_idx = 1
        elif i == header_end_idx and b[0] < h * 0.45 and height <= 38 and min_x < 260:
            header_end_idx = i + 1

    is_numerical = str(question_type).upper() == "NUMERICAL" or not option_a
    is_structural_options = str(option_a).lower().startswith("option")

    if is_numerical or is_structural_options:
        # Keep everything from after header to bottom of image
        target_blocks = blocks[header_end_idx:]
        if not target_blocks:
            target_blocks = blocks
    else:
        # Standard MCQ with text options in database: trim option lines from bottom
        diagram_start = header_end_idx
        option_start_idx = len(blocks)
        for i in range(len(blocks) - 1, header_end_idx - 1, -1):
            b = blocks[i]
            height = b[2]
            # If line is in lower half and text-line height
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
    print(f"{os.path.basename(image_path)}: Crop size {x2-x1}x{y2-y1} at y={y1}-{y2}, x={x1}-{x2}")
    return True

