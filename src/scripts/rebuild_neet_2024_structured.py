from __future__ import annotations

import json
import re
import sys
from pathlib import Path


QUESTION_LINE = re.compile(r"(?m)^\s*(\d{1,3})\.\s{2,}(\S.*)$")
ANSWER_LINE = re.compile(r"(?m)^\s*Answer\s*\(([1-4])\)\s*$")
OPTION_MARKER = re.compile(r"\(([1-4])\)\s+")
BAD_GLYPH = re.compile(r"[\uE000-\uF8FF]|[�□]")


def compact(value: str) -> str:
    value = value.replace("\u00a0", " ").replace("–", "-").replace("−", "-")
    return re.sub(r"\s+", " ", value).strip()


def subject_for(number: int) -> str:
    if number <= 50:
        return "Physics"
    if number <= 100:
        return "Chemistry"
    return "Biology"


def section_for(number: int) -> str:
    local = (number - 1) % 50 + 1
    return "Section A" if local <= 35 else "Section B"


def split_options(question_block: str, number: int) -> tuple[str, list[str]]:
    markers = list(OPTION_MARKER.finditer(question_block))
    sequence = [int(marker.group(1)) for marker in markers]
    start = next(
        (index for index in range(len(sequence) - 3) if sequence[index : index + 4] == [1, 2, 3, 4]),
        None,
    )
    if start is None:
        raise ValueError(f"Q{number}: could not locate ordered options; markers={sequence[:16]}")
    selected = markers[start : start + 4]
    stem = question_block[: selected[0].start()]
    options: list[str] = []
    for index, marker in enumerate(selected):
        end = selected[index + 1].start() if index < 3 else len(question_block)
        options.append(compact(question_block[marker.end() : end]))
    return stem, options


def preserve_lines(value: str) -> str:
    lines = [re.sub(r"\s+$", "", line) for line in value.splitlines()]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    # Preserve meaningful layout for lists/matching content, but collapse wrapped prose.
    if any(token in value for token in ("List-I", "List I", "List-II", "List II", "Column I", "Column II")):
        return "\n".join(line.strip() for line in lines if line.strip())
    return compact(" ".join(lines))


def parse(source: str) -> list[dict]:
    source = source[source.index("PHYSICS") :]
    matches = list(QUESTION_LINE.finditer(source))
    numbered = [int(match.group(1)) for match in matches]
    if numbered != list(range(1, 201)):
        raise ValueError(f"Expected the exact sequence 1..200, got {numbered[:8]} ... {numbered[-8:]}")

    rows: list[dict] = []
    for index, match in enumerate(matches):
        number = int(match.group(1))
        end = matches[index + 1].start() if index < 199 else len(source)
        block = source[match.start() : end]
        answer = ANSWER_LINE.search(block)
        if not answer:
            raise ValueError(f"Q{number}: answer line missing")
        question_part = block[: answer.start()]
        stem, options = split_options(question_part, number)
        stem = re.sub(r"^\s*\d+\.\s+", "", stem, count=1)
        question = preserve_lines(stem)
        bad_fields = []
        for field, value in [("question", question), *[(f"option_{letter}", option) for letter, option in zip("abcd", options)]]:
            if BAD_GLYPH.search(value):
                bad_fields.append(field)
        rows.append(
            {
                "number": number,
                "exam": "NEET",
                "exam_type": "NEET UG",
                "year": 2024,
                "attempt": "NEET UG 2024",
                "shift": "Single Shift",
                "paper_code": "NEET 2024",
                "subject": subject_for(number),
                "section": section_for(number),
                "question_type": "MCQ",
                "question": question,
                "option_a": options[0],
                "option_b": options[1],
                "option_c": options[2],
                "option_d": options[3],
                "correct_option": "abcd"[int(answer.group(1)) - 1],
                "marks_positive": 4,
                "marks_negative": -1,
                "needs_review": bool(bad_fields) or any(not value for value in [question, *options]),
                "review_reasons": [f"unresolved glyphs in {field}" for field in bad_fields],
            }
        )
    return rows


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: rebuild_neet_2024_structured.py INPUT_LAYOUT_TEXT OUTPUT_JSON")
    source = Path(sys.argv[1]).read_text(encoding="utf-8")
    rows = parse(source)
    output = Path(sys.argv[2])
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    review = [row for row in rows if row["needs_review"]]
    print(json.dumps({"total": len(rows), "review": len(review), "review_numbers": [row["number"] for row in review]}))


if __name__ == "__main__":
    main()
