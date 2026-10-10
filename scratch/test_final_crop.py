import cv2
import numpy as np
import os

def crop_question_image(image_path, out_path, is_numerical=False, is_structural_options=False):
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

    # Header lines
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

        if i == 0 and min_x < 250 and max_x > 400 and height <= 45:
            header_end_idx = 1
        elif i == header_end_idx and b[0] < h * 0.45 and height <= 38 and min_x < 250 and max_x > 400:
            header_end_idx = i + 1

    if is_numerical or is_structural_options:
        target_blocks = blocks[header_end_idx:]
    else:
        diagram_start = header_end_idx
        option_start_idx = len(blocks)
        for i in range(len(blocks) - 1, header_end_idx - 1, -1):
            b = blocks[i]
            height = b[2]
            block_thresh = thresh[b[0]:b[1], :]
            col_sums = np.sum(block_thresh, axis=0) / 255.0
            cols = np.where(col_sums > 0)[0]
            if len(cols) == 0: continue
            min_x = cols[0]
            max_x = cols[-1]
            if b[0] > h * 0.45 and height <= 52 and (min_x < 250 or max_x > w * 0.6):
                option_start_idx = i
            else:
                break
        target_blocks = blocks[diagram_start:option_start_idx]

    if not target_blocks:
        target_blocks = blocks[header_end_idx:] if header_end_idx < len(blocks) else blocks

    # Vertical bounds: exact start and end of target blocks (no bleeding into header or footer text)
    y1 = target_blocks[0][0]
    y2 = target_blocks[-1][1]

    # Horizontal bounds
    all_min_x = []
    all_max_x = []
    for b in target_blocks:
        block_thresh = thresh[b[0]:b[1], :]
        col_sums = np.sum(block_thresh, axis=0) / 255.0
        cols = np.where(col_sums > 0)[0]
        if len(cols) > 0:
            all_min_x.append(cols[0])
            all_max_x.append(cols[-1])

    min_x = min(all_min_x)
    max_x = max(all_max_x)

    pad_x = 10
    x1 = max(0, min_x - pad_x)
    x2 = min(w, max_x + pad_x)

    crop = img[y1:y2, x1:x2]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, crop)
    print(f"{os.path.basename(image_path)}: Cropped to {x2-x1}x{y2-y1} (y={y1}-{y2}, x={x1}-{x2})")

test_cases = [
    ("q13.png", False, False),
    ("q14.png", False, False),
    ("q29.png", True, False),
    ("q31.png", False, True),
    ("q34.png", False, True),
    ("q40.png", False, True),
    ("q44.png", False, True),
    ("q56.png", True, False),
    ("q58.png", True, False),
]

for name, is_num, is_struct in test_cases:
    src = f"tmp/jee-main-2023-january-clean/JEE-MAIN-23-24JAN-S1/crops/{name}"
    dst = f"scratch/test_perfect_crops/{name}"
    crop_question_image(src, dst, is_numerical=is_num, is_structural_options=is_struct)
