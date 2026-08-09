import json
import re
import subprocess
import urllib.request
from collections import defaultdict
from pathlib import Path

import pdfplumber
from PIL import Image, ImageChops


ROOT = Path.cwd()
TMP_ROOT = ROOT / "tmp" / "jee-main-2026-april-clean"
ANSWER_KEY_PDF = TMP_ROOT / "jee-main-2026-session2-final-answer-key.pdf"
PDFTOPPM = "/opt/homebrew/bin/pdftoppm"

PAPERS = [
    {
        "code": "JEE-MAIN-26-02APR-S1",
        "date": "02.04.2026",
        "shift_name": "First",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/11922-2nd Apr 2026 Shift 1 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/202604092096865379.pdf",
    },
    {
        "code": "JEE-MAIN-26-02APR-S2",
        "date": "02.04.2026",
        "shift_name": "Second",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/105335-2nd Apr 2026 Shift 2 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409481957146.pdf",
    },
    {
        "code": "JEE-MAIN-26-04APR-S1",
        "date": "04.04.2026",
        "shift_name": "First",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/105014-4th Apr 2026 Shift 1 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/202604091916616339.pdf",
    },
    {
        "code": "JEE-MAIN-26-04APR-S2",
        "date": "04.04.2026",
        "shift_name": "Second",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/105414-4th Apr 2026 Shift 2 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409432593766.pdf",
    },
    {
        "code": "JEE-MAIN-26-05APR-S1",
        "date": "05.04.2026",
        "shift_name": "First",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/11748-5th Apr 2026 Shift 1 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409828731207.pdf",
    },
    {
        "code": "JEE-MAIN-26-05APR-S2",
        "date": "05.04.2026",
        "shift_name": "Second",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/111041-5th Apr 2026 Shift 2 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409829414602.pdf",
    },
    {
        "code": "JEE-MAIN-26-06APR-S1",
        "date": "06.04.2026",
        "shift_name": "First",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/111020-6th Apr 2026 Shift 1 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/202604092007095665.pdf",
    },
    {
        "code": "JEE-MAIN-26-06APR-S2",
        "date": "06.04.2026",
        "shift_name": "Second",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/1172-6th Apr 2026 Shift 2 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409725707538.pdf",
    },
    {
        "code": "JEE-MAIN-26-08APR-S2",
        "date": "08.04.2026",
        "shift_name": "Second",
        "actual_pdf": Path("/Users/ateebmazhar/Downloads/105847-8th Apr 2026 Shift 2 (Actual Paper).pdf"),
        "preview_url": "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409932754345.pdf",
    },
]


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def download_if_missing(url: str, destination: Path) -> Path:
    if destination.exists() and destination.stat().st_size > 0:
        return destination

    ensure_dir(destination.parent)
    with urllib.request.urlopen(url) as response:
        destination.write_bytes(response.read())
    return destination


def subject_for_number(number: int) -> str:
    if number <= 25:
        return "Mathematics"
    if number <= 50:
        return "Physics"
    return "Chemistry"


def trim_whitespace(image: Image.Image, border: int = 4) -> Image.Image:
    bg = Image.new(image.mode, image.size, "white")
    diff = ImageChops.difference(image, bg)
    bbox = diff.getbbox()
    if not bbox:
        return image

    left = max(0, bbox[0] - border)
    top = max(0, bbox[1] - border)
    right = min(image.width, bbox[2] + border)
    bottom = min(image.height, bbox[3] + border)
    return image.crop((left, top, right, bottom))


def tight_trim(image: Image.Image) -> Image.Image:
    grayscale = image.convert("L")
    width, height = image.size
    mask = grayscale.point(lambda pixel: 255 if pixel < 245 else 0)
    x_projection, y_projection = mask.getprojection()

    significant_rows = [index for index, present in enumerate(y_projection) if present]
    significant_cols = [index for index, present in enumerate(x_projection) if present]

    if not significant_rows or not significant_cols:
        return image

    top = significant_rows[0]
    bottom = significant_rows[-1]
    left = significant_cols[0]
    right = significant_cols[-1]
    pad_x = 8
    pad_y = 8

    return image.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_y),
            min(width, right + pad_x + 1),
            min(height, bottom + pad_y + 1),
        )
    )


