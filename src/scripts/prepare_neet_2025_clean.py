from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

import pdfplumber
from PIL import Image
from pypdf import PdfReader


QUESTION_PAGE_START = 2
QUESTION_PAGE_END = 25
ANSWER_KEY_PAGE = 26
TOTAL_QUESTIONS = 180

CSV_COLUMNS = [
    "exam_id",
    "exam",
    "subject",
    "chapter",
    "topic",
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
    "correct_options",
    "explanation",
    "year",
    "exam_type",
    "attempt",
    "shift",
    "question_type",
    "numerical_answer",
    "marks_positive",
    "marks_negative",
    "question_image",
    "explanation_image",
    "option_a_image",
    "option_b_image",
    "option_c_image",
    "option_d_image",
    "numerical_min",
    "numerical_max",
    "paper_code",
    "question_number",
    "display_order",
    "difficulty",
    "import_package_id",
    "status",
    "confidence_score",
]


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def subject_for(number: int) -> str:
    if number <= 45:
        return "Physics"
    if number <= 90:
        return "Chemistry"
    return "Biology"


def chapter_for(subject: str, text: str) -> str:
    combined = text.lower()
    if subject == "Physics":
        if any(k in combined for k in ["capacitor", "electric field", "dipole", "charge density"]):
            return "Electrostatics & Capacitance"
        if any(k in combined for k in ["current", "resistor", "resistance", "wheatstone", "circuit"]):
            return "Current Electricity"
        if any(k in combined for k in ["magnetic", "em wave", "electromagnetic wave"]):
            return "Magnetic Effects of Current & Magnetism"
        if any(k in combined for k in ["reactance", "inductor", "ac power", "alternating current"]):
            return "Electromagnetic Induction & Alternating Current"
        if any(k in combined for k in ["lens", "microscope", "polaroid", "polarization", "photoelectric"]):
            return "Ray & Wave Optics"
        if any(k in combined for k in ["bohr", "de-broglie", "photon", "hydrogen atom"]):
            return "Dual Nature of Radiation & Matter"
        if any(k in combined for k in ["diode", "rectifier", "logic"]):
            return "Semiconductors & Electronic Devices"
        if any(k in combined for k in ["velocity", "acceleration", "speed", "height", "bus"]):
            return "Kinematics (Motion in a Straight Line & Plane)"
        if any(k in combined for k in ["friction", "inclined", "force"]):
            return "Laws of Motion & Friction"
        if any(k in combined for k in ["moment of inertia", "sphere", "rod", "rotates"]):
            return "System of Particles & Rotational Motion"
        if any(k in combined for k in ["sun", "mars", "mercury", "gravitational"]):
            return "Gravitation"
        if any(k in combined for k in ["heat", "thermal", "gas", "pressure", "temperature"]):
            return "Thermal Properties of Matter & Thermodynamics"
        if any(k in combined for k in ["spring", "oscillat", "frequency", "pipe"]):
            return "Waves & Sound"
        if any(k in combined for k in ["vernier", "measurement", "error"]):
            return "Physical World & Units of Measurement"
        return "Physics Core"

    if subject == "Chemistry":
        if any(k in combined for k in ["ionization", "electronegativity", "isoelectronic", "atomic radius"]):
            return "Periodic Table & Periodicity"
        if any(k in combined for k in ["bohr orbit", "atom", "orbital", "quantum"]):
            return "Structure of Atom"
        if any(k in combined for k in ["coordination", "ligand", "complex", "wilkinson"]):
            return "Coordination Compounds"
        if any(k in combined for k in ["paramagnetic", "d-block", "transition"]):
            return "d and f-Block Elements"
        if any(k in combined for k in ["bond", "hybrid", "shape of"]):
            return "Chemical Bonding & Molecular Structure"
        if any(k in combined for k in ["mole", "molar", "stoichiometry"]):
            return "Some Basic Concepts of Chemistry (Mole Concept)"
        if any(k in combined for k in ["enthalpy", "thermodynamic", "gibbs"]):
            return "Chemical Thermodynamics & Energetics"
        if any(k in combined for k in ["equilibrium", "ph", "buffer"]):
            return "Chemical & Ionic Equilibrium"
        if any(k in combined for k in ["cell", "electrode", "conductivity", "redox"]):
            return "Redox Reactions & Electrochemistry"
        if any(k in combined for k in ["rate", "kinetics", "half-life"]):
            return "Chemical Kinetics"
        if any(k in combined for k in ["solution", "vapour pressure", "colligative"]):
            return "Solutions & Colligative Properties"
        if any(k in combined for k in ["benzene", "alkene", "alkyne", "hydrocarbon"]):
            return "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)"
        if any(k in combined for k in ["amine", "aniline", "diazonium"]):
            return "Amines & Organic Nitrogen Compounds"
        if any(k in combined for k in ["glucose", "fructose", "carbohydrate", "protein", "biomolecule"]):
            return "Biomolecules, Polymers & Everyday Chemistry"
        if any(k in combined for k in ["reagent", "major product", "organic", "compound"]):
            return "General Organic Chemistry (GOC) & Nomenclature"
        return "Chemistry Core"

    if any(k in combined for k in ["inheritance", "gene", "chromosome", "pedigree", "mendel"]):
        return "Principles of Inheritance & Variation (Genetics)"
    if any(k in combined for k in ["dna", "rna", "transcription", "genetic code", "histone"]):
        return "Molecular Basis of Inheritance"
    if any(k in combined for k in ["cell", "mitosis", "meiosis", "ribosome", "golgi", "centromere"]):
        return "Cell: Structure, Function & Cell Division"
    if any(k in combined for k in ["enzyme", "haem", "nucleotide", "nucleoside"]):
        return "Cell: Structure, Function & Cell Division"
    if any(k in combined for k in ["photosynthesis", "rubisco", "productivity", "ecosystem"]):
        return "Plant Physiology (Photosynthesis & Respiration)"
    if any(k in combined for k in ["auxin", "abscisic", "plant growth"]):
        return "Plant Growth & Development"
    if any(k in combined for k in ["menstruation", "pregnancy", "gametophyte", "embryo sac", "twins"]):
        return "Human Reproduction & Reproductive Health"
    if any(k in combined for k in ["heart", "kidney", "insulin", "adrenal", "lymphoid"]):
        return "Human Physiology (Digestion, Respiration, Circulation)"
    if any(k in combined for k in ["flower", "seed", "gymnosperm", "bryophyte", "frog", "cyclostomata"]):
        return "Plant Kingdom & Animal Kingdom"
    if any(k in combined for k in ["recombinant", "cloning", "plasmid", "electrophoresis"]):
        return "Biotechnology: Principles & Applications"
    if any(k in combined for k in ["ecology", "fig", "conservation", "population", "evil quartet"]):
        return "Ecology, Ecosystem & Biodiversity Conservation"
    if any(k in combined for k in ["cancer", "immunity", "microbe", "lactobacillus"]):
        return "Human Health, Diseases & Microbes"
    return "Biology Core"


