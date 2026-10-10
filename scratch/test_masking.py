import cv2
import numpy as np
import subprocess
import csv
import io
import os
import re

def extract_diagram_by_text_masking(image_path, out_path):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape

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
    
    # Track regions to erase
    erase_boxes = []

    for line in lines:
        lx, ly, lw, lh = line['left'], line['top'], line['width'], line['height']
        line_words = [w for w in words if w['top'] >= ly - 5 and (w['top'] + w['height']) <= (ly + lh + 5) and w['left'] >= lx - 5 and (w['left'] + w['width']) <= (lx + lw + 5)]
        line_text = " ".join([w['text'] for w in line_words])
        
        is_text_prose = False
        
        # 1. Starts with question number (e.g. 13., Q13, 2.)
        if any(line_text.startswith(f"{n}.") or line_text.startswith(f"Q{n}") for n in range(1, 91)):
            is_text_prose = True
        # 2. Known phrases
        elif any(phrase in line_text.lower() for phrase in [
            "which of the following", "choose the correct", "is given by", "as shown in", 
            "if the carrier", "modulation index", "resistance of", "the values of",
            "currents through", "connected to", "respectively", "true?", "false?",
            "match list", "list-i", "list-ii", "statement i", "statement ii",
            "consider the following", "in the given figure", "resonance in", "equal to",
            "values of", "are respectively", "are:", "then the", "find the", "calculate the"
        ]):
            is_text_prose = True
        # 3. Option markers
        elif any(line_text.strip().startswith(opt) for opt in ["(1)", "(2)", "(3)", "(4)", "(A)", "(B)", "(C)", "(D)", "(a)", "(b)", "(c)", "(d)"]):
            is_text_prose = True
        # 4. Top header text: any line in upper 35% starting near left margin (< 260) with standard height (< 45)
        elif ly < h * 0.35 and lx < 260 and lh < 45:
            is_text_prose = True
        # 5. Bottom footer text: options in bottom 30%
        elif ly > h * 0.65 and lh < 55:
            is_text_prose = True
            
        if is_text_prose:
            erase_boxes.append((0, max(0, ly - 4), w, min(h, ly + lh + 4)))
            print(f"  Erased line: [{line_text}] at y={ly}-{ly+lh}")

    for ex1, ey1, ex2, ey2 in erase_boxes:
        mask[ey1:ey2, ex1:ex2] = 0

    coords = cv2.findNonZero(mask)
    if coords is None:
        print("  Warning: No non-zero coordinates remaining!")
        # Fallback to center 60%
        diag_crop = img[int(h*0.2):int(h*0.8), :]
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
    print(f"  Saved masked diagram crop to {out_path}")
    return True

