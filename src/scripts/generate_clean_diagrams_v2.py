import fitz
import json
import os
import glob
from PIL import Image, ImageChops

def trim_white_borders(pil_img, pad=6):
    bg = Image.new(pil_img.mode, pil_img.size, (255, 255, 255) if pil_img.mode == "RGB" else 255)
    diff = ImageChops.difference(pil_img, bg)
    bbox = diff.getbbox()
    if bbox:
        w, h = pil_img.size
        cmin = max(0, bbox[0] - pad)
        rmin = max(0, bbox[1] - pad)
        cmax = min(w, bbox[2] + pad)
        rmax = min(h, bbox[3] + pad)
        return pil_img.crop((cmin, rmin, cmax, rmax))
    return pil_img

def extract_clean_paper_assets_v2(pdf_path, paper_code, json_files, out_dir):
    doc = fitz.open(pdf_path)
    os.makedirs(out_dir, exist_ok=True)
    
    with open(f"tmp/jee-main-2025-jan/{paper_code}/meta.json") as f:
        meta = json.load(f)
        
    # Read the 3 transcribed json files to know needs_image flags
    transcribed_qs = {}
    for jf in json_files:
        with open(jf) as f:
            for q in json.load(f):
                qnum = q.get("number") or q.get("question_number")
                transcribed_qs[qnum] = q
                
    assets = {}
    
    for qb in meta:
        qnum = qb["question_number"]
        pno = qb["page"]
        page = doc[pno]
        m_rect = qb["meta_rect"]
        
        t_q = transcribed_qs.get(qnum, {})
        needs_image = t_q.get("needs_image") is True
        
        q_entry = {
            "question_image": None,
            "option_a_image": None,
            "option_b_image": None,
            "option_c_image": None,
            "option_d_image": None,
        }
        
        if not needs_image:
            assets[qnum] = q_entry
            continue
            
        # If needs_image is True, find if it is a question diagram or option images
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
                
        # Check option images
        images_on_page = page.get_images()
        opt_images = []
        for img in images_on_page:
            xref = img[0]
            for r in page.get_image_rects(xref):
                if opt_y0 - 20 <= r.y0 and r.y1 <= m_rect[1] + 15 and r.x1 < m_rect[0] + 50:
                    opt_images.append((r.y0, xref))
                    
        opt_images.sort(key=lambda x: x[0])
        unique_opts = []
        for y_pos, xref in opt_images:
            if not any(abs(y_pos - u[0]) < 5 for u in unique_opts):
                unique_opts.append((y_pos, xref))
                
        # If the option images are structures (height > 35 or aspect ratio square-like):
        is_structure_options = False
        if len(unique_opts) == 4:
            # Check dimensions of option images
            pix_samples = [fitz.Pixmap(doc, u[1]) for u in unique_opts]
            # If heights are > 38 or they are drawing structures
            if any(p.height >= 40 for p in pix_samples) or any(p.width >= 100 and p.height >= 38 for p in pix_samples):
                is_structure_options = True
                
        if is_structure_options:
            for opt_idx, (y_pos, xref) in enumerate(unique_opts):
                pix = fitz.Pixmap(doc, xref)
                opt_letter = ["a", "b", "c", "d"][opt_idx]
                opt_filename = f"q{qnum:02d}_opt_{opt_letter}.png"
                opt_filepath = os.path.join(out_dir, opt_filename)
                pix.save(opt_filepath)
                im = Image.open(opt_filepath)
                trimmed = trim_white_borders(im, pad=4)
                if trimmed:
                    trimmed.save(opt_filepath)
                q_entry[f"option_{opt_letter}_image"] = opt_filepath
        else:
            # It is a question diagram!
            # Render the region between y_top and opt_y0 at 200 DPI
            # Clip between question left margin and metadata box right margin
            q_diag_rect = fitz.Rect(page.rect.x0 + 40, y_top + 10, page.rect.x1 - 10, opt_y0 - 2) & page.rect
            diag_pix = page.get_pixmap(clip=q_diag_rect, dpi=200)
            diag_filename = f"q{qnum:02d}_diagram.png"
            diag_filepath = os.path.join(out_dir, diag_filename)
            diag_pix.save(diag_filepath)
            
            im = Image.open(diag_filepath)
            trimmed = trim_white_borders(im, pad=6)
            if trimmed:
                trimmed.save(diag_filepath)
            q_entry["question_image"] = diag_filepath
            
        assets[qnum] = q_entry
        
    return assets

print("Clean diagram extractor v2 ready")
