from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


QUESTION = re.compile(r"(?m)^[ \t]*(\d{1,3})(?:(\.)[ \t]*|([ \t]+))")
OPTION = re.compile(r"\(([1-4])\)\s*")
ANSWER = re.compile(r"(\d{1,3})\.\s*\(([^)]+)\)")


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def subject(number: int) -> str:
    if number <= 45:
        return "Physics"
    if number <= 90:
        return "Chemistry"
    return "Biology"


def main() -> None:
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    output.parent.mkdir(parents=True, exist_ok=True)

    with pdfplumber.open(source) as pdf:
        streams: list[str] = []
        for page in pdf.pages[1:20]:
            middle = page.width / 2
            left = page.crop((0, 0, middle, page.height)).extract_text(x_tolerance=2, y_tolerance=3) or ""
            right = page.crop((middle, 0, page.width, page.height)).extract_text(x_tolerance=2, y_tolerance=3) or ""
            streams.extend((left, right))
        text = "\n".join(streams)
        answer_text = pdf.pages[20].extract_text() or ""

    answers: dict[int, str] = {}
    alternate_answers: dict[int, list[str]] = {}
    for number, raw in ANSWER.findall(answer_text):
        values = re.findall(r"[1-4]", raw)
        if values:
            n = int(number)
            answers[n] = "abcd"[int(values[0]) - 1]
            alternate_answers[n] = ["abcd"[int(value) - 1] for value in values]
    if sorted(answers) != list(range(1, 181)):
        missing = sorted(set(range(1, 181)) - set(answers))
        raise ValueError(f"Answer key is incomplete: {missing}")
    # The NTA final P1 key supersedes the provisional key printed in this PDF.
    # Code F denotes options 3 and 4; code A denotes options 1 and 2.
    answers[6], alternate_answers[6] = "c", ["c", "d"]
    answers[72], alternate_answers[72] = "a", ["a", "b"]

    undotted = {105, 106, 107, 173, 174, 175}
    matches = [
        match for match in QUESTION.finditer(text)
        if 1 <= int(match.group(1)) <= 180
        and (match.group(2) or int(match.group(1)) in undotted)
    ]
    by_number: dict[int, re.Match[str]] = {}
    for match in matches:
        number = int(match.group(1))
        by_number.setdefault(number, match)
    if sorted(by_number) != list(range(1, 181)):
        missing = sorted(set(range(1, 181)) - set(by_number))
        raise ValueError(f"Questions are incomplete: {missing}")

    ordered = [by_number[number] for number in range(1, 181)]
    rows = []
    for index, start in enumerate(ordered):
        number = index + 1
        end = ordered[index + 1].start() if index + 1 < len(ordered) else len(text)
        block = text[start.end():end]
        markers = list(OPTION.finditer(block))
        marker_numbers = [int(marker.group(1)) for marker in markers]
        selected = None
        for offset in range(max(0, len(markers) - 8), len(markers) - 3):
            if marker_numbers[offset:offset + 4] == [1, 2, 3, 4]:
                selected = markers[offset:offset + 4]
                break
        if not selected:
            raise ValueError(f"Q{number}: could not isolate four options; found {marker_numbers}")
        question = compact(block[:selected[0].start()])
        options: list[str] = []
        for option_index, marker in enumerate(selected):
            option_end = selected[option_index + 1].start() if option_index < 3 else len(block)
            options.append(compact(block[marker.end():option_end]) or "Diagram shown.")
        section = subject(number)
        rows.append({
            "number": number,
            "exam": "NEET",
            "exam_type": "NEET UG",
            "year": 2019,
            "attempt": "NEET UG 2019",
            "shift": "Single Shift",
            "paper_code": "NEET 2019 Code P1",
            "subject": section,
            "chapter": f"NEET 2019 {section}",
            "question_type": "MCQ",
            "question": question,
            "option_a": options[0],
            "option_b": options[1],
            "option_c": options[2],
            "option_d": options[3],
            "correct_option": answers[number],
            "accepted_options": alternate_answers[number],
            "marks_positive": 4,
            "marks_negative": -1,
        })

    output.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    print(json.dumps({
        "count": len(rows),
        "subjects": {name: sum(row["subject"] == name for row in rows) for name in ("Physics", "Chemistry", "Biology")},
        "multiple_answers": {str(n): values for n, values in alternate_answers.items() if len(values) > 1},
    }, indent=2))


if __name__ == "__main__":
    main()
