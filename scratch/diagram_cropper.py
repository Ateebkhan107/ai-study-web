import subprocess
import csv
import io
import re
import cv2
import numpy as np
from PIL import Image
import os

def get_tsv_data(image_path):
    cmd = ["/opt/homebrew/bin/tesseract", image_path, "stdout", "tsv"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        return []
    
    rows = []
    reader = csv.reader(io.StringIO(res.stdout), delimiter='\t')
    header = next(reader, None)
    for r in reader:
        if len(r) >= 12:
            try:
                level = int(r[0])
                left = int(r[6])
                top = int(r[7])
                width = int(r[8])
                height = int(r[9])
                conf = float(r[10])
                text = r[11].strip()
                rows.append({
                    'level': level,
                    'left': left,
                    'top': top,
                    'width': width,
                    'height': height,
                    'conf': conf,
                    'text': text
                })
            except (ValueError, IndexError):
                continue
    return rows

def crop_diagram_auto(image_path, out_path):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape

    tsv_rows = get_tsv_data(image_path)
    word_rows = [r for r in tsv_rows if r['level'] == 5 and r['text']]

    # 1. Detect question header text (lines before diagram)
    # 2. Detect options text (lines after diagram)
    
    # Options usually start with (1), (2), (3), (4), (A), (B), (C), (D) or contain option markers
    option_y_min = h
    header_y_max = 0

    # Look for options from the bottom up
    for r in word_rows:
        t = r['text']
        # Check if this word is an option marker e.g. (1), (2), (3), (4), (A), (B), (C), (D), 1., 2., etc.
        if re.match(r'^\(?([1-4]|[A-Da-d])\)?[\.:\)]?$', t) or re.match(r'^\([1-4]\)', t):
            # Check if it is in the lower half or significantly down the page
            if r['top'] > h * 0.35:
                if r['top'] < option_y_min:
                    option_y_min = r['top']

    # Header text: find words at the top that are part of question statement
    # Look from top down: words with left < 200 or width spanning across
    for r in word_rows:
        if r['top'] < option_y_min:
            # Check if this word looks like header text (e.g. Q1, 13., "As", "In", "Let", etc.)
            # If it is in the upper portion and looks like standard text
            if r['top'] < h * 0.4:
                # If it is on the left margin (question numbering or start of line)
                if r['left'] < 250:
                    bottom = r['top'] + r['height']
                    if bottom > header_y_max:
                        header_y_max = bottom

    # If no header detected, default to 0; if no option detected, default to h
    print(f"File: {os.path.basename(image_path)}: Header bottom = {header_y_max}, Option top = {option_y_min}")

    # Now in the region between header_y_max and option_y_min, find non-white pixels
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

    # Mask out header and option areas
    mask = np.zeros_like(thresh)
    y_start = min(header_y_max + 5, h)
    y_end = max(option_y_min - 5, 0)
    
    if y_end <= y_start:
        y_start = 0
        y_end = h

    mask[y_start:y_end, :] = thresh[y_start:y_end, :]

    # Find non-white pixels in mask
    coords = cv2.findNonZero(mask)
    if coords is None:
        print(f"  Warning: No non-white pixels found between {y_start} and {y_end}")
        return False

    x, y, bw, bh = cv2.boundingRect(coords)
    
    # Add small padding
    pad = 10
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(w, x + bw + pad)
    y2 = min(h, y + bh + pad)

    diagram_crop = img[y1:y2, x1:x2]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, diagram_crop)
    print(f"  Saved diagram crop to {out_path} ({x2-x1}x{y2-y1})")
    return True

