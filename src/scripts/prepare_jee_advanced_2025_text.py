"""Create a text-first JEE Advanced 2025 manifest from the supplied final-key PDFs."""
import json, re, subprocess
from pathlib import Path
from pypdf import PdfReader

ROOT = Path.cwd(); OUT = ROOT / "tmp" / "jee-advanced-2025"
OCR = ROOT / "tmp" / "pdfs" / "vision_ocr"
PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
PAPERS = [(Path("/Users/ateebfatmi/Desktop/2025_1_English.pdf"), 1), (Path("/Users/ateebfatmi/Desktop/2025_2_English.pdf"), 2)]

def tidy(text):
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", text)).strip()

def subject(text, current):
    for value in ("Mathematics", "Physics", "Chemistry"):
        if re.search(rf"\b{value}\b", text, re.I): current = "Maths" if value == "Mathematics" else value
    return current

for pdf, paper in PAPERS:
    paper_dir = OUT / f"paper-{paper}"; pages_dir = paper_dir / "pages"; pages_dir.mkdir(parents=True, exist_ok=True)
    if not list(pages_dir.glob("*.png")):
        subprocess.run([PDFTOPPM, "-png", "-r", "180", str(pdf), str(pages_dir / "page")], check=True)
    reader = PdfReader(pdf); current_subject = None; pieces = []
    for index, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""; current_subject = subject(text, current_subject)
        for match in re.finditer(r"Q\.\s*(\d+)\b", text):
            pieces.append({"number": int(match.group(1)), "subject": current_subject, "page": index, "start": match.start(), "text": text})
    records = []
    for i, item in enumerate(pieces):
        end = pieces[i + 1]["start"] if i + 1 < len(pieces) and pieces[i + 1]["page"] == item["page"] else len(item["text"])
        chunk = tidy(item["text"][item["start"]:end])
        options = re.findall(r"\(([A-D])\)\s*(.*?)(?=\s*\([A-D]\)|$)", chunk, re.S)
        records.append({"source_number": item["number"], "subject": item["subject"], "page": item["page"], "question": chunk, "options": dict(options), "question_type": "MCQ" if options else "NUMERICAL"})
    if len(records) != 48: raise ValueError(f"Paper {paper}: expected 48 questions, found {len(records)}")
    (paper_dir / "text-manifest.json").write_text(json.dumps(records, ensure_ascii=False, indent=2))
    print(json.dumps({"paper": paper, "questions": len(records)}))
