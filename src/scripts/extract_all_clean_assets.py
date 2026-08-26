import fitz
import json
import os
import glob
from PIL import Image

def get_question_pages_and_rects(pdf_path):
    doc = fitz.open(pdf_path)
    questions_meta = [] # (q_num, page_idx, q_rect, [opt_rects])
    
    # We will find question markers "Q.1", "Q.2", ... "Q.75"
    for page_idx, page in enumerate(doc):
        text_instances = []
        for q_num in range(1, 76):
            # Search for "Q.<q_num>"
            quads = page.search_for(f"Q.{q_num}")
            if quads:
                # Find metadata box
                qid_quads = page.search_for("Question ID :")
                text_instances.append({
                    "q_num": q_num,
                    "rect": quads[0],
                })
    return doc

print("Script framework ready.")
