import fitz
import re
import os
import json

with open("tmp/jee-main-2026-jan/parsed_answer_key.json") as f:
    answer_keys = json.load(f)

with open("tmp/jee-main-2026-jan/pdf_mapping.json") as f:
    pdf_mapping = json.load(f)

PAPERS = [
    ("paper_1", "JEE-MAIN-25-22JAN-S1", "22 Jan", "Shift 1"),
    ("paper_2", "JEE-MAIN-25-22JAN-S2", "22 Jan", "Shift 2"),
    ("paper_3", "JEE-MAIN-25-23JAN-S1", "23 Jan", "Shift 1"),
    ("paper_4", "JEE-MAIN-25-23JAN-S2", "23 Jan", "Shift 2"),
    ("paper_5", "JEE-MAIN-25-24JAN-S1", "24 Jan", "Shift 1"),
    ("paper_6", "JEE-MAIN-25-24JAN-S2", "24 Jan", "Shift 2"),
    ("paper_7", "JEE-MAIN-25-28JAN-S1", "28 Jan", "Shift 1"),
    ("paper_8", "JEE-MAIN-25-28JAN-S2", "28 Jan", "Shift 2"),
    ("paper_9", "JEE-MAIN-25-29JAN-S1", "29 Jan", "Shift 1"),
    ("paper_10", "JEE-MAIN-25-29JAN-S2", "29 Jan", "Shift 2"),
]

def crop_and_index_paper(paper_key, paper_code, attempt, shift):
    pdf_path = f"tmp/jee-main-2026-jan/pdfs/{paper_key}.pdf"
    out_dir = f"tmp/jee-main-2025-jan/{paper_code}"
    crops_dir = os.path.join(out_dir, "crops")
    os.makedirs(crops_dir, exist_ok=True)
    
    doc = fitz.open(pdf_path)
    paper_ans_keys = answer_keys.get(paper_code, {}).get("keys", {})
    
    questions_meta = []
    current_q_num = 1
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("blocks")
        drawings = page.get_drawings()
        
        h_lines = []
        for d in drawings:
            rect = d["rect"]
            if rect.width > 300 and rect.height < 5:
                h_lines.append(rect.y0)
        h_lines = sorted(list(set(h_lines)))
        
        q_blocks = []
        for b in blocks:
            text = b[4]
            if "Question ID" in text:
                qid_match = re.search(r"Question ID\s*:\s*(\d+)", text)
                qtype_match = re.search(r"Question Type\s*:\s*(\w+)", text)
                opt_matches = re.findall(r"Option (\d) ID\s*:\s*(\d+)", text)
                
                opt_map = {int(num): oid for num, oid in opt_matches}
                qid = qid_match.group(1) if qid_match else None
                qtype = "NUMERICAL" if (qtype_match and qtype_match.group(1) == "SA") else "MCQ"
                
                # Determine correct option
                official_ans = paper_ans_keys.get(qid)
                correct_letter = None
                numerical_val = None
                
                if qtype == "MCQ":
                    for num, oid in opt_map.items():
                        if str(oid) == str(official_ans):
                            correct_letter = ["a", "b", "c", "d"][num - 1]
                            break
                    if not correct_letter and official_ans in ["1", "2", "3", "4"]:
                        correct_letter = ["a", "b", "c", "d"][int(official_ans) - 1]
                else:
                    numerical_val = official_ans
                    
                q_blocks.append({
                    "meta_rect": b[:4],
                    "qid": qid,
                    "qtype": qtype,
                    "options": opt_map,
                    "official_ans_raw": official_ans,
                    "correct_option": correct_letter,
                    "numerical_answer": numerical_val,
                    "page": page_num
                })
                
        q_blocks.sort(key=lambda x: x["meta_rect"][1])
        
        for i, qb in enumerate(q_blocks):
            if i == 0:
                y0 = max(0, qb["meta_rect"][1] - 300)
                for hl in reversed(h_lines):
                    if hl < qb["meta_rect"][1] - 50:
                        y0 = hl
                        break
            else:
                y0 = q_blocks[i-1]["meta_rect"][3] + 5
                for hl in h_lines:
                    if q_blocks[i-1]["meta_rect"][3] < hl < qb["meta_rect"][1]:
                        y0 = hl
                        break
                        
            y1 = qb["meta_rect"][3] + 15
            for hl in h_lines:
                if qb["meta_rect"][1] < hl < (q_blocks[i+1]["meta_rect"][1] if i+1 < len(q_blocks) else page.rect.height):
                    y1 = max(y1, hl + 5)
                    break
                    
            crop_rect = fitz.Rect(page.rect.x0, y0, page.rect.x1, y1) & page.rect
            crop_pix = page.get_pixmap(clip=crop_rect, dpi=200)
            crop_filename = f"q{current_q_num:02d}.png"
            crop_pix.save(os.path.join(crops_dir, crop_filename))
            
            # Subject mapping: Q1-25 Maths, Q26-50 Physics, Q51-75 Chem
            subject = "Maths" if current_q_num <= 25 else ("Physics" if current_q_num <= 50 else "Chemistry")
            
            qb["question_number"] = current_q_num
            qb["subject"] = subject
            qb["crop_file"] = crop_filename
            questions_meta.append(qb)
            current_q_num += 1

    print(f"[{paper_code}] Cropped & indexed {len(questions_meta)} questions.")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(questions_meta, f, indent=2)
        
    return len(questions_meta)

for p_key, p_code, attempt, shift in PAPERS:
    crop_and_index_paper(p_key, p_code, attempt, shift)

print("\nALL 10 PAPERS CROPPED & INDEXED SUCCESSFULLY!")
