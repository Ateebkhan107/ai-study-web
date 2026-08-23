"""Extract the supplied MathonGo JEE Main Apr-2026 papers into a text-first draft.

The draft deliberately keeps source page/question coordinates so that a later pass can
attach crops only when a real diagram, graph, structure, or spatial table is required.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


ROOT = Path.cwd()
SOURCE = ROOT / "tmp" / "jee-main-2026-april" / "source"
OUTPUT = ROOT / "tmp" / "jee-main-2026-april" / "draft"
PAPERS = [
    ("paper-01.pdf", 2, 1),
    ("paper-02.pdf", 2, 2),
    ("paper-03.pdf", 4, 1),
    ("paper-04.pdf", 4, 2),
    ("paper-05.pdf", 5, 1),
    ("paper-06.pdf", 6, 1),
    ("paper-07.pdf", 6, 2),
    ("paper-08.pdf", 8, 2),
]

HEADER_RE = re.compile(
    r"^\s*\d*\s*\d{1,2}\s+April\s+\((?:Morning|Evening) Shift\)\s+JEE Main 2026\s*$",
    re.I,
)


def subject(number: int) -> str:
    return "Maths" if number <= 25 else "Physics" if number <= 50 else "Chemistry"


def clean_lines(value: str) -> str:
    lines = []
    for line in value.replace("\u00a0", " ").splitlines():
        stripped = line.strip()
        if not stripped:
            lines.append("")
            continue
        if HEADER_RE.match(stripped):
            continue
        if stripped in {"Answer Keys MathonGo", "#PaperPhodnaHai", "www.mathongo.com"}:
            continue
        lines.append(re.sub(r"[ \t]+", " ", stripped))
    text = "\n".join(lines)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def extract_blocks(document: pdfplumber.PDF) -> list[dict]:
    text = "\n".join(page.extract_text() or "" for page in document.pages)
    text = clean_lines(text)
    pattern = re.compile(
        r"(?ms)^Q(\d{1,2})\.\s*\n?(.*?)^MathonGo Answer Key\s*:\s*(?:\(([^)]+)\)|([^\n]+))\s*$"
    )
    rows = []
    for match in pattern.finditer(text):
        number = int(match.group(1))
        if not 1 <= number <= 75:
            continue
        rows.append(
            {
                "number": number,
                "subject": subject(number),
                "source_text": clean_lines(match.group(2)),
                "answer": (match.group(3) or match.group(4)).strip(),
            }
        )
    return rows


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    summary = []
    selected = PAPERS
    if len(sys.argv) > 1:
        requested = set(sys.argv[1:])
        selected = [paper for paper in PAPERS if paper[0] in requested or f"{paper[1]:02d}-S{paper[2]}" in requested]
        if not selected:
            raise SystemExit(f"No matching paper for: {', '.join(sys.argv[1:])}")
    for filename, day, shift in selected:
        source_path = SOURCE / filename
        paper_code = f"JEE-MAIN-26-{day:02d}APR-S{shift}"
        with pdfplumber.open(source_path) as document:
            rows = extract_blocks(document)
        numbers = [row["number"] for row in rows]
        missing = sorted(set(range(1, 76)) - set(numbers))
        duplicates = sorted({number for number in numbers if numbers.count(number) > 1})
        payload = {
            "paper_code": paper_code,
            "exam_date": f"2026-04-{day:02d}",
            "attempt": f"{day} Apr",
            "shift": f"Shift {shift}",
            "source_pdf": str(source_path),
            "questions": rows,
        }
        (OUTPUT / f"{paper_code}.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False))
        summary.append(
            {
                "paper_code": paper_code,
                "count": len(rows),
                "missing": missing,
                "duplicates": duplicates,
            }
        )
    (OUTPUT / "summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
