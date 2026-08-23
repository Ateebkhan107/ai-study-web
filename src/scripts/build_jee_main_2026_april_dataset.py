"""Build a text-first JEE Main Apr-2026 dataset from the extracted source blocks."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path.cwd()
DRAFT = ROOT / "tmp" / "jee-main-2026-april" / "draft"
OUTPUT = ROOT / "tmp" / "jee-main-2026-april" / "structured"
OVERRIDES = {
    ("JEE-MAIN-26-02APR-S1", 2): {
        "question": (
            r"Let $x$ and $y$ be real numbers such that "
            r"$50\left(\frac{2x}{1+3i}-\frac{y}{1-2i}\right)=31+17i$, "
            r"where $i=\sqrt{-1}$. Then the value of $10(x-3y)$ is:"
        ),
        "options": ["20", "31", "35", "75"],
    },
    ("JEE-MAIN-26-02APR-S1", 8): {
        "question": (
            "If the mean of the following frequency distribution is 21, then $k$ is one of the roots of the equation:\n\n"
            "| Class | 5–10 | 10–15 | 15–20 | 20–25 | 25–30 | 30–35 |\n"
            "|---|---:|---:|---:|---:|---:|---:|\n"
            "| Frequency | 2 | $k$ | 28 | 54 | $k+1$ | 5 |"
        ),
        "options": [
            r"$2x^2-23x-10=0$", r"$4x^2-35x+24=0$",
            r"$2x^2-19x-10=0$", r"$2x^2-35x+98=0$",
        ],
    },
    ("JEE-MAIN-26-02APR-S1", 60): {
        "question": (
            "Given below are two statements:\n\n"
            r"**Statement I:** The oxidising power of halogens decreases in the order "
            "$\\mathrm{F_2 > Cl_2 > Br_2 > I_2}$, which is the basis of the layer test.\n\n"
            r"**Statement II:** The layer test for identifying $\mathrm{Br_2}$ and $\mathrm{I_2}$ in aqueous "
            r"solution involves oxidation of bromide or iodide to $\mathrm{Br_2}$ or $\mathrm{I_2}$, respectively, "
            "by $\\mathrm{Cl_2}$. This is a displacement redox reaction.\n\n"
            "Choose the correct answer from the options given below:"
        ),
        "options": [
            "Both Statement I and Statement II are true",
            "Both Statement I and Statement II are false",
            "Statement I is true but Statement II is false",
            "Statement I is false but Statement II is true",
        ],
    },
    ("JEE-MAIN-26-02APR-S1", 69): {
        "question": (
            "Match List I with List II.\n\n"
            "| List I | Vitamin | List II | Name |\n"
            "|---|---|---|---|\n"
            "| A | Vitamin $\\mathrm{B_1}$ | I | Pyridoxine |\n"
            "| B | Vitamin $\\mathrm{B_2}$ | II | Ascorbic acid |\n"
            "| C | Vitamin $\\mathrm{B_6}$ | III | Thiamine |\n"
            "| D | Vitamin C | IV | Riboflavin |\n\n"
            "Choose the correct answer from the options given below:"
        ),
        "options": [
            "A-II, B-I, C-III, D-IV", "A-IV, B-III, C-II, D-I",
            "A-III, B-IV, C-I, D-II", "A-I, B-III, C-II, D-IV",
        ],
    },
    ("JEE-MAIN-26-02APR-S2", 66): {
        "question": (
            "An organic compound $X$, in which the molar ratio of C, O and H is equal, is treated with 50% KOH "
            "under reflux and then acidified to produce $Y$. The most likely structure of $Y$ is: "
            r"[Molar mass of $X$ is $58\,\mathrm{g\,mol^{-1}}$.]"
        ),
        "options": [
            r"$\mathrm{CH_2{=}CH{-}C(=O)OH}$",
            r"$\mathrm{CH_3{-}CH{=}CH{-}CHO}$",
            r"$\mathrm{HOOC{-}CH_2OH}$",
            r"$\mathrm{CH_3{-}C(=O)OH}$",
        ],
    },
    ("JEE-MAIN-26-05APR-S1", 18): {
        "question": r"The value of the integral $\int_0^\infty \frac{\log_e(x)}{x^2+4}\,dx$ is:",
        "options": [
            r"$\frac{\pi\log_e(2)}{2}$",
            r"$\frac{\pi\log_e(2)}{4}$",
            r"$1+\pi\log_e(2)$",
            r"$2+\pi\log_e(2)$",
        ],
    },
    ("JEE-MAIN-26-06APR-S1", 20): {
        "question": (
            r"Let $e$ be the base of the natural logarithm. Let "
            r"$f:\{1,2,3,4\}\to\{1,e,e^2,e^3\}$ and "
            r"$g:\{1,e,e^2,e^3\}\to\left\{1,\frac12,\frac13,\frac14\right\}$ "
            r"be bijective functions such that $f$ is strictly decreasing and $g$ is strictly increasing. "
            r"If $\phi(x)=\left[f^{-1}\left\{g^{-1}\left(\frac12\right)\right\}\right]^x$, "
            r"then the area of $R=\{(x,y):x^2\le y\le\phi(x),\ 0\le x\le1\}$ is:"
        ),
        "options": [
            r"$\frac{3-\log_e(2)}{3\log_e(2)}$",
            r"$\frac{1}{3\log_e(2)}$",
            r"$3+\log_e(2)$",
            r"$\frac{3+\log_e(2)}{2+\log_e(3)}$",
        ],
    },
}


def is_numerical(number: int) -> bool:
    return number % 25 in {21, 22, 23, 24, 0}


def split_mcq(text: str) -> tuple[str, list[str]]:
    markers = list(re.finditer(r"(?<!\w)\(([1-4])\)\s*", text))
    for index in range(len(markers) - 3):
        group = markers[index : index + 4]
        if [marker.group(1) for marker in group] != ["1", "2", "3", "4"]:
            continue
        # Prefer the final complete option group; statement labels such as (I)/(II)
        # are excluded by the numeric-only marker expression.
        if any(m.group(1) == "1" for m in markers[index + 4 :]):
            continue
        question = text[: group[0].start()].strip()
        options = []
        for option_index, marker in enumerate(group):
            end = group[option_index + 1].start() if option_index < 3 else len(text)
            options.append(text[marker.end() : end].strip())
        return question, options
    raise ValueError("Could not locate a complete (1)-(4) option group")


def format_match_list(text: str) -> str:
    """Preserve ordinary four-row matching lists as an actual Markdown table."""
    if not re.search(r"Match (?:the )?(?:LIST|List)", text):
        return text
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    lines = [line for line in lines if not line.lower().startswith("choose the correct answer")]
    row_indexes = [i for i, line in enumerate(lines) if re.match(r"^[A-D]\.\s+", line)]
    if len(row_indexes) != 4:
        return text
    rows = []
    for row_no, start in enumerate(row_indexes):
        end = row_indexes[row_no + 1] if row_no < 3 else len(lines)
        row = " ".join(lines[start:end])
        match = re.match(r"^([A-D])\.\s*(.*?)\s+(I{1,3}|IV)\.\s*(.*)$", row)
        if not match:
            return text
        rows.append(match.groups())
    prefix = lines[:row_indexes[0]]
    # The final line before A usually contains the two column headings.
    headings = prefix[-1] if prefix else "List I | List II"
    intro = "\n".join(prefix[:-1])
    table = [
        f"| List I | {headings} | List II | Entry |",
        "|---|---|---|---|",
        *[f"| {a} | {left} | {roman} | {right} |" for a, left, roman, right in rows],
    ]
    suffix = "Choose the correct answer from the options given below:"
    return f"{intro}\n\n" + "\n".join(table) + f"\n\n{suffix}"


def normalize_math_text(value: str) -> str:
    text = value.strip()
    text = text.replace("−", "-")
    # Never guess that a hyphenated number range is a scientific exponent.
    text = re.sub(
        r"(?<![A-Za-z0-9])([A-Za-zαβγλμθρ])([2-9])(?![A-Za-z0-9])",
        lambda m: f"${m.group(1)}^{{{m.group(2)}}}$",
        text,
    )
    # Chemical formulae must use subscripts, never detached trailing digits.
    chemical_tokens = r"(?:He|Li|Be|Ne|Na|Mg|Al|Si|Cl|Ar|Ca|Sc|Ti|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|Xe|Cs|Ba|La|Ce|Pr|Nd|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|Fr|Ra|Th|Pa|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|[BCNOFPSIKHVWY])"
    text = re.sub(rf"\b({chemical_tokens})\s+([2-9])\b", lambda m: f"$\\mathrm{{{m.group(1)}_{m.group(2)}}}$", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    return text.strip()


def build_question(row: dict, paper_code: str) -> dict:
    number = int(row["number"])
    source_text = row["source_text"]
    numerical = is_numerical(number)
    override = OVERRIDES.get((paper_code, number))
    if override:
        question = override["question"]
        options = override["options"]
        question_type = "MCQ"
        numerical = False
    elif numerical:
        question = source_text
        options = ["", "", "", ""]
        question_type = "NUMERICAL"
    else:
        question, options = split_mcq(source_text)
        question_type = "MCQ"
    answer = str(row["answer"]).strip()
    correct_option = "a"
    numerical_answer = None
    if numerical:
        try:
            numerical_answer = float(answer)
            if numerical_answer.is_integer():
                numerical_answer = int(numerical_answer)
        except ValueError:
            numerical_answer = answer
    else:
        correct_option = "abcd"[int(answer) - 1]
    normalized_question = normalize_math_text(format_match_list(question))
    normalized_options = [normalize_math_text(option) for option in options]
    explanation = (
        f"The answer given in the supplied paper is {answer}."
        if numerical
        else f"The answer key marks option {answer} as correct."
    )
    return {
        "number": number,
        "subject": row["subject"],
        "question_type": question_type,
        "question": normalized_question,
        "option_a": normalized_options[0],
        "option_b": normalized_options[1],
        "option_c": normalized_options[2],
        "option_d": normalized_options[3],
        "correct_option": correct_option,
        "numerical_answer": numerical_answer,
        "source_answer": answer,
        "explanation": explanation,
        "question_image": None,
    }


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    report = []
    for source_path in sorted(DRAFT.glob("JEE-MAIN-26-*.json")):
        source = json.loads(source_path.read_text())
        failures = []
        questions = []
        for row in source["questions"]:
            try:
                questions.append(build_question(row, source["paper_code"]))
            except Exception as error:  # keep a complete actionable audit report
                failures.append({"number": row["number"], "error": str(error), "source_text": row["source_text"]})
        payload = {key: source[key] for key in ["paper_code", "exam_date", "attempt", "shift", "source_pdf"]}
        payload["questions"] = questions
        (OUTPUT / source_path.name).write_text(json.dumps(payload, indent=2, ensure_ascii=False))
        report.append({"paper_code": source["paper_code"], "count": len(questions), "failures": failures})
    (OUTPUT / "build-report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps([{"paper_code": r["paper_code"], "count": r["count"], "failures": len(r["failures"])} for r in report], indent=2))


if __name__ == "__main__":
    main()
