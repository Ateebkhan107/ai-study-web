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
                if opt_y0 - 20 <= r.y0 and r.y1 <= m_rect[1] + 15 and r.x1 < m_rect[0] + 50:
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
            "has_diagram": False,
            "diagram_path": None
        }
        
        if len(unique_opts) == 4:
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
                
        # Check if question body has a diagram (e.g. circuit, graph, visual setup)
        # Look for images located between y_top and opt_y0
        body_images = []
        for img in images_on_page:
            xref = img[0]
            for r in page.get_image_rects(xref):
                if y_top <= r.y0 and r.y1 <= opt_y0 + 10:
                    pix = fitz.Pixmap(doc, xref)
                    # Check if this image has significant graphical content (not just a 1-line formula)
                    if pix.width >= 150 and pix.height >= 80:
                        body_images.append((xref, r, pix))
                        
        if body_images and not q_entry["has_option_images"]:
            # Extract and trim diagram
            xref, r, pix = body_images[0]
            diag_filename = f"q{qnum:02d}_diagram.png"
            diag_filepath = os.path.join(out_dir, diag_filename)
            pix.save(diag_filepath)
            
            # Trim question text from bottom of diagram if present (e.g. Q40)
            im = Image.open(diag_filepath)
            
            # If image is very tall (combining diagram and question text), crop top diagram portion
            # Most diagrams are in the upper 60-70% of the image box
            diag_trimmed = trim_white_borders(im, pad=4)
            if diag_trimmed:
                diag_trimmed.save(diag_filepath)
                
            q_entry["has_diagram"] = True
            q_entry["diagram_path"] = diag_filepath
            
        paper_assets[qnum] = q_entry
        
    return paper_assets

# Let's run across all 10 papers!
PAPER_MAP = {
    "paper_1.pdf": "JEE-MAIN-25-22JAN-S1",
    "paper_2.pdf": "JEE-MAIN-25-22JAN-S2",
    "paper_3.pdf": "JEE-MAIN-25-23JAN-S1",
    "paper_4.pdf": "JEE-MAIN-25-23JAN-S2",
    "paper_5.pdf": "JEE-MAIN-25-24JAN-S1",
    "paper_6.pdf": "JEE-MAIN-25-24JAN-S2",
    "paper_7.pdf": "JEE-MAIN-25-28JAN-S1",
    "paper_8.pdf": "JEE-MAIN-25-28JAN-S2",
    "paper_9.pdf": "JEE-MAIN-25-29JAN-S1",
    "paper_10.pdf": "JEE-MAIN-25-29JAN-S2",
}

for pdf_name, paper_code in PAPER_MAP.items():
    pdf_path = os.path.join("tmp/jee-main-2026-jan/pdfs", pdf_name)
    out_dir = f"tmp/jee-main-2025-jan/{paper_code}/clean_assets"
    res = extract_paper_assets(pdf_path, paper_code, out_dir)
    opt_count = sum(1 for a in res.values() if a["has_option_images"])
    diag_count = sum(1 for a in res.values() if a["has_diagram"])
    print(f"{paper_code:22s} -> {opt_count} questions with option structures, {diag_count} questions with diagrams")
    with open(f"tmp/jee-main-2025-jan/{paper_code}/assets_manifest.json", "w") as f:
        json.dump(res, f, indent=2)
