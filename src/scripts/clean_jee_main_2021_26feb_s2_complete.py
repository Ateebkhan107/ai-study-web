#!/usr/bin/env python3
"""
Comprehensive remediation for JEE-MAIN-21-26FEB-S2:
1. Replaces q44.png with complete side-by-side List-I and List-II match graphic.
2. Strips embedded (1)..(4) option markers from all 20 option images (Q15, Q41, Q42, Q45, Q47).
3. Trims whitespace and normalizes white canvas for all question images (Q12, Q13, Q14, Q15, Q24, Q28, Q30, Q41, Q42, Q45, Q47).
4. Updates scratch/jee2021/transcribed/JEE-MAIN-21-26FEB-S2_Chemistry.json:
   - Q33, Q46, Q48, Q50 converted to elegant 2-column Markdown tables.
   - Q44 simplified to reference complete q44.png graphic.
"""

import json
from pathlib import Path
from PIL import Image, ImageChops, ImageOps
import shutil

ROOT = Path("/Users/ateebfatmi/Desktop/prepzii")
PAPER = "JEE-MAIN-21-26FEB-S2"
IMG_DIR = ROOT / "scratch/jee2021/images" / PAPER
CHEM_JSON = ROOT / "scratch/jee2021/transcribed" / f"{PAPER}_Chemistry.json"


def normalize_and_trim(im: Image.Image, padding: int = 12) -> Image.Image:
    im = im.convert("RGB")
    # Invert if dark background
    corner = im.crop((0, 0, min(15, im.width), min(15, im.height)))
    mean = sum(sum(p) for p in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        im = ImageOps.invert(im)
    
    # Whiten near-white pixels and darken near-black
    pixels = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = pixels[x, y]
            if min(r, g, b) >= 240:
                pixels[x, y] = (255, 255, 255)
            elif max(r, g, b) <= 25:
                pixels[x, y] = (0, 0, 0)

    # Trim to bounding box
    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255)))
    bbox = diff.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    trimmed = im.crop((
        max(0, l - padding),
        max(0, t - padding),
        min(im.width, r + padding),
        min(im.height, b + padding)
    ))
    return trimmed


def fix_images():
    print("Fixing images for JEE-MAIN-21-26FEB-S2...")

    # 1. Replace Q44 image with clean complete side-by-side graphic
    q44_src = ROOT / "scratch/q44_side_by_side.png"
    if q44_src.exists():
        im_q44 = Image.open(q44_src)
        clean_q44 = normalize_and_trim(im_q44, padding=15)
        clean_q44.save(IMG_DIR / "q44.png")
        print(f"  Updated q44.png: {clean_q44.size}")
    else:
        print("  WARNING: scratch/q44_side_by_side.png not found!")

    # 2. Strip embedded option labels (1)..(4)
    cut_offsets = {
        # Q15 Physics: Logic gate waveforms
        "q15_opt_a.png": 54,
        "q15_opt_b.png": 54,
        "q15_opt_c.png": 54,
        "q15_opt_d.png": 54,
        # Q41 Chemistry: Reaction products
        "q41_opt_a.png": 210,
        "q41_opt_b.png": 210,
        "q41_opt_c.png": 210,
        "q41_opt_d.png": 210,
        # Q42 Chemistry: Reaction products
        "q42_opt_a.png": 220,
        "q42_opt_b.png": 350,
        "q42_opt_c.png": 220,
        "q42_opt_d.png": 350,
        # Q45 Chemistry: Elimination products
        "q45_opt_a.png": 70,
        "q45_opt_b.png": 70,
        "q45_opt_c.png": 70,
        "q45_opt_d.png": 70,
        # Q47 Chemistry: Reaction products
        "q47_opt_a.png": 220,
        "q47_opt_b.png": 220,
        "q47_opt_c.png": 220,
        "q47_opt_d.png": 220,
    }

    for fname, x_cut in cut_offsets.items():
        fpath = IMG_DIR / fname
        if not fpath.exists():
            print(f"  WARNING: {fname} missing!")
            continue
        im = Image.open(fpath)
        # Crop from x_cut to width
        cropped = im.crop((x_cut, 0, im.width, im.height))
        trimmed = normalize_and_trim(cropped, padding=12)
        trimmed.save(fpath)
        print(f"  Stripped label from {fname}: {im.size} -> {trimmed.size}")

    # 3. Trim all remaining question images (especially q13 which had huge right whitespace)
    q_images = ["q12.png", "q13.png", "q14.png", "q15.png", "q24.png", "q28.png", "q30.png", "q41.png", "q42.png", "q45.png", "q47.png"]
    for q_name in q_images:
        qp = IMG_DIR / q_name
        if qp.exists():
            im = Image.open(qp)
            trimmed = normalize_and_trim(im, padding=12)
            trimmed.save(qp)
            print(f"  Normalized & trimmed {q_name}: {im.size} -> {trimmed.size}")


