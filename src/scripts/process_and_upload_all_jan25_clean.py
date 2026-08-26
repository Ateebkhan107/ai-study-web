import fitz
import json
import os
import glob
import re
from PIL import Image, ImageChops
import numpy as np
from supabase import create_client

# Load environment
env_vars = {}
with open(".env.local") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

supabase_url = env_vars.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = env_vars.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in .env.local")

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
    img_path = "tmp/temp_diag.png"
    pix.save(img_path)
    im = Image.open(img_path).convert("RGB")
    
    # Strip left and right border lines (40px margins)
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
    public_url = supabase.storage.from_("pyq-images").get_public_url(storage_path)
    return public_url

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
    print(f"\n==========================================")
    print(f"Processing Clean Assets & DB Update: {paper_code}")
    print(f"==========================================")
    
    pdf_path = os.path.join("tmp/jee-main-2026-jan/pdfs", pdf_name)
    doc = fitz.open(pdf_path)
    out_dir = f"tmp/jee-main-2025-jan/{paper_code}/clean_assets_v3"
    os.makedirs(out_dir, exist_ok=True)
    
    with open(f"tmp/jee-main-2025-jan/{paper_code}/meta.json") as f:
        meta = json.load(f)
        
    # Read transcribed JSONs
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
        
        question_image_url = None
        opt_a_url = None
        opt_b_url = None
        opt_c_url = None
        opt_d_url = None
        
        if needs_image:
            # Preceding question bottom on same page
            y_top = 0
            for prev_qb in meta:
                if prev_qb["page"] == pno and prev_qb["meta_rect"][3] < m_rect[1]:
                    y_top = max(y_top, prev_qb["meta_rect"][3] + 5)
                    
            # Find 'Options' block
            blocks = page.get_text("blocks")
            opt_y0 = m_rect[1]
            for b in blocks:
                if "Options" in b[4] and y_top <= b[1] < m_rect[1]:
                    opt_y0 = min(opt_y0, b[1])
                    
            images_on_page = page.get_images()
            opt_images = []
            for img in images_on_page:
                xref = img[0]
                for r in page.get_image_rects(xref):
                    if opt_y0 - 25 <= r.y0 and r.y1 <= m_rect[1] + 15 and r.x1 < m_rect[0] + 50:
                        opt_images.append((r.y0, xref))
                        
            opt_images.sort(key=lambda x: x[0])
            unique_opts = []
            for y_pos, xref in opt_images:
                if not any(abs(y_pos - u[0]) < 5 for u in unique_opts):
                    unique_opts.append((y_pos, xref))
                    
            is_structure_options = False
            if len(unique_opts) == 4:
                pix_samples = [fitz.Pixmap(doc, u[1]) for u in unique_opts]
                if any(p.height >= 38 for p in pix_samples) or any(p.width >= 90 and p.height >= 35 for p in pix_samples):
                    is_structure_options = True
                    
            if is_structure_options:
                urls = []
                for opt_idx, (y_pos, xref) in enumerate(unique_opts):
                    pix = fitz.Pixmap(doc, xref)
                    opt_letter = ["a", "b", "c", "d"][opt_idx]
                    opt_filename = f"q{qnum:02d}_opt_{opt_letter}.png"
                    opt_filepath = os.path.join(out_dir, opt_filename)
                    # Convert to RGB pixmap if needed
                    if pix.alpha:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save(opt_filepath)
                    im = Image.open(opt_filepath)
                    trimmed = trim_white(im, pad=4)
                    trimmed.save(opt_filepath)
                    storage_path = f"jee-main-2025-jan/{paper_code}/{opt_filename}"
                    url = upload_file_to_supabase(opt_filepath, storage_path)
                    urls.append(url)
                opt_a_url, opt_b_url, opt_c_url, opt_d_url = urls
                print(f"  Q{qnum:02d}: Uploaded 4 option structure images")
            else:
                # Question diagram
                q_diag_rect = fitz.Rect(page.rect.x0, y_top + 5, page.rect.x1, opt_y0 - 2) & page.rect
                diag_img = isolate_and_crop_diagram(page, q_diag_rect)
                diag_filename = f"q{qnum:02d}_diagram.png"
                diag_filepath = os.path.join(out_dir, diag_filename)
                diag_img.save(diag_filepath)
                storage_path = f"jee-main-2025-jan/{paper_code}/{diag_filename}"
                question_image_url = upload_file_to_supabase(diag_filepath, storage_path)
                print(f"  Q{qnum:02d}: Uploaded clean diagram ({diag_img.size[0]}x{diag_img.size[1]} px)")
                
        # Update database question
        update_data = {
            "question_image": question_image_url,
            "option_a_image": opt_a_url,
            "option_b_image": opt_b_url,
            "option_c_image": opt_c_url,
            "option_d_image": opt_d_url,
        }
        
        supabase.from_("pyq_questions").update(update_data).eq("paper_code", paper_code).eq("question_number", qnum).execute()

print("\n============================================================")
print("ALL 10 JEE MAIN JANUARY 2025 PAPERS ASSETS CLEANED & SYNCED!")
print("============================================================")
