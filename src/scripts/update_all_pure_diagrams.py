import fitz
import json
import os
import glob
from PIL import Image, ImageChops
import numpy as np
from supabase import create_client

env_vars = {}
with open(".env.local") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

supabase_url = env_vars.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = env_vars.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

def isolate_diagram_pure(page, crop_rect):
    pix = page.get_pixmap(clip=crop_rect, dpi=200)
    img_path = "tmp/temp_diag_p.png"
    pix.save(img_path)
    
    im_rgb = Image.open(img_path).convert("RGB")
    arr = np.array(im_rgb.convert("L"))
    
    # Mask out left 85px (to ensure Q.XX is 100% excluded) and right 40px
    ink_mask = (arr < 220)
    ink_mask[:, :85] = False
    ink_mask[:, -40:] = False
    
    ink_per_row = np.sum(ink_mask, axis=1)
    
    seen_diagram = False
    cut_y = len(ink_per_row)
    gap_count = 0
    
    for y, count in enumerate(ink_per_row):
        if count > 20:
            seen_diagram = True
            gap_count = 0
        elif seen_diagram:
            if count < 5:
                gap_count += 1
                if gap_count >= 8 and y - gap_count > 60:
                    cut_y = y - gap_count
                    break
            else:
                gap_count = 0
                
    cropped_v = im_rgb.crop((0, 0, im_rgb.width, cut_y))
    arr_c = np.array(cropped_v.convert("L"))
    diag_ink = (arr_c < 220)
    diag_ink[:, :85] = False
    diag_ink[:, -40:] = False
    
    if not np.any(diag_ink):
        return cropped_v
        
    rows = np.any(diag_ink, axis=1)
    cols = np.any(diag_ink, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    pad = 8
    rmin = max(0, rmin - pad)
    rmax = min(cropped_v.height, rmax + pad)
    cmin = max(80, cmin - pad)
    cmax = min(cropped_v.width, cmax + pad)
    
    return cropped_v.crop((cmin, rmin, cmax, rmax))

def upload_file_to_supabase(local_path, storage_path):
    with open(local_path, "rb") as f:
        file_bytes = f.read()
    supabase.storage.from_("pyq-images").upload(
        storage_path,
        file_bytes,
        file_options={"content-type": "image/png", "upsert": "true"}
    )
    return supabase.storage.from_("pyq-images").get_public_url(storage_path)

PAPER_MAP = [
    ("paper_1.pdf", "JEE-MAIN-25-22JAN-S1", "22jan_s1"),
    ("paper_2.pdf", "JEE-MAIN-25-22JAN-S2", "22jan_s2"),
    ("paper_3.pdf", "JEE-MAIN-25-23JAN-S1", "23jan_s1"),
    ("paper_4.pdf", "JEE-MAIN-25-23JAN-S2", "23jan_s2"),
    ("paper_5.pdf", "JEE-MAIN-25-24JAN-S1", "24jan_s1"),
    ("paper_6.pdf", "JEE-MAIN-25-24JAN-S2", "24jan_s2"),
    ("paper_7.pdf", "JEE-MAIN-25-28JAN-S1", "28jan_s1"),
    ("paper_8.pdf", "JEE-MAIN-25-28JAN-S2", "28jan_s2"),
    ("paper_9.pdf", "JEE-MAIN-25-29JAN-S1", "29jan_s1"),
    ("paper_10.pdf", "JEE-MAIN-25-29JAN-S2", "29jan_s2"),
]

for pdf_name, paper_code, prefix in PAPER_MAP:
    pdf_path = os.path.join("tmp/jee-main-2026-jan/pdfs", pdf_name)
    doc = fitz.open(pdf_path)
    out_dir = f"tmp/jee-main-2025-jan/{paper_code}/pure_diagrams"
    os.makedirs(out_dir, exist_ok=True)
    
    with open(f"tmp/jee-main-2025-jan/{paper_code}/meta.json") as f:
        meta = json.load(f)
        
    transcribed_qs = {}
    for sub in ["maths", "physics", "chem"]:
        with open(f"tmp/{prefix}_{sub}.json") as f:
            for q in json.load(f):
                qnum = q.get("number") or q.get("question_number")
                transcribed_qs[qnum] = q
                
    for qb in meta:
        qnum = qb["question_number"]
        pno = qb["page"]
        page = doc[pno]
        m_rect = qb["meta_rect"]
        
        t_q = transcribed_qs.get(qnum, {})
        needs_image = t_q.get("needs_image") is True
        
        # Check if DB has question_image
        # If question_number <= 50 (Physics/Maths) or Chemistry diagram
        if needs_image and (qnum <= 50 or qnum in [53, 61, 62, 65, 68, 69, 71, 72, 73, 74, 75]):
            y_top = 0
            for prev_qb in meta:
                if prev_qb["page"] == pno and prev_qb["meta_rect"][3] < m_rect[1]:
                    y_top = max(y_top, prev_qb["meta_rect"][3] + 5)
                    
            blocks = page.get_text("blocks")
            opt_y0 = m_rect[1]
            for b in blocks:
                if "Options" in b[4] and y_top <= b[1] < m_rect[1]:
                    opt_y0 = min(opt_y0, b[1])
                    
            q_diag_rect = fitz.Rect(page.rect.x0, y_top + 5, page.rect.x1, opt_y0 - 2) & page.rect
            diag_img = isolate_diagram_pure(page, q_diag_rect)
            diag_filename = f"q{qnum:02d}_diagram.png"
            diag_filepath = os.path.join(out_dir, diag_filename)
            diag_img.save(diag_filepath)
            storage_path = f"jee-main-2025-jan/{paper_code}/{diag_filename}"
            url = upload_file_to_supabase(diag_filepath, storage_path)
            
            supabase.from_("pyq_questions").update({
                "question_image": url,
            }).eq("paper_code", paper_code).eq("question_number", qnum).execute()
            
            print(f"[{paper_code}] Q{qnum:02d}: Pure Diagram Uploaded ({diag_img.size[0]}x{diag_img.size[1]} px)")

print("ALL PURE DIAGRAMS SYNCED!")