def fix_chemistry_json():
    print(f"Updating {CHEM_JSON}...")
    with open(CHEM_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    for q in data:
        qnum = q.get("question_number")
        
        # Q33: Sucrose, Lactose, Maltose hydrolysis match table
        if qnum == 33:
            q["question"] = (
                "Match List-I with List-II.\n\n"
                "| List-I | List-II |\n"
                "| :--- | :--- |\n"
                "| (a) Sucrose | (i) $\\beta$-D-Galactose and $\\beta$-D-Glucose |\n"
                "| (b) Lactose | (ii) $\\alpha$-D-Glucose and $\\beta$-D-Fructose |\n"
                "| (c) Maltose | (iii) $\\alpha$-D-Glucose and $\\alpha$-D-Glucose |\n\n"
                "Choose the correct answer from the options given below:"
            )
            print("  Updated Q33 with Markdown table")

        # Q44: Sandmeyer, Gattermann, Wurtz, Fittig match table
        elif qnum == 44:
            q["question"] = (
                "Match List-I with List-II.\n\n"
                "Choose the correct answer from the options given below:"
            )
            q["needs_question_image"] = True
            q["question_image"] = str(IMG_DIR / "q44.png")
            print("  Updated Q44 text and image path")

        # Q46: Molecule bond order match table
        elif qnum == 46:
            q["question"] = (
                "Match List-I with List-II.\n\n"
                "| List-I (Molecule) | List-II (Bond order) |\n"
                "| :--- | :--- |\n"
                "| (a) $\\text{Ne}_2$ | (i) 1 |\n"
                "| (b) $\\text{N}_2$ | (ii) 2 |\n"
                "| (c) $\\text{F}_2$ | (iii) 0 |\n"
                "| (d) $\\text{O}_2$ | (iv) 3 |\n\n"
                "Choose the correct answer from the options given below:"
            )
            print("  Updated Q46 with Markdown table")

        # Q48: Ores match table
        elif qnum == 48:
            q["question"] = (
                "Match List-I with List-II.\n\n"
                "| List-I | List-II |\n"
                "| :--- | :--- |\n"
                "| (a) Siderite | (i) Cu |\n"
                "| (b) Calamine | (ii) Ca |\n"
                "| (c) Malachite | (iii) Fe |\n"
                "| (d) Cryolite | (iv) Al |\n"
                "| | (v) Zn |\n\n"
                "Choose the correct answer from the options given below:"
            )
            print("  Updated Q48 with Markdown table")

        # Q50: Industrial processes match table
        elif qnum == 50:
            q["question"] = (
                "Match List-I with List-II.\n\n"
                "| List-I | List-II |\n"
                "| :--- | :--- |\n"
                "| (a) Sodium Carbonate | (i) Deacon Process |\n"
                "| (b) Titanium | (ii) Castner-Kellner Cell |\n"
                "| (c) Chlorine | (iii) Van-Arkel Process |\n"
                "| (d) Sodium Hydroxide | (iv) Solvay Process |\n\n"
                "Choose the correct answer from the options given below:"
            )
            print("  Updated Q50 with Markdown table")

    with open(CHEM_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Chemistry JSON updated successfully.")


if __name__ == "__main__":
    fix_images()
    fix_chemistry_json()
    print("All fixes applied for JEE-MAIN-21-26FEB-S2!")
