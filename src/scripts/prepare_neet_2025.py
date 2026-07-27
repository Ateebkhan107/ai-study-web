"""Create a validated NEET 2025 import manifest and source-faithful question images.

Usage:
  python3 src/scripts/prepare_neet_2025.py /absolute/path/to/paper.pdf output-dir

The generated images contain the question and all choices exactly as they appear in
the source PDF.  The answer and solution are deliberately excluded from the image.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber
from PIL import Image
from pypdf import PdfReader


QUESTION_RE = re.compile(r"(?m)^\s*Question\s+(\d+)\s*:")
ANSWER_RE = re.compile(r"(?mi)^\s*Answer\s*:\s*\(([a-d])\)")
OPTION_RE = re.compile(r"(?m)^\s*\(([a-d1-4])\)\s*")


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def subject_for(number: int) -> str:
    if number <= 45:
        return "Physics"
    if number <= 90:
        return "Chemistry"
    return "Biology"


def chapter_for(subject: str) -> str:
    # A deliberately broad, reliable chapter label is preferable to guessing a
    # specific chapter from a formula or keyword during an automated import.
    return f"NEET 2025 {subject}"


def parse_questions(pdf_path: Path) -> list[dict]:
    text = "\n".join((page.extract_text() or "") for page in PdfReader(pdf_path).pages)
    starts = list(QUESTION_RE.finditer(text))
    numbers = [int(match.group(1)) for match in starts]
    if numbers != list(range(1, 181)):
        raise ValueError(f"Expected question numbers 1-180, found {numbers[:5]} ... {numbers[-5:]}")

    questions: list[dict] = []
    for index, match in enumerate(starts):
        number = int(match.group(1))
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[match.end() : end]
        answer = ANSWER_RE.search(block)
        if not answer:
            raise ValueError(f"Question {number} has no answer key")

        before_answer = block[: answer.start()]
        solution_start = re.search(r"(?mi)^\s*Solution\s*:\s*", block[answer.end() :])
        solution = ""
        if solution_start:
            solution = block[answer.end() + solution_start.end() :]

        options_label = re.search(r"(?i)\bOptions\s*:\s*", before_answer)
        if not options_label:
            raise ValueError(f"Question {number} has no options label")
        question_text = compact(before_answer[: options_label.start()])
        option_text = before_answer[options_label.end() :]
        option_matches = list(OPTION_RE.finditer(option_text))
        def normalise_label(label: str) -> str:
            return chr(ord("a") + int(label) - 1) if label.isdigit() else label.lower()

        labels = [normalise_label(item.group(1)) for item in option_matches]
        if labels != ["a", "b", "c", "d"]:
            raise ValueError(f"Question {number} options are malformed: {labels}")
        options = {}
        for option_index, option_match in enumerate(option_matches):
            option_end = option_matches[option_index + 1].start() if option_index + 1 < len(option_matches) else len(option_text)
            label = normalise_label(option_match.group(1))
            options[label] = compact(option_text[option_match.end() : option_end])

        # Some chemistry and physics structures are drawing-only in the PDF's
        # text layer. Their source-faithful image is attached below, while these
        # accessible fallbacks keep the database record valid.
        if not question_text:
            question_text = "Refer to the source visual below."
        for label in "abcd":
            if not options[label]:
                options[label] = "Refer to the source visual."

        subject = subject_for(number)
        questions.append(
            {
                "number": number,
                "exam": "NEET",
                "exam_type": "NEET UG",
                "year": 2025,
                "attempt": "NEET UG 2025",
                "shift": "Single Shift",
                "paper_code": "Narmada 48",
                "subject": subject,
                "chapter": chapter_for(subject),
                "question_type": "MCQ",
                # The original paper number remains in the stored question text.
                "question": f"Question {number}: {question_text}",
                "option_a": options["a"],
                "option_b": options["b"],
                "option_c": options["c"],
                "option_d": options["d"],
                "correct_option": answer.group(1).lower(),
                "explanation": compact(solution),
                "marks_positive": 4,
                "marks_negative": -1,
            }
        )
    return questions


def page_locations(pdf_path: Path) -> tuple[dict[int, tuple[int, float]], dict[int, tuple[int, float]]]:
    question_positions: dict[int, tuple[int, float]] = {}
    answer_positions: list[tuple[int, float]] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_index, page in enumerate(pdf.pages):
            words = page.extract_words(use_text_flow=True, keep_blank_chars=False)
            for index, word in enumerate(words):
                if word["text"].lower() == "question" and index + 1 < len(words):
                    digits = re.sub(r"\D", "", words[index + 1]["text"])
                    if digits and 1 <= int(digits) <= 180:
                        number = int(digits)
                        if number in question_positions:
                            raise ValueError(f"Question {number} appears more than once in page layout")
                        question_positions[number] = (page_index, word["top"])
                if word["text"] == "Answer:":
                    answer_positions.append((page_index, word["top"]))
    if set(question_positions) != set(range(1, 181)):
        raise ValueError("Could not find every numbered question in the PDF layout")
    if len(answer_positions) != 180:
        raise ValueError(f"Expected 180 answer locations, found {len(answer_positions)}")
    return question_positions, {index + 1: value for index, value in enumerate(answer_positions)}


def render_question_images(pdf_path: Path, output_dir: Path) -> dict[int, str]:
    image_dir = output_dir / "question-images"
    image_dir.mkdir(parents=True, exist_ok=True)
    starts, answers = page_locations(pdf_path)
    output_paths: dict[int, str] = {}

    with pdfplumber.open(pdf_path) as pdf:
        for number in range(1, 181):
            start_page, start_y = starts[number]
            answer_page, answer_y = answers[number]
            if (answer_page, answer_y) < (start_page, start_y):
                raise ValueError(f"Question {number} answer appears before its question")

            parts: list[Image.Image] = []
            for page_index in range(start_page, answer_page + 1):
                page = pdf.pages[page_index]
                rendered = page.to_image(resolution=160).original
                scale = rendered.width / page.width
                top = start_y * scale - 10 if page_index == start_page else 18
                bottom = answer_y * scale - 10 if page_index == answer_page else rendered.height - 18
                if bottom <= top:
                    raise ValueError(f"Question {number} produced an invalid image crop")
                parts.append(rendered.crop((18, max(0, top), rendered.width - 18, min(rendered.height, bottom))))

            width = max(part.width for part in parts)
            height = sum(part.height for part in parts) + 12 * (len(parts) - 1)
            combined = Image.new("RGB", (width, height), "white")
            offset = 0
            for part in parts:
                combined.paste(part, (0, offset))
                offset += part.height + 12
            path = image_dir / f"neet-ug-2025-question-{number:03d}.png"
            combined.save(path, "PNG", optimize=True)
            output_paths[number] = str(path)
    return output_paths


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: prepare_neet_2025.py INPUT_PDF OUTPUT_DIRECTORY")
    pdf_path = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    if not pdf_path.is_file():
        raise SystemExit(f"PDF not found: {pdf_path}")

    questions = parse_questions(pdf_path)
    images = render_question_images(pdf_path, output_dir)
    for question in questions:
        question["image_path"] = images[question["number"]]
    manifest_path = output_dir / "neet-ug-2025-manifest.json"
    manifest_path.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Validated {len(questions)} questions and wrote {manifest_path}")


if __name__ == "__main__":
    main()
