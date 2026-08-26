import fitz
import re
import os
import json

def process_pdf_questions(pdf_path, paper_code, out_dir):
    doc = fitz.open(pdf_path)
    os.makedirs(out_dir, exist_ok=True)
    crops_dir = os.path.join(out_dir, "crops")
    os.makedirs(crops_dir, exist_ok=True)
    
    questions_meta = []
    
    current_q_num = 1
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text_page = page.get_text("text")
        
        # Search for all Question ID blocks on this page
        # E.g. "Question Type : MCQ\nQuestion ID : 65644594\nOption 1 ID : 656445331..."
        blocks = page.get_text("blocks")
        
        # Also find horizontal lines or rectangles defining question boundaries
        # PyMuPDF can find drawing lines: page.get_drawings()
        drawings = page.get_drawings()
        h_lines = []
        for d in drawings:
            rect = d["rect"]
            if rect.width > 300 and rect.height < 5:  # horizontal line
                h_lines.append(rect.y0)
        h_lines = sorted(list(set(h_lines)))
        
        # Match questions by "Q.1", "Q.2", etc. or "Question ID :"
        # Let's find rects of text blocks containing "Q." or "Question ID"
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
                
        # For each question on page, find its bounding box
        # Typically from top of question to bottom of its metadata box or next horizontal line
        # Let's sort q_blocks by y0
        q_blocks.sort(key=lambda x: x["meta_rect"][1])
        
        pix = page.get_pixmap(dpi=200)
        scale_x = pix.width / page.rect.width
        scale_y = pix.height / page.rect.height
        
        # Crop each question on this page
        for i, qb in enumerate(q_blocks):
            # Find upper bound
            if i == 0:
                # If first on page, look for section header or line near top
                y0 = max(0, qb["meta_rect"][1] - 300)
                # If there is a section header or preceding h_line
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
                        
            # Find lower bound
            y1 = qb["meta_rect"][3] + 15
            for hl in h_lines:
                if qb["meta_rect"][1] < hl < (q_blocks[i+1]["meta_rect"][1] if i+1 < len(q_blocks) else page.rect.height):
                    y1 = max(y1, hl + 5)
                    break
                    
            crop_rect = fitz.Rect(page.rect.x0, y0, page.rect.x1, y1)
            # Clip to page
            crop_rect = crop_rect & page.rect
            
            crop_pix = page.get_pixmap(clip=crop_rect, dpi=200)
            crop_filename = f"q{current_q_num:02d}.png"
            crop_pix.save(os.path.join(crops_dir, crop_filename))
            
            qb["q_num"] = current_q_num
            qb["crop_file"] = crop_filename
            qb["crop_rect"] = [crop_rect.x0, crop_rect.y0, crop_rect.x1, crop_rect.y1]
            questions_meta.append(qb)
            current_q_num += 1

    print(f"{paper_code}: Processed {len(questions_meta)} questions across {len(doc)} pages.")
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(questions_meta, f, indent=2)
        
    return questions_meta

res = process_pdf_questions("tmp/jee-main-2026-jan/pdfs/paper_1.pdf", "JEE-MAIN-25-22JAN-S1", "tmp/jee-main-2025-jan/JEE-MAIN-25-22JAN-S1")
print("Paper 1 meta count:", len(res))