def parse_answer_key(reader: PdfReader) -> dict[int, list[str]]:
    text = reader.pages[ANSWER_KEY_PAGE - 1].extract_text() or ""
    answers: dict[int, list[str]] = {}
    for num, raw in re.findall(r"(\d{1,3})\.\s*\(([^)]+)\)", text):
        number = int(num)
        if 1 <= number <= TOTAL_QUESTIONS:
            options = []
            for item in raw.split(","):
                item = item.strip()
                if item.isdigit() and 1 <= int(item) <= 4:
                    options.append(chr(ord("a") + int(item) - 1))
            answers[number] = options
    if set(answers) != set(range(1, TOTAL_QUESTIONS + 1)):
        missing = sorted(set(range(1, TOTAL_QUESTIONS + 1)) - set(answers))
        raise ValueError(f"Answer key missing questions: {missing[:20]}")
    return answers


def parse_question_text(reader: PdfReader) -> dict[int, str]:
    text = "\n".join((reader.pages[i].extract_text() or "") for i in range(1, QUESTION_PAGE_END))
    matches = list(re.finditer(r"(?m)^\s*(\d{1,3})\.\s+", text))
    starts = [m for m in matches if 1 <= int(m.group(1)) <= TOTAL_QUESTIONS]
    by_number: dict[int, str] = {}
    for index, match in enumerate(starts):
        number = int(match.group(1))
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[match.end() : end]
        block = re.sub(r"\[\d+\]\s*\[Contd\.\.\.", " ", block)
        block = re.sub(r"NEET \(UG\)-2025.*?ENGLISH", " ", block)
        by_number[number] = compact(block)
    return by_number


def parse_solutions(reader: PdfReader) -> dict[int, str]:
    text = "\n".join((reader.pages[i].extract_text() or "") for i in range(26, len(reader.pages)))
    matches = list(re.finditer(r"Q(\d{1,3})\s*(?:\n|\s)*Text Solution:", text))
    solutions: dict[int, str] = {}
    for index, match in enumerate(matches):
        number = int(match.group(1))
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        if 1 <= number <= TOTAL_QUESTIONS:
            solutions[number] = compact(text[match.end() : end])
    return solutions


def question_markers(pdf_path: Path) -> list[dict]:
    markers: list[dict] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_index in range(QUESTION_PAGE_START - 1, QUESTION_PAGE_END):
            page = pdf.pages[page_index]
            words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
            for word in words:
                if re.fullmatch(r"(?:[1-9]|[1-9][0-9]|1[0-7][0-9]|180)\.", word["text"]):
                    number = int(word["text"][:-1])
                    column = 0 if word["x0"] < page.width / 2 else 1
                    markers.append(
                        {
                            "number": number,
                            "page": page_index,
                            "column": column,
                            "top": float(word["top"]),
                        }
                    )
    markers.sort(key=lambda m: (m["page"], m["column"], m["top"]))
    numbers = [m["number"] for m in markers]
    if numbers != list(range(1, TOTAL_QUESTIONS + 1)):
        raise ValueError(f"Question marker order is invalid: {numbers[:12]} ... {numbers[-12:]}")
    return markers