def parse_preview_manifest(preview_pdf: Path):
    text = subprocess.check_output(
        ["/opt/homebrew/bin/pdftotext", str(preview_pdf), "-"],
        text=True,
    )
    result = {}
    header_pattern = re.compile(
        r"(?:^|[\n\f])Question Number\s*:\s*(\d+)\s+Question Id\s*:\s*([0-9]+)\s+Question Type\s*:\s*(MCQ|SA)",
        re.M,
    )
    matches = list(header_pattern.finditer(text))

    for index, match in enumerate(matches):
        number = int(match.group(1))
        question_id = match.group(2)
        preview_type = match.group(3)
        chunk = text[match.end() : matches[index + 1].start() if index + 1 < len(matches) else len(text)]
        entry = {
            "number": number,
            "question_id": question_id,
            "question_type": "MCQ" if preview_type == "MCQ" else "NUMERICAL",
            "option_ids": [],
        }

        if preview_type == "MCQ":
            options_block = chunk.split("Options :", 1)
            if len(options_block) < 2:
                raise RuntimeError(f"Preview missing options for question {number}")
            option_ids = re.findall(r"([0-9]+)\.", options_block[1])
            entry["option_ids"] = option_ids[:4]
            if len(entry["option_ids"]) != 4:
                raise RuntimeError(f"Preview missing option ids for question {number}")

        result[number] = entry

    if sorted(result) != list(range(1, 76)):
        raise RuntimeError("Preview parsing did not return exactly 75 questions")

    return result


def parse_final_answer_key(answer_key_pdf: Path):
    text = subprocess.check_output(
        ["/opt/homebrew/bin/pdftotext", str(answer_key_pdf), "-"],
        text=True,
    )
    answers_by_shift = {}

    for page in text.split("\f"):
        if "(For Centers in India)" not in page:
            continue

        date_match = re.search(r"Exam Date\s*:\s*(\d{2}\.\d{2}\.\d{4})", page)
        shift_match = re.search(r"Exam Shift\s*:\s*(First|Second)", page)
        if not date_match or not shift_match:
            continue

        tokens = []
        for raw_line in page.splitlines():
            line = " ".join(raw_line.split())
            if (
                not line
                or "NATIONAL TESTING AGENCY" in line
                or "FINAL ANSWER KEY" in line
                or line.startswith("QUESTION ID")
                or line.startswith("Exam Date")
                or line.startswith("Exam Shift")
                or line.startswith("(For Centers")
                or line in {"( MATHEMATICS )", "( PHYSICS )", "( CHEMISTRY )"}
                or re.fullmatch(r"\d+\s+of\s+\d+", line)
            ):
                continue

            pair_match = re.fullmatch(r"(\d+)\s+(.+)", line)
            if pair_match:
                tokens.append(pair_match.group(1))
                tokens.append(pair_match.group(2).strip())
            else:
                tokens.append(line)

        values = {}
        index = 0
        while index + 1 < len(tokens):
            token = tokens[index]
            if re.fullmatch(r"\d+", token):
                values[token] = tokens[index + 1]
                index += 2
            else:
                index += 1

        if values:
            answers_by_shift[(date_match.group(1), shift_match.group(1))] = values

    return answers_by_shift


