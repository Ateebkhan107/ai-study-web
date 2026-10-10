import cv2
import numpy as np
import subprocess
import csv
import io
import os
import re
import glob

def clean_and_crop_diagram(image_path, out_path):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape

    # Run tesseract TSV
    cmd = ["/opt/homebrew/bin/tesseract", image_path, "stdout", "tsv"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
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

    lines = [r for r in rows if r['level'] == 4]
    words = [r for r in rows if r['level'] == 5 and r['text']]
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    mask = thresh.copy()

    # Determine which lines are text prose vs diagram labels
    # Criteria for text prose:
    # 1. Contains English words / grammar (e.g. the, is, are, in, of, to, with, then, when, figure, as, shown, equal, value, find, what, which)
    # 2. Or starts with question numbering (e.g. 1., 2., 13., Q1, etc.)
    # 3. Or starts with option markers (1), (2), (3), (4), (A), (B), (C), (D)
    # 4. Or is in upper 30% and left-aligned (left < 260) with standard font height (< 45)
    # 5. Or is in lower 35% with standard font height (< 45) and option-like text
    
    common_words = set([
        "the", "is", "are", "in", "of", "to", "with", "then", "when", "figure", "as", "shown",
        "equal", "value", "find", "what", "which", "and", "a", "an", "for", "from", "by",
        "given", "let", "if", "at", "on", "it", "be", "true", "false", "correct", "statement",
        "respectively", "two", "three", "four", "ratio", "per", "mass", "radius", "speed",
        "velocity", "resistance", "current", "battery", "circuit", "force", "power", "energy",
        "length", "area", "diagram", "below", "following", "above", "reaction", "product",
        "major", "compound", "structure", "structures", "formula", "order", "resonance"
    ])

    for line in lines:
        lx, ly, lw, lh = line['left'], line['top'], line['width'], line['height']
        line_words = [w for w in words if w['top'] >= ly - 5 and (w['top'] + w['height']) <= (ly + lh + 5) and w['left'] >= lx - 5 and (w['left'] + w['width']) <= (lx + lw + 5)]
        line_text_words = [w['text'].lower() for w in line_words]
        line_str = " ".join(line_text_words)
        
        # Check matching english words count
        matches = [w for w in line_text_words if re.sub(r'[^a-z]', '', w) in common_words]
        
        is_prose = False
        if len(matches) >= 2:
            is_prose = True
        elif any(line_str.startswith(f"{n}.") for n in range(1, 91)) or any(line_str.startswith(f"q{n}") for n in range(1, 91)):
            is_prose = True
        elif any(re.match(r'^\(?([1-4]|[a-d])\)?[\.:\)]?$', w) for w in line_text_words):
            if ly > h * 0.4:
                is_prose = True
        elif ly < h * 0.35 and lx < 260 and lh < 45 and (len(line_words) >= 3 or lw > w * 0.3):
            is_prose = True
        elif ly > h * 0.70 and lh < 50 and lw > w * 0.3:
            is_prose = True
            
        if is_prose:
            # Erase from mask with padding
            y1 = max(0, ly - 6)
            y2 = min(h, ly + lh + 6)
            mask[y1:y2, :] = 0

    coords = cv2.findNonZero(mask)
    if coords is None:
        print(f"Warning: Empty mask for {image_path}, fallback to center crop")
        diag_crop = img[int(h*0.15):int(h*0.85), :]
    else:
        x, y, bw, bh = cv2.boundingRect(coords)
        pad = 12
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(w, x + bw + pad)
        y2 = min(h, y + bh + pad)
        diag_crop = img[y1:y2, x1:x2]

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, diag_crop)
    return True

