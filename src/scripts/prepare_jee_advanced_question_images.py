#!/usr/bin/env python3
"""Crop each JEE Advanced question from the original paper as a single image."""

from __future__ import annotations

import json
from pathlib import Path

import pdfplumber
from PIL import Image
import numpy as np


ROOT = Path(__file__).resolve().parents[2]
DOWNLOADS = Path("/Users/ateebfatmi/Downloads")
YEARS = (2023, 2024, 2025)
PAPERS = (1, 2)
SIDE_MARGIN_PT = 24
PAGE_TOP_PT = 24
PAGE_BOTTOM_PT = 30
QUESTION_PAD_PT = 7
SECTION_BOTTOM_PT = PAGE_BOTTOM_PT
SECTION_STARTS = {
    (2023, 1): {4, 8, 14},
    (2023, 2): {5, 8, 14},
    (2024, 1): {5, 8, 14},
    (2024, 2): {5, 8, 14},
    (2025, 1): {5, 8, 14},
    (2025, 2): {5, 9},
}


def rendered_page_path(base: Path, page_number: int) -> Path:
    return base / "pages" / f"page-{page_number:02d}.png"


def first_marker(pdf, start, end, pattern: str):
    """Return the first text marker between two anchors, if present."""
    for page_index in range(start["page_index"], end["page_index"] + 1):
        hits = pdf.pages[page_index].search(pattern, regex=True)
        for hit in hits:
            top = float(hit["top"])
            if page_index == start["page_index"] and top <= start["top"]:
                continue
            if page_index == end["page_index"] and top >= end["top"]:
                continue
            return {"page_index": page_index, "top": top}
    return None


def last_marker(pdf, start, end, pattern: str, centered: bool = False):
    """Return the last text marker between two anchors, if present."""
    found = None
    for page_index in range(start["page_index"], end["page_index"] + 1):
        hits = pdf.pages[page_index].search(pattern, regex=True)
        for hit in hits:
            top = float(hit["top"])
            if centered:
                marker_center = (float(hit["x0"]) + float(hit["x1"])) / 2
                if abs(marker_center - float(pdf.pages[page_index].width) / 2) > 20:
                    continue
            if page_index == start["page_index"] and top <= start["top"]:
                continue
            if page_index == end["page_index"] and top >= end["top"]:
                continue
            found = {"page_index": page_index, "top": top, "paragraph": True}
    return found


def first_colored_answer(base: Path, pdf, start, end):
    """2025 answer boxes are vector annotations absent from extracted PDF text."""
    for page_index in range(start["page_index"], end["page_index"] + 1):
        pdf_page = pdf.pages[page_index]
        image = Image.open(rendered_page_path(base, page_index + 1)).convert("RGB")
        pixels = np.asarray(image)
        scale_y = image.height / float(pdf_page.height)
        first_row = round((start["top"] + 5 if page_index == start["page_index"] else PAGE_TOP_PT) * scale_y)
        last_row = round((end["top"] if page_index == end["page_index"] else float(pdf_page.height) - PAGE_BOTTOM_PT) * scale_y)
        area = pixels[first_row:last_row]
        red = (area[:, :, 0] > 105) & (area[:, :, 0] > area[:, :, 1] * 1.35) & (area[:, :, 0] > area[:, :, 2] * 1.25)
        blue = (area[:, :, 2] > 95) & (area[:, :, 2] > area[:, :, 0] * 1.25) & (area[:, :, 2] > area[:, :, 1] * 1.15)
        rows = np.flatnonzero((red | blue).sum(axis=1) >= 8)
        if rows.size:
            return {"page_index": page_index, "top": (first_row + int(rows[0])) / scale_y}
    return None