def resolve_answer(preview_entry, answer_value):
    if preview_entry["question_type"] == "MCQ":
        if answer_value.lower() == "dropped":
            return {
                "correct_option": None,
                "correct_options": None,
                "numerical_answer": None,
                "numerical_min": None,
                "numerical_max": None,
                "answer_label": "Dropped",
            }

        raw_option_ids = re.findall(r"\d+", answer_value)
        if not raw_option_ids:
            raw_option_ids = [answer_value.strip()]

        option_letters = []
        for option_id in raw_option_ids:
            try:
                option_index = preview_entry["option_ids"].index(option_id)
            except ValueError as exc:
                raise RuntimeError(
                    f"Answer key option id {answer_value} not found in preview options for question {preview_entry['number']}"
                ) from exc
            option_letters.append("abcd"[option_index])

        return {
            "correct_option": option_letters[0],
            "correct_options": option_letters if len(option_letters) > 1 else None,
            "numerical_answer": None,
            "numerical_min": None,
            "numerical_max": None,
            "answer_label": ", ".join(letter.upper() for letter in option_letters),
        }

    cleaned = answer_value.strip()
    if cleaned.lower() == "dropped":
        return {
            "correct_option": "a",
            "correct_options": None,
            "numerical_answer": None,
            "numerical_min": None,
            "numerical_max": None,
            "answer_label": "Dropped",
        }

    values = [value for value in re.findall(r"-?\d+(?:\.\d+)?", cleaned)]
    parsed_values = [float(v) if "." in v else int(v) for v in values]

    if not parsed_values:
        return {
            "correct_option": "a",
            "correct_options": None,
            "numerical_answer": None,
            "numerical_min": None,
            "numerical_max": None,
            "answer_label": cleaned,
        }

    if len(parsed_values) == 1:
        return {
            "correct_option": "a",
            "correct_options": None,
            "numerical_answer": parsed_values[0],
            "numerical_min": None,
            "numerical_max": None,
            "answer_label": str(parsed_values[0]),
        }

    unique = list(dict.fromkeys(parsed_values))
    return {
        "correct_option": "a",
        "correct_options": [str(v) for v in unique],
        "numerical_answer": unique[0],
        "numerical_min": min(unique),
        "numerical_max": max(unique),
        "answer_label": cleaned,
    }


def detect_question_anchors(page_words, page_width):
    candidates = []
    for word in page_words:
        token = word["text"]
        if not re.fullmatch(r"(?:[1-9]|[1-6][0-9]|7[0-5])\.", token):
            continue
        candidates.append(word)

    if not candidates:
        return []

    left_start = min(word["x0"] for word in candidates)
    right_candidates = sorted(
        (word for word in candidates if word["x0"] > page_width * 0.45),
        key=lambda word: word["x0"],
    )

    right_start = None
    if right_candidates:
        clusters = []
        for word in right_candidates:
            if not clusters or abs(word["x0"] - clusters[-1]["x_values"][-1]) > 24:
                clusters.append({"x_values": [word["x0"]], "words": [word]})
            else:
                clusters[-1]["x_values"].append(word["x0"])
                clusters[-1]["words"].append(word)
        best_cluster = sorted(clusters, key=lambda cluster: (-len(cluster["words"]), cluster["x_values"][0]))[0]
        right_start = sum(best_cluster["x_values"]) / len(best_cluster["x_values"])

    anchors = [word for word in candidates if abs(word["x0"] - left_start) <= 10]
    if right_start is not None:
        anchors.extend(word for word in right_candidates if abs(word["x0"] - right_start) <= 10)

    return anchors


def render_pages(source_pdf: Path, page_dir: Path):
    ensure_dir(page_dir)
    if list(page_dir.glob("page-*.png")):
        return

    subprocess.run(
        [PDFTOPPM, "-png", "-r", "200", str(source_pdf), str(page_dir / "page")],
        check=True,
    )


