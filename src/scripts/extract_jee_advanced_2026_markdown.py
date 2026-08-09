import csv
import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import List

from PIL import Image, ImageChops


ROOT = Path.cwd()
TMP_DIR = ROOT / "tmp" / "pdfs" / "ja26"
RENDER_DIR = TMP_DIR / "all"
OCR_DIR = TMP_DIR / "ocr"
OUTPUT_DIR = ROOT / "output" / "pdf" / "jee-advanced-2026-markdown"
FIGURES_DIR = OUTPUT_DIR / "figures"
TESSERACT = "/opt/homebrew/bin/tesseract"
PDFTOPPM = "/opt/homebrew/bin/pdftoppm"


PDFS = {
    "source_a": Path("/Users/ateebmazhar/Downloads/37075f57-6ddc-4aa8-bfa8-4e10d7b43fd8.pdf"),
    "source_b": Path("/Users/ateebmazhar/Downloads/15a117d9-1149-4997-9220-2d62a8b9998c.pdf"),
}


SUBJECTS = [
    {"paper": "Paper1", "subject": "Math", "source": "source_a", "pages": range(1, 11)},
    {"paper": "Paper1", "subject": "Physics", "source": "source_a", "pages": range(11, 25)},
    {"paper": "Paper1", "subject": "Chemistry", "source": "source_a", "pages": range(25, 35)},
    {"paper": "Paper2", "subject": "Math", "source": "source_b", "pages": range(1, 10)},
    {"paper": "Paper2", "subject": "Physics", "source": "source_b", "pages": range(10, 20)},
    {"paper": "Paper2", "subject": "Chemistry", "source": "source_b", "pages": range(20, 30)},
]


FIGURE_KEYWORDS = [
    "figure",
    "shown in the figure",
    "as shown",
    "diagram",
    "circuit",
    "graph",
    "plot",
    "ray",
    "structure",
]


@dataclass
class WordBox:
    text: str
    left: int
    top: int
    width: int
    height: int

    @property
    def right(self) -> int:
        return self.left + self.width

    @property
    def bottom(self) -> int:
        return self.top + self.height


def ensure_dirs() -> None:
    OCR_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def render_pdf(source_key: str) -> None:
    prefix = RENDER_DIR / source_key
    if list(RENDER_DIR.glob(f"{source_key}-*.png")):
        return
    subprocess.run(
        [PDFTOPPM, "-png", str(PDFS[source_key]), str(prefix)],
        check=True,
    )


def ocr_image(image_path: Path) -> str:
    txt_path = OCR_DIR / f"{image_path.stem}.txt"
    if txt_path.exists():
        return txt_path.read_text()
    text = subprocess.check_output(
        [TESSERACT, str(image_path), "stdout", "--psm", "4"],
        text=True,
        stderr=subprocess.DEVNULL,
    )
    txt_path.write_text(text)
    return text


