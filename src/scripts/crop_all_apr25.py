import fitz
import re
import os
import json

PAPER_MAP = [
    ("paper_1.pdf", "JEE-MAIN-25-02APR-S1"),
    ("paper_2.pdf", "JEE-MAIN-25-02APR-S2"),
    ("paper_3.pdf", "JEE-MAIN-25-03APR-S1"),
    ("paper_4.pdf", "JEE-MAIN-25-03APR-S2"),
    ("paper_5.pdf", "JEE-MAIN-25-04APR-S1"),
    ("paper_6.pdf", "JEE-MAIN-25-04APR-S2"),
    ("paper_7.pdf", "JEE-MAIN-25-07APR-S1"),
    ("paper_8.pdf", "JEE-MAIN-25-07APR-S2"),
    ("paper_9.pdf", "JEE-MAIN-25-08APR-S2"),
]

with open("tmp/jee-main-2025-apr/official_answers.json") as f:
    official_keys = json.load(f)

for pdf_name, paper_code in PAPER_MAP:
    pdf_path = f"tmp/jee-main-2025-apr/pdfs/{pdf_name}"
    doc = fitz.open(pdf_path)
    out_dir = f"tmp/jee-main-2025-apr/{paper_code}"
    crops_dir = os.path.join(out_dir, "crops")
    os.makedirs(crops_dir, exist_ok=True)
    
    questions_meta = []
    current_q_num = 1
    
    ans_map = official_keys.get(paper_code, {})
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("blocks")
        
        # PyMuPDF horizontal drawings for bounding lines
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
                
                opt_map = {f"opt_{num}_id": oid for num, oid in opt_matches}
                
                q_blocks.append({
                    "meta_rect": b[:4],
                    "qid": qid_match.group(1) if qid_match else None,
                    "qtype": qtype_match.group(1) if qtype_match else "MCQ",
                    "options": opt_map,
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
            
            # Map correct answer from official key
            qid = qb["qid"]
            raw_ans = ans_map.get(qid)
            
            correct_opt = None
            numerical_ans = None
            
            if qb["qtype"] == "MCQ":
                for opt_key, oid in qb["options"].items():
                    if oid == raw_ans:
                        correct_opt = ["a", "b", "c", "d"][int(opt_key.split("_")[1]) - 1]
                        break
            else:
                numerical_ans = raw_ans
                correct_opt = "a"
                
            qb["question_number"] = current_q_num
            qb["crop_file"] = crop_filename
            qb["crop_rect"] = [crop_rect.x0, crop_rect.y0, crop_rect.x1, crop_rect.y1]
            qb["correct_option"] = correct_opt
            qb["numerical_answer"] = numerical_ans
            qb["official_ans_raw"] = raw_ans
            
            # Assign subject
            if current_q_num <= 25:
                qb["subject"] = "Maths"
            elif current_q_num <= 50:
                qb["subject"] = "Physics"
            else:
                qb["subject"] = "Chemistry"
                
            questions_meta.append(qb)
            current_q_num += 1
            
    print(f"{paper_code}: Generated crops and meta for {len(questions_meta)} questions.")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(questions_meta, f, indent=2)

print("All 9 April 2025 papers cropped successfully!")