def build_manifest(paper, answer_map):
    code = paper["code"]
    out_dir = TMP_ROOT / code
    page_dir = out_dir / "pages"
    crop_dir = out_dir / "crops"
    preview_pdf = out_dir / "preview.pdf"
    ensure_dir(crop_dir)

    download_if_missing(paper["preview_url"], preview_pdf)
    render_pages(paper["actual_pdf"], page_dir)

    preview_manifest = parse_preview_manifest(preview_pdf)
    page_images = {
        int(path.stem.split("-")[-1]): Image.open(path).convert("RGB")
        for path in page_dir.glob("page-*.png")
    }

    anchors_by_page = defaultdict(list)
    pages_data = {}

    with pdfplumber.open(paper["actual_pdf"]) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            words = page.extract_words(x_tolerance=1, y_tolerance=1)
            anchors = detect_question_anchors(words, page.width)
            for anchor in anchors:
                number = int(anchor["text"][:-1])
                if number < 1 or number > 75:
                    continue
                column = "left" if anchor["x0"] < page.width / 2 else "right"
                anchors_by_page[page_number].append(
                    {
                        "number": number,
                        "top": anchor["top"],
                        "column": column,
                    }
                )
            pages_data[page_number] = {
                "width": page.width,
                "height": page.height,
                "words": words,
            }

    ordered_numbers = sorted(
        number
        for page_anchors in anchors_by_page.values()
        for number in [anchor["number"] for anchor in page_anchors]
    )
    if ordered_numbers != list(range(1, 76)):
        raise RuntimeError(f"{code}: expected anchors 1-75, found {ordered_numbers[:10]} ... {ordered_numbers[-10:]}")

    manifest = []
    for page_number, anchor_list in anchors_by_page.items():
        anchor_list.sort(key=lambda item: (item["column"], item["top"]))

    for page_number, anchor_list in anchors_by_page.items():
        page_meta = pages_data[page_number]
        page_words = page_meta["words"]
        page_image = page_images[page_number]
        y_scale = page_image.height / page_meta["height"]
        x_scale = page_image.width / page_meta["width"]
        mid_x = page_meta["width"] / 2

        for anchor in anchor_list:
            same_column = [item for item in anchor_list if item["column"] == anchor["column"] and item["top"] > anchor["top"]]
            next_top = min((item["top"] for item in same_column), default=page_meta["height"] - 10)
            column_words = [
                word
                for word in page_words
                if word["top"] >= anchor["top"] - 2
                and word["top"] < next_top - 2
                and ((anchor["column"] == "left" and word["x0"] < mid_x) or (anchor["column"] == "right" and word["x0"] >= mid_x))
            ]

            if not column_words:
                raise RuntimeError(f"{code} Q{anchor['number']}: no words found for crop")

            raw_left = 12 if anchor["column"] == "left" else int((mid_x + 6) * x_scale)
            raw_right = int((mid_x - 8) * x_scale) if anchor["column"] == "left" else page_image.width - 12
            raw_top = max(0, int((anchor["top"] - 8) * y_scale))
            content_bottom = int((max(word["bottom"] for word in column_words) + 4) * y_scale)
            if same_column:
                next_anchor_bottom = max(raw_top + 1, int((next_top - 4) * y_scale))
                raw_bottom = min(page_image.height, min(content_bottom, next_anchor_bottom))
            else:
                raw_bottom = min(page_image.height, content_bottom)

            raw_crop = page_image.crop((raw_left, raw_top, raw_right, raw_bottom))
            cropped = tight_trim(trim_whitespace(raw_crop, border=2))
            crop_path = crop_dir / f"q{anchor['number']:02}.png"
            cropped.save(crop_path, optimize=True)

            preview_entry = preview_manifest[anchor["number"]]
            answer_value = answer_map[preview_entry["question_id"]]
            resolved = resolve_answer(preview_entry, answer_value)
            manifest.append(
                {
                    "number": anchor["number"],
                    "subject": subject_for_number(anchor["number"]),
                    "question_type": preview_entry["question_type"],
                    "question_id": preview_entry["question_id"],
                    "option_ids": preview_entry["option_ids"],
                    "answer_raw": answer_value,
                    "answer_label": resolved["answer_label"],
                    "correct_option": resolved["correct_option"],
                    "correct_options": resolved["correct_options"],
                    "numerical_answer": resolved["numerical_answer"],
                    "numerical_min": resolved["numerical_min"],
                    "numerical_max": resolved["numerical_max"],
                    "image_path": str(crop_path),
                    "page_number": page_number,
                }
            )

    manifest.sort(key=lambda item: item["number"])
    if [item["number"] for item in manifest] != list(range(1, 76)):
        raise RuntimeError(f"{code}: manifest numbering incomplete")

    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(code)


def main():
    ensure_dir(TMP_ROOT)
    download_if_missing(
        "https://www.nta.ac.in/Download/Notice/Notice_20260420132025.pdf",
        ANSWER_KEY_PDF,
    )
    answers_by_shift = parse_final_answer_key(ANSWER_KEY_PDF)

    for paper in PAPERS:
        answer_map = answers_by_shift.get((paper["date"], paper["shift_name"]))
        if not answer_map:
            raise RuntimeError(f"Missing answer key block for {paper['code']}")
        build_manifest(paper, answer_map)


if __name__ == "__main__":
    main()
