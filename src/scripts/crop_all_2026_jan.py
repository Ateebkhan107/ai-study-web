import fitz
import re
import os
import json

PAPERS = [
    ("21jan_s1.pdf", "JEE-MAIN-26-21JAN-S1", "21jan_s1"),
    ("21jan_s2.pdf", "JEE-MAIN-26-21JAN-S2", "21jan_s2"),
    ("22jan_s1.pdf", "JEE-MAIN-26-22JAN-S1", "22jan_s1"),
    ("22jan_s2.pdf", "JEE-MAIN-26-22JAN-S2", "22jan_s2"),
    ("23jan_s1.pdf", "JEE-MAIN-26-23JAN-S1", "23jan_s1"),
    ("23jan_s2.pdf", "JEE-MAIN-26-23JAN-S2", "23jan_s2"),
    ("24jan_s1.pdf", "JEE-MAIN-26-24JAN-S1", "24jan_s1"),
    ("24jan_s2.pdf", "JEE-MAIN-26-24JAN-S2", "24jan_s2"),
    ("28jan_s1.pdf", "JEE-MAIN-26-28JAN-S1", "28jan_s1"),
    ("28jan_s2.pdf", "JEE-MAIN-26-28JAN-S2", "28jan_s2"),
]

for pdf_name, paper_code, file_prefix in PAPERS:
    pdf_path = f"tmp/jee-main-jan/pdfs/{pdf_name}"
    doc = fitz.open(pdf_path)
    out_dir = f"tmp/jee-main-2026-jan/{paper_code}"
    crops_dir = os.path.join(out_dir, "crops")
    os.makedirs(crops_dir, exist_ok=True)
    
    mid_x = doc[0].rect.width / 2.0
    
    # Extract all question start coordinates across pages
    # A question starts with `<num>.\s+` or `Math Sec`, `Physics Sec`, `Chem Sec`
    q_starts = []
    
    for pno in range(len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        
        for b in blocks:
            text = b[4]
            # Match question number start
            m = re.match(r"^\s*(\d+)\.\s+", text)
            if m:
                qnum = int(m.group(1))
                if 1 <= qnum <= 75:
                    col = "left" if b[0] < mid_x - 10 else "right"
                    q_starts.append({
                        "qnum": qnum,
                        "page": pno,
                        "col": col,
                        "y0": b[1],
                        "rect": b[:4]
                    })
                    
    # Sort questions by qnum
    q_starts.sort(key=lambda x: x["qnum"])
    
    # De-duplicate by qnum (keep lowest y0 on first page seen)
    unique_qstarts = {}
    for qs in q_starts:
        qnum = qs["qnum"]
        if qnum not in unique_qstarts:
            unique_qstarts[qnum] = qs
            
    meta_list = []
    
    for qnum in range(1, 76):
        qs = unique_qstarts.get(qnum)
        if not qs:
            # Fallback if question number regex missed: search across blocks
            print(f"Warning: {paper_code} Q{qnum} start not found directly by regex")
            continue
            
        pno = qs["page"]
        page = doc[pno]
        col = qs["col"]
        y0 = max(0, qs["y0"] - 8)
        
        # Bounding width
        if col == "left":
            x0 = 0
            x1 = mid_x + 10
        else:
            x0 = mid_x - 10
            x1 = page.rect.width
            
        # Find next question in the same column on the same page
        next_in_col = [
            q for q in unique_qstarts.values()
            if q["page"] == pno and q["col"] == col and q["y0"] > qs["y0"] + 15
        ]
        
        if next_in_col:
            next_in_col.sort(key=lambda x: x["y0"])
            y1 = min(page.rect.height, next_in_col[0]["y0"] - 5)
        else:
            # Bottom of column or page
            y1 = page.rect.height - 20
            
        crop_rect = fitz.Rect(x0, y0, x1, y1) & page.rect
        crop_pix = page.get_pixmap(clip=crop_rect, dpi=200)
        crop_filename = f"q{qnum:02d}.png"
        crop_pix.save(os.path.join(crops_dir, crop_filename))
        
        # Assign subject
        if qnum <= 25: subject = "Maths"
        elif qnum <= 50: subject = "Physics"
        else: subject = "Chemistry"
        
        qtype = "MCQ" if qnum not in [21,22,23,24,25,46,47,48,49,50,71,72,73,74,75] else "NUMERICAL"
        
        meta_list.append({
            "question_number": qnum,
            "subject": subject,
            "question_type": qtype,
            "page": pno,
            "col": col,
            "crop_file": crop_filename,
            "crop_rect": [crop_rect.x0, crop_rect.y0, crop_rect.x1, crop_rect.y1],
            "correct_option": "a",
            "numerical_answer": ""
        })
        
    print(f"{paper_code}: Cropped {len(meta_list)} / 75 questions")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(meta_list, f, indent=2)

print("\nCropping of all 10 JEE Main 2026 January papers complete!")
