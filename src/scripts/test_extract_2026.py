import fitz
import json
import os
import re
from PIL import Image, ImageChops
import numpy as np

def test_paper(pdf_path):
    doc = fitz.open(pdf_path)
    mid_x = doc[0].rect.width / 2.0
    
    questions = []
    
    for pno in range(len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        
        # Sort blocks by column, then y-coordinate
        col_left = [b for b in blocks if b[0] < mid_x - 10 and b[1] > 60]
        col_right = [b for b in blocks if b[2] > mid_x + 10 and b[1] > 60]
        
        for col_name, col_blocks in [("left", col_left), ("right", col_right)]:
            col_blocks.sort(key=lambda b: (b[1], b[0]))
            
            curr_q = None
            for b in col_blocks:
                txt = b[4].strip()
                m_q = re.match(r"^(\d+)\.\s*(.*)", txt, re.DOTALL)
                if m_q and int(m_q.group(1)) <= 75:
                    if curr_q:
                        questions.append(curr_q)
                    curr_q = {
                        "number": int(m_q.group(1)),
                        "page": pno,
                        "raw_blocks": [m_q.group(2) if m_q.group(2) else ""],
                        "rects": [b[:4]]
                    }
                elif curr_q:
                    curr_q["raw_blocks"].append(txt)
                    curr_q["rects"].append(b[:4])
                    
            if curr_q:
                questions.append(curr_q)
                
    # Sort by question number
    questions.sort(key=lambda q: q["number"])
    print(f"Extracted {len(questions)} questions from {pdf_path}")
    for q in questions[:5]:
        print(f"Q{q['number']}: {' '.join(q['raw_blocks'])[:120]}")

test_paper("tmp/jee-main-jan/pdfs/21jan_s1.pdf")