def render_question_images(pdf_path: Path, output_dir: Path) -> dict[int, str]:
    image_dir = output_dir / "question-images"
    image_dir.mkdir(parents=True, exist_ok=True)
    markers = question_markers(pdf_path)
    paths: dict[int, str] = {}
    column_boxes = {
        0: (28, 44, 300, 824),
        1: (306, 44, 570, 824),
    }

    with pdfplumber.open(pdf_path) as pdf:
        for index, marker in enumerate(markers):
            end = markers[index + 1] if index + 1 < len(markers) else None
            pieces: list[Image.Image] = []
            for page_index in range(marker["page"], (end["page"] if end else QUESTION_PAGE_END - 1) + 1):
                for column in (0, 1):
                    if (page_index, column) < (marker["page"], marker["column"]):
                        continue
                    if end and (page_index, column) > (end["page"], end["column"]):
                        continue
                    left, default_top, right, default_bottom = column_boxes[column]
                    top = marker["top"] - 4 if (page_index, column) == (marker["page"], marker["column"]) else default_top
                    if end and (page_index, column) == (end["page"], end["column"]):
                        bottom = end["top"] - 6
                    elif not end and (page_index, column) == (marker["page"], marker["column"]):
                        bottom = min(default_bottom, marker["top"] + 330)
                    else:
                        bottom = default_bottom
                    if bottom <= top + 8:
                        continue
                    page = pdf.pages[page_index]
                    crop = page.crop((left, max(0, top), right, min(page.height, bottom)))
                    pieces.append(crop.to_image(resolution=180).original.convert("RGB"))
            if not pieces:
                raise ValueError(f"Question {marker['number']} produced no image pieces")
            width = max(piece.width for piece in pieces)
            height = sum(piece.height for piece in pieces) + 10 * (len(pieces) - 1)
            combined = Image.new("RGB", (width, height), "white")
            y = 0
            for piece in pieces:
                combined.paste(piece, (0, y))
                y += piece.height + 10
            subject = subject_for(marker["number"]).lower()
            path = image_dir / f"neet-2025-{subject}-q{marker['number']:03d}.png"
            combined.save(path, "PNG", optimize=True)
            paths[marker["number"]] = str(path)
    return paths


def storage_path_for(number: int) -> str:
    subject = subject_for(number).lower()
    return f"pyq/neet/2025/{subject}/neet-2025-{subject}-q{number:03d}.png"


def build_manifest(pdf_path: Path, output_dir: Path) -> list[dict]:
    reader = PdfReader(pdf_path)
    answers = parse_answer_key(reader)
    text_by_number = parse_question_text(reader)
    solutions = parse_solutions(reader)
    images = render_question_images(pdf_path, output_dir)
    manifest: list[dict] = []

    for number in range(1, TOTAL_QUESTIONS + 1):
        subject = subject_for(number)
        raw_text = text_by_number.get(number, "")
        answer_options = answers[number]
        question_type = "MULTIPLE_CORRECT" if len(answer_options) > 1 else "MCQ"
        manifest.append(
            {
                "number": number,
                "exam_id": "",
                "exam": "NEET",
                "subject": subject,
                "chapter": chapter_for(subject, raw_text),
                "topic": "",
                "question": f"Question {number}: Refer to the source image.",
                "option_a": "Option 1",
                "option_b": "Option 2",
                "option_c": "Option 3",
                "option_d": "Option 4",
                "correct_option": answer_options[0],
                "correct_options": answer_options if len(answer_options) > 1 else None,
                "explanation": solutions.get(number, ""),
                "year": 2025,
                "exam_type": "NEET UG",
                "attempt": "NEET 2025 Official",
                "shift": "Shift 1",
                "question_type": question_type,
                "numerical_answer": None,
                "marks_positive": 4,
                "marks_negative": -1,
                "question_image": "",
                "explanation_image": None,
                "option_a_image": None,
                "option_b_image": None,
                "option_c_image": None,
                "option_d_image": None,
                "numerical_min": None,
                "numerical_max": None,
                "paper_code": "Narmada 48",
                "question_number": number,
                "display_order": number,
                "difficulty": None,
                "import_package_id": "",
                "status": "NEEDS_REVIEW",
                "confidence_score": 0.72,
                "image_path": images[number],
                "storage_path": storage_path_for(number),
                "raw_text": raw_text,
            }
        )
    return manifest


def write_csv(rows: list[dict], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in CSV_COLUMNS})


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: prepare_neet_2025_clean.py INPUT_PDF OUTPUT_DIRECTORY")
    pdf_path = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest(pdf_path, output_dir)
    manifest_path = output_dir / "neet-2025-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(manifest, output_dir / "neet-2025-pyq.csv")
    print(f"Validated {len(manifest)} questions and wrote {manifest_path}")


if __name__ == "__main__":
    main()
