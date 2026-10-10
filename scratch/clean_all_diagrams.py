import cv2
import numpy as np
import subprocess
import csv
import io
import os
import re
import glob

def clean_and_crop(image_path, out_path):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape

    # 1. Run tesseract to get all words
    cmd = ["/opt/homebrew/bin/tesseract", image_path, "stdout", "tsv"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        return False

    reader = csv.reader(io.StringIO(res.stdout), delimiter="\t")
    header = next(reader, None)
    lines_dict = {}
    for r in reader:
        if len(r) >= 12 and int(r[0]) == 5:
            b, p, l = int(r[2]), int(r[3]), int(r[4])
            text = r[11].strip()
            if text:
                key = (b, p, l)
                if key not in lines_dict:
                    lines_dict[key] = {
                        "left": int(r[6]),
                        "top": int(r[7]),
                        "right": int(r[6]) + int(r[8]),
                        "bottom": int(r[7]) + int(r[9]),
                        "words": []
                    }
                else:
                    lines_dict[key]["left"] = min(lines_dict[key]["left"], int(r[6]))
                    lines_dict[key]["top"] = min(lines_dict[key]["top"], int(r[7]))
                    lines_dict[key]["right"] = max(lines_dict[key]["right"], int(r[6]) + int(r[8]))
                    lines_dict[key]["bottom"] = max(lines_dict[key]["bottom"], int(r[7]) + int(r[9]))
                lines_dict[key]["words"].append(text)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    mask = thresh.copy()

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
        "chemical", "method", "solid", "reagent", "neutral", "effervescence", "slaked", "lime",
        "unit", "units", "magnitude", "magnetic", "field", "electric", "potential", "charge",
        "density", "infinite", "thin", "sheets", "capacitance", "capacitor", "internal",
        "resistors", "modulating", "signal", "square", "wave", "carrier", "volts", "modulation",
        "index", "consider", "match", "list-i", "list-ii", "assertion", "reason"
    ])

    for k, v in lines_dict.items():
        line_text_words = [w.lower() for w in v["words"]]
        line_str = " ".join(line_text_words)
        
        # Count common english words
        matches = [w for w in line_text_words if re.sub(r'[^a-z]', '', w) in common_words]
        
        is_prose = False
        # 1. Question number prefix
        if any(line_str.startswith(f"{n}.") for n in range(1, 91)) or any(line_str.startswith(f"q{n}") for n in range(1, 91)):
            is_prose = True
        # 2. Option marker prefix (1), (2), (A), (B)
        elif any(re.match(r'^\(?([1-4]|[a-d])\)?[\.:\)]?$', w) for w in line_text_words):
            is_prose = True
        # 3. Contains 1 or more common prose words and has multiple words
        elif len(matches) >= 1 and len(line_text_words) >= 2:
            is_prose = True
        # 4. English words matches >= 2
        elif len(matches) >= 2:
            is_prose = True
        # 5. Header line near top with standard height
        elif v["top"] < h * 0.4 and v["left"] < 250 and (v["bottom"] - v["top"]) < 45 and len(line_text_words) >= 2:
            is_prose = True

        if is_prose:
            y1 = max(0, v["top"] - 4)
            y2 = min(h, v["bottom"] + 4)
            mask[y1:y2, :] = 0

    # Connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
    valid_boxes = []
    for i in range(1, num_labels):
        x, y, bw, bh, area = stats[i]
        if area < 15:
            continue
        valid_boxes.append((x, y, bw, bh))

    if not valid_boxes:
        # Fallback
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

