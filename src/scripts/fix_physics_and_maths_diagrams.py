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

def trim_white(im, pad=4):
    im_rgb = im.convert("RGB")
    bg = Image.new("RGB", im_rgb.size, (255, 255, 255))
    diff = ImageChops.difference(im_rgb, bg)
    bbox = diff.getbbox()
    if bbox:
        cmin = max(0, bbox[0] - pad)
        rmin = max(0, bbox[1] - pad)
        cmax = min(im_rgb.width, bbox[2] + pad)
        rmax = min(im_rgb.height, bbox[3] + pad)
        return im_rgb.crop((cmin, rmin, cmax, rmax))
    return im_rgb

def isolate_and_crop_diagram(page, crop_rect):
    pix = page.get_pixmap(clip=crop_rect, dpi=200)
    img_path = "tmp/temp_diag_pm.png"
    pix.save(img_path)
    im = Image.open(img_path).convert("RGB")
    
    if im.width > 80:
        im_inner = im.crop((40, 0, im.width - 40, im.height))
    else:
        im_inner = im
        
    arr = np.array(im_inner.convert("L"))
    ink = (arr < 220)
    
    ink_per_row = np.sum(ink, axis=1)
    
    seen_ink = False
    cut_y = len(ink_per_row)
    gap_len = 0
    
    for y, count in enumerate(ink_per_row):
        if count > 25:
            seen_ink = True
            gap_len = 0
        elif seen_ink:
            if count < 6:
                gap_len += 1
                if gap_len >= 10 and y - gap_len > 70:
                    cut_y = y - gap_len
                    break
            else:
                gap_len = 0
                
    diag_crop = im_inner.crop((0, 0, im_inner.width, cut_y))
    return trim_white(diag_crop, pad=8)

def upload_file_to_supabase(local_path, storage_path):
    with open(local_path, "rb") as f:
        file_bytes = f.read()
    res = supabase.storage.from_("pyq-images").upload(
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
    out_dir = f"tmp/jee-main-2025-jan/{paper_code}/clean_pm_diagrams"
    os.makedirs(out_dir, exist_ok=True)
    
    with open(f"tmp/jee-main-2025-jan/{paper_code}/meta.json") as f:
        meta = json.load(f)
        
    transcribed_qs = {}
    for sub in ["maths", "physics"]:
        with open(f"tmp/{prefix}_{sub}.json") as f:
            for q in json.load(f):
                qnum = q.get("number") or q.get("question_number")
                transcribed_qs[qnum] = q
                
    for qb in meta:
        qnum = qb["question_number"]
        if qnum > 50:
            continue # chemistry is handled separately
            
        pno = qb["page"]
        page = doc[pno]
        m_rect = qb["meta_rect"]
        
        t_q = transcribed_qs.get(qnum, {})
        needs_image = t_q.get("needs_image") is True
        
        if not needs_image:
            # Clear all images
            supabase.from_("pyq_questions").update({
                "question_image": None,
                "option_a_image": None,
                "option_b_image": None,
                "option_c_image": None,
                "option_d_image": None,
            }).eq("paper_code", paper_code).eq("question_number", qnum).execute()
            continue
            
        # Has diagram in question body
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
        diag_img = isolate_and_crop_diagram(page, q_diag_rect)
        diag_filename = f"q{qnum:02d}_diagram.png"
        diag_filepath = os.path.join(out_dir, diag_filename)
        diag_img.save(diag_filepath)
        storage_path = f"jee-main-2025-jan/{paper_code}/{diag_filename}"
        url = upload_file_to_supabase(diag_filepath, storage_path)
        
        # In Physics and Maths, set question_image and clear option images
        supabase.from_("pyq_questions").update({
            "question_image": url,
            "option_a_image": None,
            "option_b_image": None,
            "option_c_image": None,
            "option_d_image": None,
        }).eq("paper_code", paper_code).eq("question_number", qnum).execute()
        
        print(f"[{paper_code}] Q{qnum:02d}: Clean Diagram Synced ({diag_img.size[0]}x{diag_img.size[1]} px)")

print("Physics & Maths clean diagram sync finished.")
