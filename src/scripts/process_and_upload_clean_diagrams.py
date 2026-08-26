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

def extract_paper_assets(pdf_path, paper_code, out_dir):
    doc = fitz.open(pdf_path)
    os.makedirs(out_dir, exist_ok=True)
    
    with open(f"tmp/jee-main-2025-jan/{paper_code}/meta.json") as f:
        meta = json.load(f)
        
    paper_assets = {}
    
    for qb in meta:
        qnum = qb["question_number"]
        pno = qb["page"]
        page = doc[pno]
        m_rect = qb["meta_rect"]
        
        # Preceding question bottom on same page, or top of page
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
                
        # Check for 4 option images
        images_on_page = page.get_images()
        opt_images = []
        for img in images_on_page:
            xref = img[0]
            for r in page.get_image_rects(xref):
                # Must be between opt_y0 and m_rect[1]
                if opt_y0 <= r.y0 and r.y1 <= m_rect[1] + 15 and r.x1 < m_rect[0] + 50:
                    opt_images.append((r.y0, xref))
                    
        opt_images.sort(key=lambda x: x[0])
        
        # Deduplicate same xref or nearby rects
        unique_opts = []
        for y_pos, xref in opt_images:
            if not any(abs(y_pos - u[0]) < 5 for u in unique_opts):
                unique_opts.append((y_pos, xref))
                
        q_entry = {
            "has_option_images": False,
            "option_images": {},
            "diagram_crop": None
        }
        
        if len(unique_opts) == 4:
            # 4 distinct option images!
            q_entry["has_option_images"] = True
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
                q_entry["option_images"][opt_letter] = opt_filepath
                
        paper_assets[qnum] = q_entry
        
    return paper_assets

# Test on 29JAN-S2
assets = extract_paper_assets("tmp/jee-main-2026-jan/pdfs/paper_10.pdf", "JEE-MAIN-25-29JAN-S2", "tmp/jee-main-2025-jan/JEE-MAIN-25-29JAN-S2/clean_assets")
for qnum, a in assets.items():
    if a["has_option_images"]:
        print(f"Q{qnum}: Option images extracted:", a["option_images"])
