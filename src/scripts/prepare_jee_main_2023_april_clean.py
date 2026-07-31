import csv, json, re, subprocess
from pathlib import Path
from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "tmp" / "jee-main-2023-april-clean"
PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
PAPERS = {
    "JEE-MAIN-23-12APR-S1": {
        "source": "/Users/ateebfatmi/Downloads/9-JEEM-2023-APRIL-12-FIRST-SHIFT-PAPER.pdf",
        "ranges": [("Physics", 2, 6), ("Chemistry", 7, 13), ("Maths", 14, 17)],
        "answers": [
            "D","C","A","A","C","C","D","C","D","B","B","B","D","C","C","D","A","A","C","B",4,784,50,243,1,100,15,4,160,2,
            "A","C","B","A","D","B","B","B","A","B","B","C","A","D","B","A","A","A","A","B",9000,10,48,3,15,3,4,3,25,10,
            "C","B","B","C","A","B","D","D","C","B","D","D","A","D","D","A","B","D","A","DROP",64,575,944,288,211,7,10,3,2,6,
        ],
    },
    "JEE-MAIN-23-15APR-S1": {
        "source": "/Users/ateebfatmi/Downloads/12-JEEM-2023-APRIL-15-FIRST-SHIFT-PAPER.pdf",
        "ranges": [("Physics", 2, 7), ("Chemistry", 8, 13), ("Maths", 14, 17)],
        "answers": [
            "D","B","C","B","B","D","B","A","A","A","B","C","A","B","A","A","C","A","A","A",88,1150,30,5,40,90,5,5,3,30,
            "A","C","A","B","A","D","C","D","B","C","D","C","D","B","D","D","C","D","C","A",130,50,5,1,3,4,6,1070,5,23,
            "A","A","C","B","C","B","D","B","B","D","C","A","B","B","D","B","A","D","B","D",72,5,7,42,15,26,6,28,48,9,
        ],
    },
}

for code, paper in PAPERS.items():
    paper_out = OUT / code
    pages = paper_out / "pages"
    crops = paper_out / "crops"
    pages.mkdir(parents=True, exist_ok=True)
    crops.mkdir(exist_ok=True)
    if len(list(pages.glob("page-*.png"))) < 30:
        subprocess.run([PDFTOPPM, "-png", "-r", "180", paper["source"], str(pages / "page")], check=True)

    rows = []
    global_offset = 0
    for subject, first_page, last_page in paper["ranges"]:
        anchors = []
        for page_number in range(first_page, last_page + 1):
            page_path = pages / f"page-{page_number:02}.png"
            result = subprocess.run(["tesseract", str(page_path), "stdout", "--psm", "6", "tsv"], text=True, capture_output=True, check=True)
            image = Image.open(page_path)
            for row in csv.DictReader(result.stdout.splitlines(), delimiter="\t", quoting=csv.QUOTE_NONE):
                # OCR commonly reads Q1 as Qi and Q6 as Qe; left-margin order is
                # more reliable than the recognized digit in these scans.
                if int(row.get("left", 9999)) < 300 and re.match(r"^Q", row.get("text", ""), re.I):
                    anchors.append((page_number, int(row["top"])))
        ordered = sorted(set(anchors))
        if len(ordered) != 30:
            raise RuntimeError(f"{code} {subject}: expected 30 question anchors, found {len(ordered)}: {ordered}")
        for index, (page_number, top) in enumerate(ordered):
            local_number = index + 1
            next_anchor = ordered[index + 1] if index < 29 else None
            end_page = next_anchor[0] if next_anchor else last_page
            pieces = []
            for current_page in range(page_number, end_page + 1):
                image = Image.open(pages / f"page-{current_page:02}.png").convert("RGB")
                start = max(0, top - 18) if current_page == page_number else int(image.height * .06)
                if next_anchor and current_page == next_anchor[0]:
                    end = max(start + 1, next_anchor[1] - 18)
                else:
                    end = int(image.height * .90)
                if end > start:
                    pieces.append(image.crop((0, start, image.width, end)))
            crop = Image.new("RGB", (pieces[0].width, sum(piece.height for piece in pieces)), "white")
            y = 0
            for piece in pieces:
                crop.paste(piece, (0, y)); y += piece.height
            number = global_offset + local_number
            crop_path = crops / f"q{number:02}.png"
            crop.save(crop_path, optimize=True)
            rows.append({"number": number, "subject": subject, "image_path": str(crop_path), "answer": paper["answers"][number - 1]})
        global_offset += 30
    if len(rows) != 90:
        raise RuntimeError(f"{code}: expected 90 questions, found {len(rows)}")
    (paper_out / "manifest.json").write_text(json.dumps(rows, indent=2))
    print(f"{code}: prepared 90 questions")
