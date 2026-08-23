"""Recover MCQ option text from spatial PDF coordinates when column layout defeats extraction."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


ROOT = Path.cwd()
STRUCTURED = ROOT / "tmp" / "jee-main-2026-april" / "structured"
PAPERS = [
    ("paper-01.pdf", "JEE-MAIN-26-02APR-S1"),
    ("paper-02.pdf", "JEE-MAIN-26-02APR-S2"),
    ("paper-03.pdf", "JEE-MAIN-26-04APR-S1"),
    ("paper-04.pdf", "JEE-MAIN-26-04APR-S2"),
    ("paper-05.pdf", "JEE-MAIN-26-05APR-S1"),
    ("paper-06.pdf", "JEE-MAIN-26-06APR-S1"),
    ("paper-07.pdf", "JEE-MAIN-26-06APR-S2"),
    ("paper-08.pdf", "JEE-MAIN-26-08APR-S2"),
]


def line_text(words: list[dict]) -> str:
    lines: list[list[dict]] = []
    for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
        target = next((line for line in lines if abs(line[0]["top"] - word["top"]) <= 4), None)
        if target is None:
            target = []
            lines.append(target)
        target.append(word)
    rendered = []
    for line in sorted(lines, key=lambda items: items[0]["top"]):
        rendered.append(" ".join(item["text"] for item in sorted(line, key=lambda item: item["x0"])))
    if len(rendered) == 2 and all(re.fullmatch(r"[-+]?\w+(?:\.\w+)?", line) for line in rendered):
        return rf"$\frac{{{rendered[0]}}}{{{rendered[1]}}}$"
    value = "\n".join(rendered).strip().replace("−", "-")
    value = re.sub(r"\b([A-Za-zαβγλμθρ])([2-9])\b", lambda match: f"${match.group(1)}^{{{match.group(2)}}}$", value)
    return value


def recover_page(page, wanted: set[int]) -> dict[int, dict]:
    words = page.extract_words()
    anchors = []
    for word in words:
        match = re.fullmatch(r"Q(\d{1,2})\.", word["text"])
        if match:
            anchors.append((int(match.group(1)), word))
    anchors.sort(key=lambda item: item[1]["top"])
    recovered = {}
    for index, (number, anchor) in enumerate(anchors):
        if number not in wanted:
            continue
        end_top = anchors[index + 1][1]["top"] if index + 1 < len(anchors) else page.height
        block = [word for word in words if anchor["top"] <= word["top"] < end_top]
        answer_top = min((word["top"] for word in block if word["text"].startswith("MathonGo")), default=end_top)
        markers = []
        for word in block:
            match = re.fullmatch(r"\(([1-4])\)", word["text"])
            if match and word["top"] < answer_top:
                markers.append((int(match.group(1)), word))
        if sorted(number for number, _ in markers) != [1, 2, 3, 4]:
            continue
        markers.sort(key=lambda item: item[0])
        row_tops = []
        for _, marker in sorted(markers, key=lambda item: item[1]["top"]):
            if not row_tops or abs(row_tops[-1] - marker["top"]) > 10:
                row_tops.append(marker["top"])
        first_row_top = min(row_tops)
        question_words = [
            word for word in block
            if anchor["bottom"] < word["top"] < first_row_top - 16
            and not word["text"].startswith("MathonGo")
        ]
        values = []
        for option_number, marker in markers:
            row_top = min(row_tops, key=lambda top: abs(top - marker["top"]))
            next_rows = [top for top in row_tops if top > row_top + 10]
            bottom = (min(next_rows) - 10) if next_rows else answer_top
            peers = [peer for _, peer in markers if abs(peer["top"] - row_top) <= 10 and peer["x0"] > marker["x0"]]
            right = min((peer["x0"] for peer in peers), default=page.width - 25)
            left = marker["x1"] + 1
            candidates = [
                word
                for word in block
                if row_top - 16 <= word["top"] < bottom
                and left <= (word["x0"] + word["x1"]) / 2 < right
                and not re.fullmatch(r"\([1-4]\)", word["text"])
            ]
            values.append(line_text(candidates))
        recovered[number] = {"question": line_text(question_words), "options": values}
    return recovered


def main() -> None:
    report = []
    source_root = ROOT / "tmp" / "jee-main-2026-april" / "source"
    selected = PAPERS
    if len(sys.argv) > 1:
        requested = set(sys.argv[1:])
        selected = [paper for paper in PAPERS if paper[0] in requested or paper[1] in requested]
        if not selected:
            raise SystemExit(f"No matching paper for: {', '.join(sys.argv[1:])}")
    for filename, paper_code in selected:
        path = STRUCTURED / f"{paper_code}.json"
        manifest = json.loads(path.read_text())
        rows = {int(question["number"]): question for question in manifest["questions"]}
        wanted = {
            number
            for number, question in rows.items()
            if question["question_type"] == "MCQ"
            and (
                any(not str(question.get(f"option_{letter}", "")).strip() and not question.get(f"option_{letter}_image") for letter in "abcd")
                or any("\n" in str(question.get(f"option_{letter}", "")) for letter in "abcd")
            )
        }
        repaired = []
        with pdfplumber.open(source_root / filename) as document:
            spatial = {}
            for page in document.pages:
                spatial.update(recover_page(page, wanted))
        for number in sorted(wanted):
            recovered = spatial.get(number)
            if not recovered:
                continue
            row = rows[number]
            if recovered["question"]:
                row["question"] = recovered["question"]
            for index, letter in enumerate("abcd"):
                if recovered["options"][index]:
                    row[f"option_{letter}"] = recovered["options"][index]
            repaired.append(number)
        path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        report.append({"paper_code": paper_code, "wanted": sorted(wanted), "repaired": repaired})
    (STRUCTURED / "spatial-option-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
