import json
import re
from pathlib import Path
import fitz  # PyMuPDF
import pdfplumber
from PIL import Image, ImageChops

ROOT = Path.cwd()
INPUT_DIR = ROOT / "tmp" / "jee-main-2026-april-input"
OUT_ROOT = ROOT / "tmp" / "jee-main-2026-april-clean"

PAPERS = [
    {"code": "JEE-MAIN-26-02APR-S1", "pdf": "JEE_Main_2026_02_April_Shift_1.pdf", "day": 2, "shift": 1},
    {"code": "JEE-MAIN-26-02APR-S2", "pdf": "JEE_Main_2026_02_April_Shift_2.pdf", "day": 2, "shift": 2},
    {"code": "JEE-MAIN-26-04APR-S1", "pdf": "JEE_Main_2026_04_April_Shift_1.pdf", "day": 4, "shift": 1},
    {"code": "JEE-MAIN-26-04APR-S2", "pdf": "JEE_Main_2026_04_April_Shift_2.pdf", "day": 4, "shift": 2},
    {"code": "JEE-MAIN-26-05APR-S1", "pdf": "JEE_Main_2026_05_April_Shift_1.pdf", "day": 5, "shift": 1},
    {"code": "JEE-MAIN-26-05APR-S2", "pdf": "JEE_Main_2026_05_April_Shift_2.pdf", "day": 5, "shift": 2},
    {"code": "JEE-MAIN-26-06APR-S1", "pdf": "JEE_Main_2026_06_April_Shift_1.pdf", "day": 6, "shift": 1},
    {"code": "JEE-MAIN-26-06APR-S2", "pdf": "JEE_Main_2026_06_April_Shift_2.pdf", "day": 6, "shift": 2},
    {"code": "JEE-MAIN-26-08APR-S2", "pdf": "JEE_Main_2026_08_April_Shift_2.pdf", "day": 8, "shift": 2},
]

def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)

def subject_for_number(number: int) -> str:
    if number <= 25:
        return "Maths"
    if number <= 50:
        return "Physics"
    return "Chemistry"

def is_numerical(number: int) -> bool:
    return number % 25 in {21, 22, 23, 24, 0}

def trim_whitespace(image: Image.Image, border: int = 6) -> Image.Image:
    bg = Image.new(image.mode, image.size, "white")
    diff = ImageChops.difference(image, bg)
    bbox = diff.getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - border)
    top = max(0, bbox[1] - border)
    right = min(image.width, bbox[2] + border)
    bottom = min(image.height, bbox[3] + border)
    return image.crop((left, top, right, bottom))

def render_pages_fitz(pdf_path: Path, page_dir: Path, dpi: int = 200):
    ensure_dir(page_dir)
    doc = fitz.open(pdf_path)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out_path = page_dir / f"page-{page_num + 1:02}.png"
        pix.save(str(out_path))

def process_paper(paper_info: dict):
    code = paper_info["code"]
    pdf_path = INPUT_DIR / paper_info["pdf"]
    out_dir = OUT_ROOT / code
    page_dir = out_dir / "pages"
    crop_dir = out_dir / "crops"
    ensure_dir(crop_dir)

    print(f"Processing {code} from {pdf_path.name}...")
    render_pages_fitz(pdf_path, page_dir)

    # Extract question anchors with pdfplumber
    anchors_by_page = {}
    pages_data = {}
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            words = page.extract_words(x_tolerance=1, y_tolerance=1)
            anchors = []
            for w in words:
                match = re.fullmatch(r"Q(\d{1,2})\.", w["text"])
                if match:
                    q_num = int(match.group(1))
                    if 1 <= q_num <= 75:
                        anchors.append({"number": q_num, "top": w["top"], "bottom": w["bottom"], "x0": w["x0"], "x1": w["x1"]})
            anchors.sort(key=lambda a: a["top"])
            anchors_by_page[page_num] = anchors
            pages_data[page_num] = {"width": page.width, "height": page.height, "words": words}

    # Load draft data to get official answers
    draft_file = ROOT / "tmp" / "jee-main-2026-april" / "draft" / f"{code}.json"
    draft_data = json.loads(draft_file.read_text())
    answers_by_num = {q["number"]: q["answer"] for q in draft_data["questions"]}

    manifest = []
    page_images = {
        int(p.stem.split("-")[-1]): Image.open(p).convert("RGB")
        for p in page_dir.glob("page-*.png")
    }

    for page_num, anchors in anchors_by_page.items():
        if not anchors:
            continue
        page_meta = pages_data[page_num]
        page_img = page_images[page_num]
        y_scale = page_img.height / page_meta["height"]
        x_scale = page_img.width / page_meta["width"]

        for i, anchor in enumerate(anchors):
            q_num = anchor["number"]
            top_pt = anchor["top"] - 4
            if i + 1 < len(anchors):
                bottom_pt = anchors[i + 1]["top"] - 2
            else:
                bottom_pt = page_meta["height"] - 10

            raw_left = 10
            raw_right = page_img.width - 10
            raw_top = max(0, int(top_pt * y_scale))
            raw_bottom = min(page_img.height, int(bottom_pt * y_scale))

            raw_crop = page_img.crop((raw_left, raw_top, raw_right, raw_bottom))
            trimmed = trim_whitespace(raw_crop)
            crop_path = crop_dir / f"q{q_num:02d}.png"
            trimmed.save(crop_path, optimize=True)

            ans = answers_by_num.get(q_num, "1")
            num_q = is_numerical(q_num)
            correct_opt = "a"
            num_ans = None
            if num_q:
                try:
                    num_ans = float(ans)
                    if num_ans.is_integer():
                        num_ans = int(num_ans)
                except ValueError:
                    num_ans = None
            else:
                try:
                    correct_opt = "abcd"[int(ans) - 1]
                except (ValueError, IndexError):
                    correct_opt = "a"

            manifest.append({
                "number": q_num,
                "subject": subject_for_number(q_num),
                "question_type": "NUMERICAL" if num_q else "MCQ",
                "correct_option": correct_opt,
                "numerical_answer": num_ans,
                "answer_raw": str(ans),
                "crop_path": str(crop_path),
                "page_number": page_num,
            })

    manifest.sort(key=lambda item: item["number"])
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"  Done {code}: {len(manifest)} questions cropped.")

def main():
    ensure_dir(OUT_ROOT)
    for paper in PAPERS:
        process_paper(paper)
    print("All 9 papers successfully cropped and prepared!")

if __name__ == "__main__":
    main()
