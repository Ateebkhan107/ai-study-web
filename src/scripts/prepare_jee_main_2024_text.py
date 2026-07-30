"""Build text-first JEE Main January 2024 manifests from the supplied MathonGo PDFs.

No source-page artwork is copied: questions, options, tables and equations are stored as text.
"""
import json
import re
from pathlib import Path
from pypdf import PdfReader

ROOT = Path.cwd()
DOWNLOADS = Path("/Users/ateebfatmi/Downloads")
OUT = ROOT / "tmp" / "jee-main-2024-january"

PAPERS = [
    ("27 Jan", 1), ("27 Jan", 2), ("29 Jan", 1), ("29 Jan", 2), ("30 Jan", 1),
    ("30 Jan", 2), ("31 Jan", 1), ("31 Jan", 2), ("01 Feb", 1), ("01 Feb", 2),
]

def clean(text):
    text = text.replace("\r", "")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def paper_path(day, shift):
    return DOWNLOADS / f"JEE Main 2024 ({day} Shift {shift}) Previous Year Paper with Answer Keys - MathonGo.pdf"

def subject(number):
    return "Physics" if number <= 30 else "Chemistry" if number <= 60 else "Maths"

def question_type(number):
    return "MCQ" if (number - 1) % 30 < 20 else "NUMERICAL"

def options_for(chunk):
    flat = re.sub(r"\s+", " ", chunk)
    matches = list(re.finditer(r"\((1|2|3|4)\)\s*(.*?)(?=\s*\([1-4]\)\s*|$)", flat))
    if len(matches) != 4:
        return {}
    return {m.group(1): clean(m.group(2)) for m in matches}

def prompt_for(chunk, number):
    chunk = re.sub(rf"^Q\.?\s*{number}\.?\s*", "", chunk, flags=re.I)
    return clean(re.sub(r"\n\s*\(1\)[\s\S]*$", "", chunk))

def answers_from(text):
    key_start = text.rfind("ANSWER KEYS")
    if key_start < 0:
        raise ValueError("Answer-key heading not found")
    result = {int(number): value.strip() for number, value in re.findall(r"\b(\d+)\.\s*\(([^)]+)\)", text[key_start:])}
    if sorted(result) != list(range(1, 91)):
        raise ValueError(f"Expected answer keys 1-90, found {len(result)}")
    return result

OUT.mkdir(parents=True, exist_ok=True)
for day, shift in PAPERS:
    source = paper_path(day, shift)
    reader = PdfReader(source)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    question_text = text[:text.rfind("ANSWER KEYS")]
    marks = list(re.finditer(r"(?m)^Q\.?\s*(\d+)\.\s*", question_text))
    if len(marks) != 90:
        raise ValueError(f"{source.name}: expected 90 question starts, found {len(marks)}")
    answers = answers_from(text)
    rows = []
    for index, match in enumerate(marks):
        number = int(match.group(1))
        end = marks[index + 1].start() if index + 1 < len(marks) else len(question_text)
        chunk = clean(question_text[match.start():end])
        kind = question_type(number)
        options = options_for(chunk) if kind == "MCQ" else {}
        # This one question continues across a page boundary whose two-column
        # text objects are emitted out of order by the PDF. It is transcribed
        # from the supplied page and uses the supplied key (option 3).
        if day == "30 Jan" and shift == 1 and number == 78:
            chunk = ("Q78. Let a⃗ = a₁î + a₂ĵ + a₃k̂ and b⃗ = b₁î + b₂ĵ + b₃k̂ be two vectors such that "
                     "|a⃗| = 1, a⃗ · b⃗ = 2 and |b⃗| = 4. If c⃗ = 2(a⃗ × b⃗) − 3b⃗, then the angle between b⃗ and c⃗ is equal to:")
            options = {"1": "cos⁻¹(2/√3)", "2": "cos⁻¹(−1/√3)", "3": "cos⁻¹(−√3/2)", "4": "cos⁻¹(2/3)"}
        if kind == "MCQ" and len(options) != 4:
            raise ValueError(f"{source.name}: Q{number} does not have four extractable options")
        rows.append({
            "number": number,
            "subject": subject(number),
            "question_type": kind,
            "question": prompt_for(chunk, number),
            "options": options,
            "answer": answers[number],
        })
    code_day = day.replace(" ", "").upper()
    destination = OUT / f"jee-main-24-{code_day}-s{shift}.json"
    destination.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    print(json.dumps({"paper": destination.stem, "questions": len(rows)}))
