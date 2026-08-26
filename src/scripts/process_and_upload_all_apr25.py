import fitz
import json
import os
import io
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
    img_path = "tmp/temp_diag_apr.png"
    pix.save(img_path)
    im = Image.open(img_path).convert("RGB")
    
    # Strip left margin (Q.XX) and right border
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
    ("paper_1.pdf", "02apr_s1", "JEE-MAIN-25-02APR-S1", "JEE Main 2025 (02 Apr Shift 1)"),
    ("paper_2.pdf", "02apr_s2", "JEE-MAIN-25-02APR-S2", "JEE Main 2025 (02 Apr Shift 2)"),
    ("paper_3.pdf", "03apr_s1", "JEE-MAIN-25-03APR-S1", "JEE Main 2025 (03 Apr Shift 1)"),
    ("paper_4.pdf", "03apr_s2", "JEE-MAIN-25-03APR-S2", "JEE Main 2025 (03 Apr Shift 2)"),
    ("paper_5.pdf", "04apr_s1", "JEE-MAIN-25-04APR-S1", "JEE Main 2025 (04 Apr Shift 1)"),
    ("paper_6.pdf", "04apr_s2", "JEE-MAIN-25-04APR-S2", "JEE Main 2025 (04 Apr Shift 2)"),
    ("paper_7.pdf", "07apr_s1", "JEE-MAIN-25-07APR-S1", "JEE Main 2025 (07 Apr Shift 1)"),
    ("paper_8.pdf", "07apr_s2", "JEE-MAIN-25-07APR-S2", "JEE Main 2025 (07 Apr Shift 2)"),
    ("paper_9.pdf", "08apr_s2", "JEE-MAIN-25-08APR-S2", "JEE Main 2025 (08 Apr Shift 2)"),
]

print("Starting Master Ingest & Sync for all 9 JEE Main April 2025 Shift Papers...")

total_synced = 0

