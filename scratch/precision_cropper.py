import cv2
import numpy as np
import subprocess
import csv
import io
import os
import re
import glob
import json

def get_tsv_lines(image_path):
    cmd = ["/opt/homebrew/bin/tesseract", image_path, "stdout", "tsv"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        return {}

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
    return lines_dict

def crop_question_image(image_path, out_path, is_type2=False):
    img = cv2.imread(image_path)
    if img is None:
        return False
    h, w, _ = img.shape

    lines_dict = get_tsv_lines(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    mask = thresh.copy()

    common_words = set([
        "the", "are", "with", "then", "when", "figure", "shown",
        "equal", "value", "find", "what", "which", "from",
        "given", "true", "false", "correct", "statement",
        "respectively", "three", "four", "ratio", "mass", "radius", "speed",
        "velocity", "resistance", "current", "battery", "circuit", "force", "power", "energy",
        "length", "area", "diagram", "below", "following", "above", "reaction", "product",
        "major", "compound", "order", "resonance", "point", "plane", "distance", "largest",
        "perimeter", "wire", "wires", "placed", "planes", "perpendicular", "centre", "impulse",
        "highest", "diodes", "forward", "bias", "liquid", "pushed", "piston", "tube", "outlet",
        "speed", "outgoing", "fluid", "lens", "lenses", "away", "system", "electron", "orbit",
        "excited", "energy", "levels", "hydrogen", "atom", "emission", "transition", "logic",
        "gate", "equivalent", "name", "spontaneous", "equilibrium", "individual", "physical",
        "chemical", "method", "solid", "reagent", "neutral", "effervescence", "slaked", "lime",
        "unit", "units", "magnitude", "magnetic", "field", "electric", "potential", "charge",
        "density", "infinite", "thin", "sheets", "capacitance", "capacitor", "internal",
        "resistors", "modulating", "signal", "square", "wave", "carrier", "volts", "modulation",
        "index", "consider", "match", "list-i", "list-ii", "assertion", "reason", "option", "options",
        "take", "pure", "mass", "block", "horizontal", "surface", "spring", "constant", "formed",
        "sequence", "reactions", "represented", "presence", "formation", "equilibrium", "where",
        "respectively,", "respectively:", "values", "are:"
    ])

    header_bottom = 0
    option_top = h

    for k, v in lines_dict.items():
        line_text_words = [w.lower() for w in v["words"]]
        line_str = " ".join(line_text_words)
        matches = [w for w in line_text_words if len(re.sub(r"[^a-z]", "", w)) >= 3 and re.sub(r"[^a-z]", "", w) in common_words]
        
        # 1. Question header text
        if any(line_str.startswith(f"{n}.") for n in range(1, 91)) or any(line_str.startswith(f"q{n}") for n in range(1, 91)):
            header_bottom = max(header_bottom, v["bottom"])
        elif len(matches) >= 1 and v["top"] < h * 0.50:
            header_bottom = max(header_bottom, v["bottom"])

        # 2. Options text (ONLY for Type 1 questions where options are text in DB)
        if not is_type2:
            # Check for option marker e.g. (1), (2), (A), (B), 1., 2.
            has_opt_marker = any(re.match(r"^(\([1-4a-da-d]\)|[1-4a-da-d]\.|\([1-4a-da-d]\.)$", w) for w in line_text_words)
            if has_opt_marker and v["top"] > h * 0.35:
                option_top = min(option_top, v["top"])
            # Or if line has multiple options in lower half
            elif v["top"] > h * 0.60 and len(matches) >= 2:
                option_top = min(option_top, v["top"])

    # Clear header block across full width
    if header_bottom > 0:
        mask[0 : min(h, header_bottom + 8), :] = 0

    # For Type 1, clear option block across full width
    if not is_type2 and option_top < h:
        mask[max(0, option_top - 8) : h, :] = 0

    # Also for Type 1, if there is text between diagram and options (e.g. Q14 "If the carrier wave is given as..."), erase it
    if not is_type2:
        for k, v in lines_dict.items():
            if v["top"] > header_bottom and v["bottom"] < option_top:
                line_text_words = [w.lower() for w in v["words"]]
                matches = [w for w in line_text_words if len(re.sub(r"[^a-z]", "", w)) >= 3 and re.sub(r"[^a-z]", "", w) in common_words]
                if len(matches) >= 2 or any(phrase in " ".join(line_text_words) for phrase in ["if the carrier", "the modulation index", "values of", "is given as"]):
                    mask[max(0, v["top"] - 6) : min(h, v["bottom"] + 6), :] = 0

    coords = cv2.findNonZero(mask)
    if coords is None:
        if is_type2:
            crop = img[max(0, header_bottom) : h, :]
        else:
            crop = img[int(h*0.15):int(h*0.85), :]
    else:
        x, y, bw, bh = cv2.boundingRect(coords)
        pad = 10
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(w, x + bw + pad)
        y2 = min(h, y + bh + pad)
        
        # Ensure minimum dimensions for diagram
        if bh < 40 and not is_type2:
            y1 = max(0, min(y1, header_bottom))
            y2 = min(h, max(y2, option_top))
            x1 = 0
            x2 = w

        crop = img[y1:y2, x1:x2]

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cv2.imwrite(out_path, crop)
    print(f"{os.path.basename(image_path)} ({'Type 2' if is_type2 else 'Type 1'}): Cropped to {crop.shape[1]}x{crop.shape[0]} at y={y1 if coords is not None else header_bottom}")
    return True

