#!/usr/bin/env python3
"""
Clean, recrop, and normalize all diagrams for JEE Main 2021 24 Feb Shift 2.
Fixes:
- Q5: Pure logic circuit crop, pure option gate crops (stripping (1)..(4) and stray cut-off lines)
- Q9: Clean 4-resistor 2-inductor circuit (starts below question text 'is closed will be :')
- Q11: Pure P-V indicator graph (no question text, no option formulas)
- Q16: Pure circular disc geometry diagram (no question text, no option list)
- Q26: Pure 3D flux square diagram (no question text)
- Q29: Remove spurious solution crop (pure word problem)
- Q33: Pure 4-structure nucleophilic substitution choices (no previous question solution/text)
- Q35: Remove redundant match list crop (already fully in markdown text)
- Q38: Remove redundant question crop (pure text)
- Q40: Pure chemical reaction scheme (no question text or question number)
- Q43: Pure 4-aromatic option structures without labels (1)..(4) and cutting off NTA answer
- Q47: Remove question screenshot (pure text)
- Q51: Remove question screenshot (pure text)
- Q65: Remove spurious parabola solution screenshot from trigonometry word problem
"""

import json
from pathlib import Path
from PIL import Image, ImageOps, ImageChops

ROOT = Path("/Users/ateebfatmi/Desktop/prepzii")
PAPER = "JEE-MAIN-21-24FEB-S2"
LOCAL_PHY = ROOT / "scratch/jee2021/local" / PAPER / "physics/pages"
LOCAL_CHEM = ROOT / "scratch/jee2021/local" / PAPER / "chemistry/pages"
IMAGE_DIR = ROOT / "scratch/jee2021/images" / PAPER
RAW_DIR = ROOT / "scratch/jee2021/manual-crops/raw" / PAPER
TRANSCRIBED_DIR = ROOT / "scratch/jee2021/transcribed"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)
RAW_DIR.mkdir(parents=True, exist_ok=True)