for pdf_name, file_prefix, paper_code, title in PAPER_MAP:
    print(f"\n=======================================================", flush=True)
    print(f"Syncing {paper_code} ({title})...", flush=True)
    print(f"=======================================================", flush=True)
    
    # Load 3 transcribed files
    with open(f"tmp/{file_prefix}_maths.json") as f:
        maths_qs = json.load(f)
    with open(f"tmp/{file_prefix}_physics.json") as f:
        physics_qs = json.load(f)
    with open(f"tmp/{file_prefix}_chem.json") as f:
        chem_qs = json.load(f)
        
    all_75_qs = maths_qs + physics_qs + chem_qs
    assert len(all_75_qs) == 75, f"Expected 75 questions, got {len(all_75_qs)}"
    
    meta_path = f"tmp/jee-main-2025-apr/{paper_code}/meta.json"
    with open(meta_path) as f:
        meta_list = json.load(f)
    meta_by_num = {m["question_number"]: m for m in meta_list}
    
    pdf_doc = fitz.open(f"tmp/jee-main-2025-apr/pdfs/{pdf_name}")
    out_dir = f"tmp/jee-main-2025-apr/{paper_code}/clean_assets"
    os.makedirs(out_dir, exist_ok=True)
    
    for q_data in all_75_qs:
        qnum = q_data.get("number") or q_data.get("question_number")
        qmeta = meta_by_num.get(qnum, {})
        needs_image = q_data.get("needs_image", False)
        
        question_image_url = None
        opt_a_url = None
        opt_b_url = None
        opt_c_url = None
        opt_d_url = None
        
        if needs_image and qmeta:
            pno = qmeta.get("page", 0)
            page = pdf_doc[pno]
            crop_rect = fitz.Rect(qmeta["crop_rect"])
            m_rect = fitz.Rect(qmeta["meta_rect"])
            
            # Find Option 1 y-coordinate
            opt_y0 = m_rect[1]
            for b in page.get_text("blocks"):
                if "Option" in b[4] or "1." in b[4]:
                    if crop_rect[1] <= b[1] <= m_rect[1]:
                        if b[1] < opt_y0:
                            opt_y0 = b[1]
                            
            # Check for individual option structure images
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
            if len(unique_opts) == 4 and qnum > 50:
                pix_samples = [fitz.Pixmap(pdf_doc, u[1]) for u in unique_opts]
                if any(p.height >= 35 for p in pix_samples) or any(p.width >= 80 and p.height >= 30 for p in pix_samples):
                    is_structure_options = True
                    
            if is_structure_options:
                urls = []
                for opt_idx, (y_pos, xref) in enumerate(unique_opts):
                    pix = fitz.Pixmap(pdf_doc, xref)
                    opt_letter = ["a", "b", "c", "d"][opt_idx]
                    opt_filename = f"q{qnum:02d}_opt_{opt_letter}.png"
                    opt_filepath = os.path.join(out_dir, opt_filename)
                    if pix.alpha:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save(opt_filepath)
                    im = Image.open(opt_filepath)
                    trimmed = trim_white(im, pad=4)
                    trimmed.save(opt_filepath)
                    storage_path = f"jee-main-2025-apr/{paper_code}/{opt_filename}"
                    url = upload_file_to_supabase(opt_filepath, storage_path)
                    urls.append(url)
                opt_a_url, opt_b_url, opt_c_url, opt_d_url = urls
                question_image_url = None
                print(f"  Q{qnum:02d}: Extracted & uploaded 4 separate option structure images")
            else:
                # Diagram in question stem
                # Diagram is between top of question and options
                q_diag_rect = fitz.Rect(page.rect.x0, crop_rect.y0 + 5, page.rect.x1, opt_y0 - 2) & page.rect
                diag_img = isolate_and_crop_diagram(page, q_diag_rect)
                diag_filename = f"q{qnum:02d}_diagram.png"
                diag_filepath = os.path.join(out_dir, diag_filename)
                diag_img.save(diag_filepath)
                storage_path = f"jee-main-2025-apr/{paper_code}/{diag_filename}"
                question_image_url = upload_file_to_supabase(diag_filepath, storage_path)
                print(f"  Q{qnum:02d}: Extracted & uploaded clean diagram ({diag_img.size[0]}x{diag_img.size[1]} px)")
                
        # Format correct option & numerical answer
        correct_opt = q_data.get("correct_option") or qmeta.get("correct_option")
        if correct_opt:
            correct_opt = correct_opt.lower()
            
        num_ans = q_data.get("numerical_answer") or qmeta.get("numerical_answer")
        if num_ans is not None:
            num_ans = str(num_ans).strip()
            
        opt_a_text = q_data.get("option_a") or ""
        opt_b_text = q_data.get("option_b") or ""
        opt_c_text = q_data.get("option_c") or ""
        opt_d_text = q_data.get("option_d") or ""
        
        db_row = {
            "paper_code": paper_code,
            "question_number": qnum,
            "subject": q_data.get("subject", "Maths" if qnum <= 25 else ("Physics" if qnum <= 50 else "Chemistry")),
            "question_type": q_data.get("question_type", "MCQ" if qnum not in [21,22,23,24,25,46,47,48,49,50,71,72,73,74,75] else "NUMERICAL"),
            "question": q_data["question"],
            "option_a": opt_a_text,
            "option_b": opt_b_text,
            "option_c": opt_c_text,
            "option_d": opt_d_text,
            "correct_option": correct_opt or "a",
            "numerical_answer": num_ans,
            "question_image": question_image_url,
            "option_a_image": opt_a_url,
            "option_b_image": opt_b_url,
            "option_c_image": opt_c_url,
            "option_d_image": opt_d_url
        }
        
        # Check if exists in pyq_questions
        existing = supabase.from_("pyq_questions").select("id").eq("paper_code", paper_code).eq("question_number", qnum).execute()
        if existing.data and len(existing.data) > 0:
            supabase.from_("pyq_questions").update(db_row).eq("paper_code", paper_code).eq("question_number", qnum).execute()
        else:
            supabase.from_("pyq_questions").insert(db_row).execute()
            
        total_synced += 1
        
    print(f"Completed {paper_code}: 75 questions updated in database!")

print(f"\n============================================================")
print(f"🎉 MASTER PIPELINE FINISHED: {total_synced} questions across all 9 April 2025 shifts published!")
print(f"============================================================")