def crop_question(pdf, base: Path, start, end, destination: Path) -> None:
    pieces = []
    for page_index in range(start["page_index"], end["page_index"] + 1):
        pdf_page = pdf.pages[page_index]
        image = Image.open(rendered_page_path(base, page_index + 1)).convert("RGB")
        scale_x = image.width / float(pdf_page.width)
        scale_y = image.height / float(pdf_page.height)

        left = round(SIDE_MARGIN_PT * scale_x)
        right = round((float(pdf_page.width) - SIDE_MARGIN_PT) * scale_x)
        if page_index == start["page_index"]:
            top_pt = max(PAGE_TOP_PT, start["top"] - QUESTION_PAD_PT)
        else:
            top_pt = PAGE_TOP_PT
        if page_index == end["page_index"]:
            bottom_pt = min(float(pdf_page.height) - PAGE_BOTTOM_PT, end["top"] - QUESTION_PAD_PT)
        else:
            bottom_pt = float(pdf_page.height) - PAGE_BOTTOM_PT

        top = round(top_pt * scale_y)
        bottom = round(bottom_pt * scale_y)
        if bottom > top + 10:
            pieces.append(image.crop((left, top, right, bottom)))

    if not pieces:
        raise RuntimeError(f"Empty crop for {destination}")

    width = max(piece.width for piece in pieces)
    height = sum(piece.height for piece in pieces)
    combined = Image.new("RGB", (width, height), "white")
    y = 0
    for piece in pieces:
        combined.paste(piece, (0, y))
        y += piece.height
    destination.parent.mkdir(parents=True, exist_ok=True)
    combined.save(destination, "JPEG", quality=92, optimize=True, progressive=True)


def main() -> None:
    for year in YEARS:
        for paper in PAPERS:
            base = ROOT / "tmp" / "jee-advanced" / str(year) / f"paper-{paper}"
            questions = json.loads((base / "text-manifest.json").read_text())
            pdf_path = DOWNLOADS / f"{year}_{paper}_English.pdf"
            image_manifest = []

            with pdfplumber.open(pdf_path) as pdf:
                anchors = []
                for question in questions:
                    page_index = int(question["page"]) - 1
                    number = int(question["source_number"])
                    hits = pdf.pages[page_index].search(rf"Q\.\s*{number}\b", regex=True)
                    if len(hits) != 1:
                        raise RuntimeError(
                            f"Expected one Q.{number} on {year} P{paper} page {page_index + 1}; got {len(hits)}"
                        )
                    anchors.append({"page_index": page_index, "top": float(hits[0]["top"])})

                document_end = {
                    "page_index": len(pdf.pages) - 1,
                    "top": float(pdf.pages[-1].height) - PAGE_BOTTOM_PT + QUESTION_PAD_PT,
                }
                starts = []
                document_start = {"page_index": 0, "top": 0.0}
                for index, anchor in enumerate(anchors):
                    previous_anchor = anchors[index - 1] if index > 0 else document_start
                    paragraph = first_marker(
                        pdf,
                        previous_anchor,
                        anchor,
                        r'PARAGRAPH\s+[“"]?[IVX]+',
                    )
                    if paragraph:
                        paragraph["paragraph"] = True
                    starts.append(paragraph or anchor)

                for index, question in enumerate(questions):
                    destination = base / "crops" / f"q{index + 1:02d}.jpg"
                    start = starts[index]
                    end = starts[index + 1] if index + 1 < len(starts) else document_end
                    if index + 1 < len(starts):
                        next_question = questions[index + 1]
                        begins_new_section = (
                            next_question["subject"] != question["subject"]
                            or int(next_question["source_number"]) in SECTION_STARTS[(year, paper)]
                            or bool(end.get("paragraph"))
                        )
                        if begins_new_section and end["page_index"] > start["page_index"]:
                            current_page = pdf.pages[start["page_index"]]
                            end = {
                                "page_index": start["page_index"],
                                "top": float(current_page.height) - SECTION_BOTTOM_PT + QUESTION_PAD_PT,
                            }
                    paper_end = first_marker(pdf, start, end, r"END OF THE QUESTION PAPER")
                    if paper_end:
                        end = paper_end
                    if year == 2025:
                        answer = first_colored_answer(base, pdf, start, end)
                        if answer:
                            end = answer
                    crop_question(
                        pdf,
                        base,
                        start,
                        end,
                        destination,
                    )
                    image_manifest.append(
                        {
                            "question_number": index + 1,
                            "source_number": question["source_number"],
                            "subject": question["subject"],
                            "question_type": question["question_type"],
                            "image": str(destination.relative_to(ROOT)),
                        }
                    )

            (base / "image-manifest.json").write_text(json.dumps(image_manifest, indent=2) + "\n")
            print(f"Prepared {len(image_manifest)} crops for JEE Advanced {year} Paper {paper}")


if __name__ == "__main__":
    main()