def ocr_tsv(image_path: Path) -> List[WordBox]:
    tsv_path = OCR_DIR / f"{image_path.stem}.tsv"
    if not tsv_path.exists():
        output = subprocess.check_output(
            [TESSERACT, str(image_path), "stdout", "--psm", "4", "tsv"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
        tsv_path.write_text(output)

    words: List[WordBox] = []
    with tsv_path.open() as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            text = (row.get("text") or "").strip()
            if not text:
                continue
            try:
                conf = float(row.get("conf") or "-1")
                if conf < 0:
                    continue
                words.append(
                    WordBox(
                        text=text,
                        left=int(row["left"]),
                        top=int(row["top"]),
                        width=int(row["width"]),
                        height=int(row["height"]),
                    )
                )
            except Exception:
                continue
    return words


def normalize_text(text: str) -> str:
    cleaned = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    cleaned = cleaned.replace("—", "-").replace("–", "-").replace("¢", "*").replace("€", "∈")
    cleaned = cleaned.replace("00", "\\infty")
    cleaned = cleaned.replace("09", "\\infty")
    cleaned = cleaned.replace("oo", "\\infty")
    cleaned = re.sub(r"([A-Za-z0-9])\?", r"\1^2", cleaned)
    cleaned = re.sub(r"([A-Za-z0-9])\*", r"\1^2", cleaned)
    cleaned = cleaned.replace("x7", "x^2").replace("y7", "y^2").replace("z7", "z^2")
    cleaned = cleaned.replace("x?", "x^2").replace("y?", "y^2").replace("z?", "z^2")
    cleaned = cleaned.replace("A6", r"\Delta\theta").replace("A@", r"\Delta\theta")
    cleaned = cleaned.replace("log,", r"\log_e").replace("loge", r"\log_e")
    cleaned = cleaned.replace("V5", r"\sqrt{5}")
    cleaned = cleaned.replace("VE", r"\sqrt{x}")
    cleaned = cleaned.replace("mho", r"\Omega^{-1}")
    cleaned = cleaned.replace("ms~*", r"m\,s^{-1}")
    cleaned = cleaned.replace("kg m~?", r"kg\,m^{-3}")
    cleaned = cleaned.replace("x? + y?", r"x^2 + y^2")
    cleaned = cleaned.replace("x?+y?", r"x^2+y^2")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def is_math_heavy(line: str) -> bool:
    line = line.strip()
    if not line:
        return False
    symbols = sum(ch in "=+-/*^_()[]{}<>√πλμθΔ∫∑∞" for ch in line)
    digits = sum(ch.isdigit() for ch in line)
    return symbols + digits >= max(3, len(line) // 5)


def format_line(line: str) -> str:
    line = normalize_text(line)
    if not line:
        return ""
    if re.fullmatch(r"\(?[ABCD]\)?\s*\|?.*", line):
        return line
    if is_math_heavy(line) and len(line) < 120:
        return rf"\[{line}\]"
    return line


def split_question_blocks(text: str):
    pattern = re.compile(r"(Question Stem for Question Nos\.[\s\S]*?)(?=Q\.\d+|$)|(?=(Q\.\d+))", re.I)
    blocks = []
    index = 0
    while index < len(text):
        stem_match = re.search(r"Question Stem for Question Nos\.[\s\S]*?(?=Q\.\d+|$)", text[index:], re.I)
        question_match = re.search(r"Q\.(\d+)", text[index:])
        if stem_match and (not question_match or stem_match.start() < question_match.start()):
            start = index + stem_match.start()
            end = index + stem_match.end()
            blocks.append(("stem", text[start:end].strip()))
            index = end
            continue
        if not question_match:
            break
        start = index + question_match.start()
        next_match = re.search(r"Q\.(\d+)", text[start + 2 :])
        end = len(text) if not next_match else start + 2 + next_match.start()
        blocks.append(("question", text[start:end].strip()))
        index = end
    return blocks


def parse_options(block: str):
    if "(A)" not in block:
        return None, block
    parts = re.split(r"(?=\([ABCD]\))", block)
    stem = parts[0].strip()
    options = []
    for part in parts[1:]:
        part = normalize_text(part)
        if not part:
            continue
        options.append(part)
    return options, stem


def bbox_trim(image: Image.Image):
    bg = Image.new(image.mode, image.size, "white")
    diff = ImageChops.difference(image, bg)
    bbox = diff.getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - 4)
    top = max(0, bbox[1] - 4)
    right = min(image.width, bbox[2] + 4)
    bottom = min(image.height, bbox[3] + 4)
    return image.crop((left, top, right, bottom))


def extract_figure(image_path: Path, words: List[WordBox], question_number: int, paper: str, subject: str):
    page_image = Image.open(image_path).convert("RGB")
    q_tokens = [w for w in words if w.text.startswith("Q.") or re.fullmatch(r"Q\.\d+", w.text)]
    q_words = [w for w in q_tokens if re.sub(r"\D", "", w.text) == str(question_number)]
    if not q_words:
        return None

    q_top = min(w.top for w in q_words)
    following_qs = [w for w in q_tokens if w.top > q_top and q_top + 10 < w.top]
    q_bottom_limit = min((w.top for w in following_qs), default=page_image.height - 40)

    option_words = [w for w in words if w.top > q_top and w.top < q_bottom_limit and re.fullmatch(r"\(?[ABCD]\)?", w.text)]
    option_top = min((w.top for w in option_words), default=q_bottom_limit - 20)

    if option_top - q_top < 120:
        return None

    band = page_image.crop((120, q_top + 70, page_image.width - 120, option_top - 10))
    band = bbox_trim(band)
    if band.width < 80 or band.height < 80:
        return None

    figure_name = f"Q{question_number:02}_{paper}_{subject}.png"
    figure_path = FIGURES_DIR / figure_name
    band.save(figure_path)
    return figure_name


def build_subject_markdown(config):
    paper = config["paper"]
    subject = config["subject"]
    page_numbers = list(config["pages"])

    page_texts = {}
    page_words = {}
    page_paths = {}
    for page_number in page_numbers:
        image_path = RENDER_DIR / f"{config['source']}-{page_number:02}.png"
        page_paths[page_number] = image_path
        page_texts[page_number] = ocr_image(image_path)
        page_words[page_number] = ocr_tsv(image_path)

    lines = [f"# {paper} {subject}", ""]

    seen_questions = set()
    saw_headers = False
    for page_number in page_numbers:
        page_text = page_texts[page_number].replace("IEE", "JEE").replace("ach question", "Each question")
        preface = page_text.split("Q.1", 1)[0]
        preface_lines = [normalize_text(line) for line in preface.splitlines() if normalize_text(line)]
        if preface_lines and not saw_headers:
            lines.append("## Section Headers")
            lines.append("")
            for line in preface_lines:
                lines.append(f"- {line}")
            lines.append("")
            saw_headers = True

        for kind, block in split_question_blocks(page_text):
            if kind == "stem":
                lines.append("## Shared Stem")
                lines.append("")
                for raw in block.splitlines():
                    formatted = format_line(raw)
                    if formatted:
                        lines.append(formatted)
                lines.append("")
                continue

            number_match = re.match(r"Q\.(\d+)", block)
            if not number_match:
                continue
            q_number = int(number_match.group(1))
            if q_number in seen_questions:
                continue
            seen_questions.add(q_number)

            options, stem = parse_options(block)
            lines.append(f"## Q.{q_number}")
            lines.append("")
            figure_name = None
            lower_stem = stem.lower()
            if any(keyword in lower_stem for keyword in FIGURE_KEYWORDS):
                page_words_list = page_words[page_number]
                if any(re.sub(r'\D', '', w.text) == str(q_number) for w in page_words_list if w.text.startswith("Q.")):
                    figure_name = extract_figure(page_paths[page_number], page_words_list, q_number, paper, subject)

            for raw in stem.splitlines():
                formatted = format_line(raw)
                if formatted:
                    lines.append(formatted)
            if figure_name:
                lines.append("")
                lines.append("[Figure/Diagram - see cropped image]")
                lines.append(f"![Q{q_number} figure](figures/{figure_name})")

            lines.append("")
            if options:
                for option in options[:4]:
                    lines.append(f"- {option}")
            else:
                lines.append("- Numerical answer: __________")
            lines.append("")

    output_path = OUTPUT_DIR / f"{paper}_{subject}.md"
    output_path.write_text("\n".join(lines).strip() + "\n")
    return output_path


def verify_outputs(md_paths: List[Path]) -> None:
    for path in md_paths:
        text = path.read_text()
        if text.count(r"\(") != text.count(r"\)"):
            raise RuntimeError(f"Unbalanced inline math delimiters in {path.name}")
        if text.count(r"\[") != text.count(r"\]"):
            raise RuntimeError(f"Unbalanced display math delimiters in {path.name}")
        for match in re.finditer(r"!\[[^\]]*\]\((figures/[^)]+)\)", text):
            figure_path = OUTPUT_DIR / match.group(1)
            if not figure_path.exists():
                raise RuntimeError(f"Missing figure file {figure_path}")


def main():
    ensure_dirs()
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    render_pdf("source_a")
    render_pdf("source_b")

    outputs = []
    for subject_config in SUBJECTS:
        outputs.append(build_subject_markdown(subject_config))

    verify_outputs(outputs)
    print(json.dumps([str(path) for path in outputs], indent=2))


if __name__ == "__main__":
    main()
