"""Create text-first manifests for the supplied JEE Advanced 2023-2025 papers."""
import json, re, subprocess
from pathlib import Path
from pypdf import PdfReader

ROOT = Path.cwd()
OUT = ROOT / "tmp" / "jee-advanced"
PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
PAPERS = [(year, paper, Path(f"/Users/ateebfatmi/Downloads/{year}_{paper}_English.pdf")) for year in (2023, 2024, 2025) for paper in (1, 2)]

def tidy(text):
    return re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]+", " ", text)).strip()

def find_subject(text, current):
    for value in ("Mathematics", "Physics", "Chemistry"):
        if re.search(rf"\b{value}\b", text, re.I):
            current = "Maths" if value == "Mathematics" else value
    return current

for year, paper, pdf in PAPERS:
    paper_dir = OUT / str(year) / f"paper-{paper}"
    pages_dir = paper_dir / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    if not list(pages_dir.glob("*.png")):
        subprocess.run([PDFTOPPM, "-png", "-r", "180", str(pdf), str(pages_dir / "page")], check=True)
    reader = PdfReader(pdf)
    current_subject = None
    pieces = []
    for index, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        current_subject = find_subject(text, current_subject)
        for match in re.finditer(r"Q\.\s*(\d+)\b", text):
            pieces.append({"source_number": int(match.group(1)), "subject": current_subject, "page": index, "start": match.start(), "text": text})
    expected = 48 if year == 2025 else 51
    per_subject = expected // 3
    if not any(item["subject"] for item in pieces):
        for index, item in enumerate(pieces):
            item["subject"] = ("Maths", "Physics", "Chemistry")[index // per_subject]
    records = []
    for index, item in enumerate(pieces):
        end = pieces[index + 1]["start"] if index + 1 < len(pieces) and pieces[index + 1]["page"] == item["page"] else len(item["text"])
        chunk = tidy(item["text"][item["start"]:end])
        options = re.findall(r"\(\s*([A-D])\s*\)\s*(.*?)(?=\s*\(\s*[A-D]\s*\)|$)", chunk, re.S)
        records.append({
            "source_number": item["source_number"],
            "subject": item["subject"],
            "page": item["page"],
            "question": chunk,
            "options": dict(options),
            "question_type": "MCQ" if options else "NUMERICAL",
        })
    if len(records) != expected:
        raise ValueError(f"{year} paper {paper}: expected {expected} questions, found {len(records)}")
    subject_counts = {subject: sum(row["subject"] == subject for row in records) for subject in ("Maths", "Physics", "Chemistry")}
    if sorted(subject_counts.values()) != [per_subject] * 3:
        raise ValueError(f"{year} paper {paper}: invalid subject distribution {subject_counts}")
    (paper_dir / "text-manifest.json").write_text(json.dumps(records, ensure_ascii=False, indent=2))
    print(json.dumps({"year": year, "paper": paper, "questions": len(records), "subjects": subject_counts}))
