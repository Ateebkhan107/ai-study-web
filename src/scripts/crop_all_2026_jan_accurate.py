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
    
    # Collect all blocks and section headers in order
    # Sections order:
    # 0: Math Sec 1 (Q1-20 -> global 1-20)
    # 1: Math Sec 2 (Q1-5  -> global 21-25)
    # 2: Phy Sec 1  (Q1-20 -> global 26-45)
    # 3: Phy Sec 2  (Q1-5  -> global 46-50)
    # 4: Chem Sec 1 (Q1-20 -> global 51-70)
    # 5: Chem Sec 2 (Q1-5  -> global 71-75)
    
    sec_offsets = [0, 20, 25, 45, 50, 70]
    current_sec_idx = 0
    
    # Find all question items across pages
    items = []
    
    for pno in range(len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        
        # Sort blocks by column then y
        left_blocks = [b for b in blocks if b[0] < mid_x - 10 and b[1] > 50]
        right_blocks = [b for b in blocks if b[2] > mid_x + 10 and b[1] > 50]
        left_blocks.sort(key=lambda b: b[1])
        right_blocks.sort(key=lambda b: b[1])
        
        for col_name, col_blocks in [("left", left_blocks), ("right", right_blocks)]:
            for b in col_blocks:
                txt = b[4].strip()
                # Check for section header
                m_sec = re.match(r"^(?:Math|Maths|Phy|Physics|Chem|Chemistry)\s+Sec(?:tion)?\s+([12])$", txt, re.IGNORECASE)
                if m_sec:
                    # Advance section
                    if "math" in txt.lower():
                        current_sec_idx = 0 if "1" in txt else 1
                    elif "phy" in txt.lower():
                        current_sec_idx = 2 if "1" in txt else 3
                    elif "chem" in txt.lower():
                        current_sec_idx = 4 if "1" in txt else 5
                    continue
                    
                # Check for question number start
                m_q = re.match(r"^(\d+)\.\s*(.*)", txt, re.DOTALL)
                if m_q:
                    local_qnum = int(m_q.group(1))
                    offset = sec_offsets[current_sec_idx]
                    global_qnum = offset + local_qnum
                    
                    if 1 <= global_qnum <= 75:
                        items.append({
                            "global_qnum": global_qnum,
                            "local_qnum": local_qnum,
                            "sec_idx": current_sec_idx,
                            "page": pno,
                            "col": col_name,
                            "y0": b[1],
                            "rect": b[:4],
                            "first_text": m_q.group(2)
                        })
                        
    # Deduplicate items by global_qnum
    unique_items = {}
    for it in items:
        gnum = it["global_qnum"]
        if gnum not in unique_items:
            unique_items[gnum] = it
            
    # Crop each question bounding box
    questions_meta = []
    
    for gnum in range(1, 76):
        it = unique_items.get(gnum)
        if not it:
            print(f"Warning: {paper_code} Q{gnum} not found!")
            continue
            
        pno = it["page"]
        page = doc[pno]
        col = it["col"]
        y0 = max(0, it["y0"] - 6)
        
        if col == "left":
            x0 = 0
            x1 = mid_x + 10
        else:
            x0 = mid_x - 10
            x1 = page.rect.width
            
        # Find next question or section header in same column on same page
        next_items = [
            q for q in unique_items.values()
            if q["page"] == pno and q["col"] == col and q["y0"] > it["y0"] + 15
        ]
        
        if next_items:
            next_items.sort(key=lambda x: x["y0"])
            y1 = min(page.rect.height, next_items[0]["y0"] - 4)
        else:
            y1 = page.rect.height - 25
            
        crop_rect = fitz.Rect(x0, y0, x1, y1) & page.rect
        crop_pix = page.get_pixmap(clip=crop_rect, dpi=200)
        crop_filename = f"q{gnum:02d}.png"
        crop_pix.save(os.path.join(crops_dir, crop_filename))
        
        subject = "Maths" if gnum <= 25 else ("Physics" if gnum <= 50 else "Chemistry")
        qtype = "MCQ" if gnum not in [21,22,23,24,25,46,47,48,49,50,71,72,73,74,75] else "NUMERICAL"
        
        questions_meta.append({
            "question_number": gnum,
            "subject": subject,
            "question_type": qtype,
            "page": pno,
            "crop_file": crop_filename,
            "crop_rect": [crop_rect.x0, crop_rect.y0, crop_rect.x1, crop_rect.y1]
        })
        
    print(f"{paper_code}: Successfully cropped {len(questions_meta)} / 75 questions")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(questions_meta, f, indent=2)

print("\nAll 10 JEE Main 2026 January shift papers cropped successfully!")
