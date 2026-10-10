import cv2
import numpy as np
import subprocess
import csv
import io
import os
import re

def extract_clean_diagram(image_path, out_path):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape

    # 1. Run tesseract to get all words and line bounding boxes
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

    # Find text prose lines and erase them
    for line in lines:
        lx, ly, lw, lh = line['left'], line['top'], line['width'], line['height']
        line_words = [w for w in words if w['top'] >= ly - 5 and (w['top'] + w['height']) <= (ly + lh + 5) and w['left'] >= lx - 5 and (w['left'] + w['width']) <= (lx + lw + 5)]
        line_text_words = [w['text'].lower() for w in line_words]
        line_str = " ".join(line_text_words)
        
        is_prose = False
        # Check if line contains ordinary English sentence words
        common_words = set([
            "the", "is", "are", "in", "of", "to", "with", "then", "when", "figure", "as", "shown",
            "equal", "value", "find", "what", "which", "and", "a", "an", "for", "from", "by",
            "given", "let", "if", "at", "on", "it", "be", "true", "false", "correct", "statement",
            "respectively", "two", "three", "four", "ratio", "per", "mass", "radius", "speed",
            "velocity", "resistance", "current", "battery", "circuit", "force", "power", "energy",
            "length", "area", "diagram", "below", "following", "above", "reaction", "product",
            "major", "compound", "order", "resonance", "point", "plane", "distance", "largest",
            "perimeter", "wire", "placed", "planes", "perpendicular", "net", "centre", "impulse",
            "highest", "diodes", "forward", "bias", "liquid", "pushed", "piston", "tube", "outlet",
            "speed", "outgoing", "fluid", "lens", "lenses", "away", "system", "electron", "orbit",
            "excited", "energy", "levels", "hydrogen", "atom", "emission", "transition", "logic",
            "gate", "equivalent", "name", "spontaneous", "equilibrium", "individual", "physical",
            "chemical", "method", "solid", "reagent", "neutral", "effervescence", "slaked", "lime"
        ])
        
        matches = [w for w in line_text_words if re.sub(r'[^a-z]', '', w) in common_words]
        
        # Starts with question number (e.g. 13., 29., Q1, etc.)
        if any(line_str.startswith(f"{n}.") or line_str.startswith(f"q{n}") for n in range(1, 91)):
            is_prose = True
        # Starts with option marker (1), (2), (3), (4), (A), (B), (C), (D)
        elif any(re.match(r'^\(?([1-4]|[a-d])\)?[\.:\)]?$', w) for w in line_text_words):
            is_prose = True
        # Contains 2 or more common English words
        elif len(matches) >= 2:
            is_prose = True
        # Starts with option-like expressions (e.g. "A. Reaction", "Fig (a)")
        elif any(line_str.startswith(x) for x in ["fig (", "fig.", "figure (", "statement (", "assertion", "reason"]):
            # If in options region
            if ly > h * 0.4:
                is_prose = True

        if is_prose:
            y1 = max(0, ly - 4)
            y2 = min(h, ly + lh + 4)
            mask[y1:y2, :] = 0

    # Connected components on remaining mask
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
    
    # Collect genuine diagram components
    valid_boxes = []
    for i in range(1, num_labels):
        x, y, bw, bh, area = stats[i]
        # Ignore tiny isolated dots/specks
        if area < 15:
            continue
        valid_boxes.append((x, y, bw, bh))

    if not valid_boxes:
        print(f"Warning: No valid diagram components for {image_path}, using center fallback")
        diag_crop = img[int(h*0.2):int(h*0.8), :]
    else:
        min_x = min(b[0] for b in valid_boxes)
        min_y = min(b[1] for b in valid_boxes)
        max_x = max(b[0] + b[2] for b in valid_boxes)
        max_y = max(b[1] + b[3] for b in valid_boxes)
        
        pad = 12
        x1 = max(0, min_x - pad)
        y1 = max(0, min_y - pad)
        x2 = min(w, max_x + pad)
        y2 = min(h, max_y + pad)
        diag_crop = img[y1:y2, x1:x2]

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, diag_crop)
    return True

