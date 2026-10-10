"""Create exact q1..q90 source crops from official NTA PDFs using embedded Q markers."""

import json
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
SOURCES = ROOT / "tmp" / "jee-main-2022" / "sources"
WORK = ROOT / "tmp" / "jee-main-2022"
PDFTOPPM = Path("/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftoppm")
PDFTOTEXT = Path("/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext")
DPI = 180


def global_number(source_number):
    if source_number <= 30:  # official order: Mathematics, Physics, Chemistry
        return source_number + 60
    if source_number <= 60:
        return source_number - 30
    return source_number - 30


def render(pdf, directory):
    pages = sorted(directory.glob("page-*.png"))
    if pages:
        return pages
    directory.mkdir(parents=True, exist_ok=True)
    subprocess.run([str(PDFTOPPM), "-png", "-r", str(DPI), str(pdf), str(directory / "page")], check=True)
    return sorted(directory.glob("page-*.png"))


def marker_positions(pdf):
    with tempfile.NamedTemporaryFile(suffix=".html") as temp:
        subprocess.run([str(PDFTOTEXT), "-bbox", str(pdf), temp.name], check=True)
        root = ET.parse(temp.name).getroot()
    namespace = {"x": "http://www.w3.org/1999/xhtml"}
    pages = root.findall(".//x:page", namespace)
    markers = []
    for page_index, page in enumerate(pages):
        width, height = float(page.attrib["width"]), float(page.attrib["height"])
        words = page.findall("x:word", namespace)
        for word in words:
            match = re.fullmatch(r"Q\s*:\s*(\d{1,2})", "".join(word.itertext()).strip(), re.I)
            if match and 1 <= int(match.group(1)) <= 90:
                markers.append({
                    "number": int(match.group(1)), "page": page_index,
                    "top": float(word.attrib["yMin"]), "page_width": width, "page_height": height,
                })
        # July papers split the marker into three separate words: "Item", "No:", "1".
        # Match them geometrically on the same baseline so header tokens such as Item21
        # cannot be mistaken for question boundaries.
        for item in words:
            if "".join(item.itertext()).strip().lower() != "item":
                continue
            item_y = float(item.attrib["yMin"])
            same_line = [
                candidate for candidate in words
                if abs(float(candidate.attrib["yMin"]) - item_y) <= 2.0
                and float(candidate.attrib["xMin"]) > float(item.attrib["xMax"])
            ]
            no_word = next((candidate for candidate in same_line
                            if "".join(candidate.itertext()).strip().lower() == "no:"), None)
            if no_word is None:
                continue
            number_word = next((candidate for candidate in same_line
                                if float(candidate.attrib["xMin"]) > float(no_word.attrib["xMax"])
                                and re.fullmatch(r"\d{1,2}", "".join(candidate.itertext()).strip())), None)
            if number_word is None:
                continue
            number = int("".join(number_word.itertext()).strip())
            if 1 <= number <= 90:
                markers.append({
                    "number": number, "page": page_index,
                    "top": item_y, "page_width": width, "page_height": height,
                })
    unique = {}
    for marker in markers:
        unique.setdefault(marker["number"], marker)
    return [unique[number] for number in sorted(unique)]


def crop_paper(paper_code, pdf):
    pages = render(pdf, WORK / paper_code / "official-pages")
    markers = marker_positions(pdf)
    if len(markers) != 90:
        raise RuntimeError(f"{paper_code}: expected 90 embedded question markers, found {len(markers)}")
    crop_dir = WORK / paper_code / "source-crops"
    crop_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for index, marker in enumerate(markers):
        next_marker = markers[index + 1] if index + 1 < len(markers) else None
        segments = []
        last_page = next_marker["page"] if next_marker else len(pages) - 1
        for page_index in range(marker["page"], last_page + 1):
            image = Image.open(pages[page_index]).convert("RGB")
            scale_x = image.width / marker["page_width"]
            scale_y = image.height / marker["page_height"]
            top = round(marker["top"] * scale_y) - 5 if page_index == marker["page"] else 0
            if next_marker and page_index == next_marker["page"]:
                bottom = round(next_marker["top"] * scale_y) - 7
            else:
                bottom = image.height
            if bottom > top + 5:
                segments.append(image.crop((0, max(0, top), image.width, min(image.height, bottom))))
        width = max(segment.width for segment in segments)
        height = sum(segment.height for segment in segments)
        combined = Image.new("RGB", (width, height), "white")
        cursor = 0
        for segment in segments:
            combined.paste(segment, (0, cursor))
            cursor += segment.height
        output_number = global_number(marker["number"])
        output = crop_dir / f"q{output_number}.png"
        combined.save(output, optimize=True)
        manifest.append({
            "question_number": output_number,
            "source_number": marker["number"],
            "source_page_start": marker["page"] + 1,
            "source_page_end": last_page + 1,
            "crop": str(output),
        })
    manifest.sort(key=lambda item: item["question_number"])
    (WORK / paper_code / "official-crop-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"{paper_code}: 90 exact source crops")


selection = sys.argv[1] if len(sys.argv) > 1 else None
for directory in sorted(SOURCES.iterdir()):
    if not directory.is_dir() or (selection and directory.name != selection):
        continue
    pdf = directory / "official-reference.pdf"
    if pdf.exists():
        crop_paper(directory.name, pdf)
