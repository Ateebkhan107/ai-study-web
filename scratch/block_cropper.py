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

    # Calculate row content density
    row_sums = np.sum(thresh, axis=1) / 255.0
    has_content = row_sums > 1.5

    # Group contiguous rows into vertical blocks separated by whitespace gaps
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

    # Merge blocks that have tiny whitespace gap (< 8px)
    blocks = []
    for b in raw_blocks:
        if not blocks:
            blocks.append(b)
        else:
            prev = blocks[-1]
            gap = b[0] - prev[1]
            if gap <= 6:
                # Merge with previous
                blocks[-1] = (prev[0], b[1], b[1] - prev[0])
            else:
                blocks.append(b)

    # Identify blocks
    # Block 1 starts at top (y < 50) and is the Question statement header line
    # If there are consecutive text lines at the top with height < 35px, they are header lines
    header_end_idx = 0
    for i, b in enumerate(blocks):
        # A header line is near top (y < h * 0.4) with standard line height (< 38px)
        # and starts near left margin (x < 250)
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
        elif i == header_end_idx and b[0] < h * 0.4 and height <= 38 and min_x < 250:
            header_end_idx = i + 1

    if is_type2:
        # Type 2: Keep everything from after header_end_idx down to the bottom
        target_blocks = blocks[header_end_idx:]
        if not target_blocks:
            target_blocks = blocks
    else:
        # Type 1: Diagram in middle. Find diagram blocks and exclude option blocks at the bottom
        # Option blocks: from bottom up, lines with height < 48px in bottom 40%
        # Or find the prominent diagram block(s)
        diagram_start = header_end_idx
        # Find where options start from bottom
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
            # Fallback to middle blocks
            target_blocks = blocks[header_end_idx:] if header_end_idx < len(blocks) else blocks

    # Compute bounding box of target blocks
    min_y = target_blocks[0][0]
    max_y = target_blocks[-1][1]

    # Compute horizontal span across all target blocks
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

    pad = 12
    x1 = max(0, min_x - pad)
    y1 = max(0, min_y - pad)
    x2 = min(w, max_x + pad)
    y2 = min(h, max_y + pad)

    crop = img[y1:y2, x1:x2]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, crop)
    print(f"{os.path.basename(image_path)} ({'Type 2' if is_type2 else 'Type 1'}): Crop size {x2-x1}x{y2-y1} at y={y1}-{y2}, x={x1}-{x2}")
    return True