def clean_crop(image, box, padding=12):
    cropped = image.crop(box).convert("RGB")
    corner = cropped.crop((0, 0, min(24, cropped.width), min(24, cropped.height)))
    mean = sum(sum(pixel) for pixel in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        cropped = ImageOps.invert(cropped)
    normed = ImageOps.grayscale(cropped).point(lambda val: 255 if val >= 205 else 0).convert("RGB")
    diff = ImageChops.difference(normed, Image.new("RGB", normed.size, "white"))
    bbox = diff.getbbox()
    if bbox:
        l, t, r, b = bbox
        normed = normed.crop((
            max(0, l - padding),
            max(0, t - padding),
            min(normed.width, r + padding),
            min(normed.height, b + padding),
        ))
    return normed


def main():
    print(f"Cleaning diagrams for {PAPER}...")

    # Load source pages
    phy_p2 = Image.open(LOCAL_PHY / "page-2.png")
    phy_p3 = Image.open(LOCAL_PHY / "page-3.png")
    phy_p4 = Image.open(LOCAL_PHY / "page-4.png")
    phy_p7 = Image.open(LOCAL_PHY / "page-7.png")
    phy_crop_q8 = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "physics/crops/q08.png")

    chem_p1 = Image.open(LOCAL_CHEM / "page-1.png")
    chem_p4 = Image.open(LOCAL_CHEM / "page-4.png")
    chem_crop_q1 = Image.open(ROOT / "scratch/jee2021/local" / PAPER / "chemistry/crops/q01.png")
    chem_p5 = Image.open(LOCAL_CHEM / "page-5.png")

    # Define accurate crops
    crops_to_save = {
        # Physics
        "q5.png": (phy_p2, (240, 260, 750, 390)),
        "q5_opt_a.png": (phy_p2, (315, 485, 680, 595)),
        "q5_opt_b.png": (phy_p2, (315, 605, 680, 715)),
        "q5_opt_c.png": (phy_p2, (315, 725, 680, 835)),
        "q5_opt_d.png": (phy_p2, (315, 840, 680, 945)),
        "q8.png": (phy_p3, (260, 555, 950, 870)),
        "q9.png": (phy_p3, (280, 2090, 860, 2435)),
        "q11.png": (phy_p3, (1140, 1935, 1720, 2315)),
        "q16.png": (phy_p4, (1180, 2070, 1750, 2445)),
        "q26.png": (phy_p7, (1200, 1965, 1650, 2460)),
        # Chemistry
        "q31.png": (chem_crop_q1, (240, 120, 930, 360)),
        "q33.png": (chem_p1, (1110, 960, 1850, 1330)),
        "q40.png": (chem_p4, (260, 280, 950, 455)),
        "q43_opt_a.png": (chem_p4, (1165, 590, 1320, 715)),
        "q43_opt_b.png": (chem_p4, (1165, 735, 1320, 865)),
        "q43_opt_c.png": (chem_p4, (1165, 890, 1320, 1005)),
        "q43_opt_d.png": (chem_p4, (1165, 1030, 1430, 1140)),
        "q49_opt_a.png": (chem_p5, (1100, 1430, 1480, 1620)),
        "q49_opt_b.png": (chem_p5, (1480, 1430, 1850, 1620)),
        "q49_opt_c.png": (chem_p5, (1100, 1610, 1480, 1810)),
        "q49_opt_d.png": (chem_p5, (1480, 1610, 1850, 1810)),
    }

    # Delete spurious / full-question images
    spurious = ["q29.png", "q35.png", "q38.png", "q47.png", "q51.png", "q65.png"]
    for s in spurious:
        (IMAGE_DIR / s).unlink(missing_ok=True)
        (RAW_DIR / s).unlink(missing_ok=True)

    # Save clean images
    saved_paths = {}
    for filename, (src_img, box) in crops_to_save.items():
        out_path = IMAGE_DIR / filename
        clean_crop(src_img, box).save(out_path)
        saved_paths[filename] = str(out_path.resolve())
        print(f"  Saved clean: {filename}")

    # Update transcribed JSONs
    # 1. Physics
    phy_json = TRANSCRIBED_DIR / f"{PAPER}_Physics.json"
    phy_data = json.loads(phy_json.read_text())
    for r in phy_data:
        qn = r["question_number"]
        if qn == 5:
            r["question_image"] = saved_paths["q5.png"]
            r["option_a_image"] = saved_paths["q5_opt_a.png"]
            r["option_b_image"] = saved_paths["q5_opt_b.png"]
            r["option_c_image"] = saved_paths["q5_opt_c.png"]
            r["option_d_image"] = saved_paths["q5_opt_d.png"]
        elif qn == 8:
            r["question_image"] = saved_paths["q8.png"]
        elif qn == 9:
            r["question_image"] = saved_paths["q9.png"]
        elif qn == 11:
            r["question_image"] = saved_paths["q11.png"]
        elif qn == 16:
            r["question_image"] = saved_paths["q16.png"]
        elif qn == 26:
            r["question_image"] = saved_paths["q26.png"]
        elif qn == 29:
            r["question_image"] = None
        else:
            r["question_image"] = None
    phy_json.write_text(json.dumps(phy_data, indent=2, ensure_ascii=False) + "\n")

    # 2. Chemistry
    chem_json = TRANSCRIBED_DIR / f"{PAPER}_Chemistry.json"
    chem_data = json.loads(chem_json.read_text())
    for r in chem_data:
        qn = r["question_number"]
        if qn == 31:
            r["question_image"] = saved_paths["q31.png"]
        elif qn == 33:
            r["question_image"] = saved_paths["q33.png"]
        elif qn == 35:
            r["question_image"] = None
        elif qn == 38:
            r["question_image"] = None
        elif qn == 40:
            r["question_image"] = saved_paths["q40.png"]
        elif qn == 43:
            r["question_image"] = None
            r["option_a_image"] = saved_paths["q43_opt_a.png"]
            r["option_b_image"] = saved_paths["q43_opt_b.png"]
            r["option_c_image"] = saved_paths["q43_opt_c.png"]
            r["option_d_image"] = saved_paths["q43_opt_d.png"]
        elif qn == 47:
            r["question_image"] = None
        elif qn == 49:
            r["question_image"] = None
            r["option_a_image"] = saved_paths["q49_opt_a.png"]
            r["option_b_image"] = saved_paths["q49_opt_b.png"]
            r["option_c_image"] = saved_paths["q49_opt_c.png"]
            r["option_d_image"] = saved_paths["q49_opt_d.png"]
        elif qn == 51:
            r["question_image"] = None
        else:
            r["question_image"] = None
    chem_json.write_text(json.dumps(chem_data, indent=2, ensure_ascii=False) + "\n")

    # 3. Mathematics
    math_json = TRANSCRIBED_DIR / f"{PAPER}_Mathematics.json"
    math_data = json.loads(math_json.read_text())
    for r in math_data:
        r["question_image"] = None
        r["option_a_image"] = None
        r["option_b_image"] = None
        r["option_c_image"] = None
        r["option_d_image"] = None
    math_json.write_text(json.dumps(math_data, indent=2, ensure_ascii=False) + "\n")

    print(f"Successfully cleaned and updated {PAPER}!")


if __name__ == "__main__":
    main()
