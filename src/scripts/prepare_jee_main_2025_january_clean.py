"""Create one clean, metadata-free source image per JEE Main 2025 January question."""
import json
import re
import subprocess
from pathlib import Path

import pdfplumber
from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "tmp" / "jee-main-2025-january-clean"
PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
ANSWER_KEY = Path("/Users/ateebfatmi/Desktop/JEE Main 2025 January Session Answer Keys.pdf")
PAPERS = [(22, 1), (22, 2), (23, 1), (23, 2), (24, 1), (24, 2), (28, 1), (28, 2), (29, 1), (29, 2)]


def subject(number):
    return "Maths" if number <= 25 else "Physics" if number <= 50 else "Chemistry"


with pdfplumber.open(ANSWER_KEY) as answer_doc:
    answer_text = "\n".join(page.extract_text() or "" for page in answer_doc.pages)

for day, shift in PAPERS:
    source = Path(f"/Users/ateebfatmi/Desktop/JEE Main 2025 Jan {day} S{shift}.pdf")
    code = f"JEE-MAIN-25-{day:02}JAN-S{shift}"
    paper_dir = OUT / code
    pages_dir = paper_dir / "pages"
    crops_dir = paper_dir / "crops"
    pages_dir.mkdir(parents=True, exist_ok=True)
    crops_dir.mkdir(exist_ok=True)
    if not list(pages_dir.glob("*.png")):
        subprocess.run([PDFTOPPM, "-png", "-r", "180", str(source), str(pages_dir / "page")], check=True)

    with pdfplumber.open(source) as document:
        page_texts = [page.extract_text() or "" for page in document.pages]
        page_words = [page.extract_words() for page in document.pages]
        anchors = []
        for page_index, words in enumerate(page_words, 1):
            for word in words:
                match = re.fullmatch(r"Q\.?([1-9]|[1-6][0-9]|7[0-5])\.?", word["text"])
                if match:
                    anchors.append((int(match.group(1)), page_index, word["top"]))
        anchors.sort()
        numbers = [number for number, _, _ in anchors]
        if numbers != list(range(1, 76)):
            raise RuntimeError(f"{code}: expected anchors 1-75, got {numbers}")

        images = {
            int(image.stem.split("-")[-1]): Image.open(image).convert("RGB")
            for image in pages_dir.glob("*.png")
        }
        manifest = []
        full_text = "\n".join(page_texts)
        for index, (number, page_index, top_points) in enumerate(anchors):
            next_anchor = anchors[index + 1] if index < len(anchors) - 1 else None
            image = images[page_index]
            scale = image.height / document.pages[page_index - 1].height
            crop_top = max(0, int((top_points - 8) * scale))
            crop_bottom = (
                int((next_anchor[2] - 6) * scale)
                if next_anchor and next_anchor[1] == page_index
                else image.height
            )

            # Locate the actual “Question Type” panel rather than incidental
            # uses of the word “question” in question text.
            words = page_words[page_index - 1]
            metadata = next((word for word in words if word["top"] > top_points and word["text"] == "Question" and any(
                candidate["text"] == "Type" and abs(candidate["top"] - word["top"]) < 5 and candidate["x0"] > word["x0"]
                for candidate in words
            )), None)
            crop = image.crop((0, crop_top, image.width, max(crop_top + 1, crop_bottom)))
            if metadata:
                # Preserve the entire left-side option list; remove the complete
                # lower-right metadata panel and its border to the crop bottom.
                panel_top = max(0, int((metadata["top"] - 28) * scale) - crop_top)
                crop.paste("white", (int(crop.width * 0.45), panel_top, crop.width, crop.height))

            image_path = crops_dir / f"q{number:02}.png"
            crop.save(image_path, optimize=True)

            start = full_text.find(f"Q.{number}")
            end = full_text.find(f"Q.{number + 1}", start + 1) if number < 75 else len(full_text)
            question_text = full_text[start:end]
            id_match = re.search(r"Question ID\s*:\s*(\d+)", question_text)
            if not id_match:
                raise RuntimeError(f"{code} Q{number}: missing question ID")
            question_id = id_match.group(1)
            option_ids = re.findall(r"Option ([1-4]) ID\s*:\s*(\d+)", question_text)
            # In the key, numerical-answer rows occasionally run the question ID
            # and answer together (for example 736475100030 for ID 7364751000, answer 30).
            answer_match = re.search(rf"\b{question_id}\s*(\d+|DROP)\b", answer_text, re.IGNORECASE)
            if not answer_match:
                raise RuntimeError(f"{code} Q{number}: missing official answer")
            official_answer = answer_match.group(1).upper()
            selected_option = next((option for option, option_id in option_ids if option_id == official_answer), None)
            manifest.append({
                "number": number,
                "subject": subject(number),
                "question_type": "MCQ" if option_ids else "NUMERICAL",
                "image_path": str(image_path),
                "answer": selected_option or official_answer,
            })

    (paper_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(code)
