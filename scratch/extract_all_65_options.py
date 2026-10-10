import cv2
import numpy as np
import json
import os
import glob

with open('scratch/dummy_65_questions.json') as f:
    questions = json.load(f)

def crop_box(img, y1, y2, x1, x2, pad=6):
    h, w, _ = img.shape
    y1, y2 = max(0, y1), min(h, y2)
    x1, x2 = max(0, x1), min(w, x2)
    if y2 <= y1 or x2 <= x1:
        return img[0:10, 0:10]
    gray = cv2.cvtColor(img[y1:y2, x1:x2], cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    col_sums = np.sum(thresh, axis=0) / 255.0
    row_sums = np.sum(thresh, axis=1) / 255.0
    cols = np.where(col_sums > 0)[0]
    rows = np.where(row_sums > 0)[0]
    if len(cols) == 0 or len(rows) == 0:
        return img[y1:y2, x1:x2]
    
    sub_x1 = max(0, x1 + cols[0] - pad)
    sub_x2 = min(w, x1 + cols[-1] + pad)
    sub_y1 = max(0, y1 + rows[0] - pad)
    sub_y2 = min(h, y1 + rows[-1] + pad)
    return img[sub_y1:sub_y2, sub_x1:sub_x2]

def split_row_2opts(img, y1, y2, x_start=100, x_end=1400):
    row = img[y1:y2, x_start:x_end]
    rh, rw, _ = row.shape
    gray = cv2.cvtColor(row, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    col_sums = np.sum(thresh, axis=0) / 255.0
    mid = rw // 2
    search_range = range(mid - int(rw*0.25), mid + int(rw*0.25))
    if len(search_range) == 0:
        min_idx = mid
    else:
        min_idx = min(search_range, key=lambda x: col_sums[x])
    
    left = crop_box(img, y1, y2, x_start, x_start + min_idx)
    right = crop_box(img, y1, y2, x_start + min_idx, x_end)
    return left, right

def split_row_4opts(img, y1, y2, x_start=100, x_end=1400):
    row = img[y1:y2, x_start:x_end]
    rh, rw, _ = row.shape
    w_quarter = rw // 4
    opts = []
    for i in range(4):
        x1 = x_start + i * w_quarter
        x2 = x_start + (i + 1) * w_quarter
        opts.append(crop_box(img, y1, y2, x1, x2))
    return opts

processed_results = []

for q in questions:
    paper = q['paper']
    qnum = q['qnum']
    src = q['image_path']
    img = cv2.imread(src)
    if img is None:
        continue
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

    rem_blocks = [b for b in blocks[header_end:] if b[2] > 2]
    out_dir = f"scratch/jee2023/diagram_crops/{paper}"
    os.makedirs(out_dir, exist_ok=True)
    qnum_str = f"q{qnum:02d}"

    # Determine layout of remaining blocks
    # Case 1: 2 rows of options (2x2 grid)
    if len(rem_blocks) >= 3:
        # Top blocks are question diagram, last 2 large blocks are option rows
        # Or top 1 is diagram, next 2 are option rows
        q_blocks = rem_blocks[:-2]
        opt_r1 = rem_blocks[-2]
        opt_r2 = rem_blocks[-1]

        q_y1 = q_blocks[0][0] if q_blocks else 0
        q_y2 = q_blocks[-1][1] if q_blocks else 0
        if q_blocks and q_y2 > q_y1:
            q_diag = crop_box(img, q_y1, q_y2, 100, 1400)
            cv2.imwrite(f"{out_dir}/{qnum_str}.png", q_diag)
            has_q_image = True
        else:
            has_q_image = False

        opt_a, opt_b = split_row_2opts(img, opt_r1[0], opt_r1[1])
        opt_c, opt_d = split_row_2opts(img, opt_r2[0], opt_r2[1])

        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_a.png", opt_a)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_b.png", opt_b)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_c.png", opt_c)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_d.png", opt_d)

        processed_results.append({
            "paper": paper,
            "qnum": qnum,
            "has_q_image": has_q_image,
            "has_opt_images": True
        })

    elif len(rem_blocks) == 2:
        # 2 option rows (no question diagram)
        opt_r1 = rem_blocks[0]
        opt_r2 = rem_blocks[1]
        opt_a, opt_b = split_row_2opts(img, opt_r1[0], opt_r1[1])
        opt_c, opt_d = split_row_2opts(img, opt_r2[0], opt_r2[1])

        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_a.png", opt_a)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_b.png", opt_b)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_c.png", opt_c)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_d.png", opt_d)

        processed_results.append({
            "paper": paper,
            "qnum": qnum,
            "has_q_image": False,
            "has_opt_images": True
        })

    elif len(rem_blocks) == 1:
        # Either 1 row with 4 options, or 4 vertical options merged
        b = rem_blocks[0]
        if b[2] > 200: # large vertical block, split into 4 horizontal slices
            slice_h = b[2] // 4
            opt_a = crop_box(img, b[0], b[0] + slice_h, 100, 1400)
            opt_b = crop_box(img, b[0] + slice_h, b[0] + 2*slice_h, 100, 1400)
            opt_c = crop_box(img, b[0] + 2*slice_h, b[0] + 3*slice_h, 100, 1400)
            opt_d = crop_box(img, b[0] + 3*slice_h, b[1], 100, 1400)
        else:
            opts = split_row_4opts(img, b[0], b[1])
            opt_a, opt_b, opt_c, opt_d = opts[0], opts[1], opts[2], opts[3]

        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_a.png", opt_a)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_b.png", opt_b)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_c.png", opt_c)
        cv2.imwrite(f"{out_dir}/{qnum_str}_opt_d.png", opt_d)

        processed_results.append({
            "paper": paper,
            "qnum": qnum,
            "has_q_image": False,
            "has_opt_images": True
        })

print(f"Processed options for {len(processed_results)} questions.")
with open("scratch/processed_options_meta.json", "w") as f:
    json.dump(processed_results, f, indent=2)
