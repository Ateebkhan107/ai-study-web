import os
import re
import json
import pymupdf

PAPERS = [
    ("scratch/jee_2013_07_apr.pdf", "JEE-MAIN-13-07APR", "07 Apr", "Offline"),
    ("scratch/jee_2013_09_apr.pdf", "JEE-MAIN-13-09APR", "09 Apr", "Online"),
    ("scratch/jee_2013_22_apr.pdf", "JEE-MAIN-13-22APR", "22 Apr", "Online"),
    ("scratch/jee_2013_23_apr.pdf", "JEE-MAIN-13-23APR", "23 Apr", "Online"),
    ("scratch/jee_2013_25_apr.pdf", "JEE-MAIN-13-25APR", "25 Apr", "Online"),
]

with open("scratch/answer_keys_2013.json", "r") as f:
    ANSWER_KEYS = json.load(f)

# Load existing clean dataset for diagram paths
with open("scratch/complete_clean_jee_2013.json", "r") as f:
    EXISTING_DATASET = json.load(f)

DIAGRAM_MAP = {
    f"{item['paper_code']}_{item['qnum']}": {
        "has_diagram": item.get("has_diagram", False),
        "local_diagram_path": item.get("local_diagram_path"),
        "public_diagram_url": item.get("public_diagram_url")
    }
    for item in EXISTING_DATASET
}

def extract_page_lines_from_chars(page):
    raw = page.get_text("rawdict")
    chars = []
    for b in raw.get("blocks", []):
        if "lines" in b:
            for l in b["lines"]:
                for s in l["spans"]:
                    font = s.get("font", "")
                    size = s.get("size", 10.0)
                    flags = s.get("flags", 0)
                    for c in s.get("chars", []):
                        ch = c["c"]
                        bb = c["bbox"]
                        chars.append({
                            "c": ch,
                            "font": font,
                            "size": size,
                            "flags": flags,
                            "bbox": bb,
                            "x0": bb[0],
                            "x1": bb[2],
                            "y0": bb[1],
                            "y1": bb[3],
                            "y_mid": (bb[1] + bb[3]) / 2
                        })
                        
    lines = []
    for c in sorted(chars, key=lambda x: (x["y_mid"], x["x0"])):
        placed = False
        for l in lines:
            if abs(c["y_mid"] - l["y"]) < 3.8:
                l["chars"].append(c)
                l["y"] = (l["y"] * (len(l["chars"]) - 1) + c["y_mid"]) / len(l["chars"])
                placed = True
                break
        if not placed:
            lines.append({"y": c["y_mid"], "chars": [c]})

    lines.sort(key=lambda l: l["y"])
    
    formatted_lines = []
    for l in lines:
        l["chars"].sort(key=lambda c: c["x0"])
        line_str = ""
        prev_x1 = None
        for c in l["chars"]:
            if prev_x1 is not None and c["x0"] - prev_x1 > 2.8 and not line_str.endswith(" ") and c["c"] != " ":
                line_str += " "
            
            is_sup = bool(c["flags"] & 1) or (c["size"] < 9.0 and c["y0"] < l["y"] - 1.5)
            is_sub = (c["size"] < 9.0 and c["y1"] > l["y"] + 2.5)
            
            t = c["c"]
            if is_sup and t.strip():
                t = f"^{{{t}}}"
            elif is_sub and t.strip():
                t = f"_{{{t}}}"
                
            line_str += t
            prev_x1 = c["x1"]
        
        s = line_str.replace("\xa0", " ").replace("\u200b", "").strip()
        if s:
            formatted_lines.append(s)
            
    return formatted_lines

def clean_watermarks(s):
    if not s:
        return ""
    s = re.sub(r'(?i)\^\{J[oO]\}.*', '', s)
    s = re.sub(r'(?i)Join the Most Relevant.*', '', s)
    s = re.sub(r'(?i)JEE Main Previous.*', '', s)
    s = re.sub(r'(?i)Question Paper\s*MathonGo.*', '', s)
    s = re.sub(r'(?i)https?://[^\s]+', '', s)
    s = re.sub(r'(?i)J\s*EE\s*Main\s*2013\s*\([^)]*\)', '', s)
    return s.strip()

def format_latex(text, is_option=False):
    if not text:
        return ""
    s = clean_watermarks(text)
    s = s.replace("−", "-")
    s = s.replace("∈", r"\in ")
    s = s.replace("×", r" \times ")
    s = s.replace("^{ˆ}i", r"\hat{\imath}")
    s = s.replace("^{ˆ}j", r"\hat{\jmath}")
    s = s.replace("^{ˆ}k", r"\hat{k}")
    s = s.replace("ˆi", r"\hat{\imath}")
    s = s.replace("ˆj", r"\hat{\jmath}")
    s = s.replace("ˆk", r"\hat{k}")

    # Fix superscripts / subscripts
    s = re.sub(r'\^\{\s*\}', '', s)
    s = re.sub(r'_\{\s*\}', '', s)
    s = re.sub(r'\^\{([^}]+)\}\^\{([^}]*)\}', r'^{\1\2}', s)
    s = re.sub(r'_\{\s*([0-9a-zA-Z]+)\s*\}', r'_{\1}', s)
    s = re.sub(r'\^\{\s*([0-9a-zA-Z\+\-]+)\s*\}', r'^{\1}', s)

    # Specific physics and chemistry symbols
    s = re.sub(r'\[\s*\\?in\s*0\s*\]', r'$[\\varepsilon_0]$', s)
    s = re.sub(r'\[\s*\\?in\s*_\{0\}\s*\]', r'$[\\varepsilon_0]$', s)
    s = re.sub(r'\[\s*∈\s*_?0\s*\]', r'$[\\varepsilon_0]$', s)
    s = re.sub(r'\[\s*∈\s*\^?0\s*\]', r'$[\\varepsilon_0]$', s)
    s = re.sub(r'\b\\?in\s*0\b', r'\\varepsilon_0', s)
    s = re.sub(r'\b\\?in_\{0\}', r'\\varepsilon_0', s)

    # Greek letters
    for greek in [r'\omega', r'\theta', r'\sigma', r'\delta', r'\lambda', r'\mu', r'\alpha', r'\beta', r'\gamma', r'\Omega']:
        bare = greek.lstrip('\\')
        s = re.sub(rf'(?<!\$|\\)\b{bare}\b(?!\$)', lambda m, g=greek: f"${g}$", s)
        s = re.sub(rf'(?<!\$)\\{bare}\b(?!\$)', lambda m, g=greek: f"${g}$", s)

    # Square roots
    s = re.sub(r'√\s*([0-9]+)', lambda m: f"$\\sqrt{{{m.group(1)}}}$", s)
    s = re.sub(r'√\s*([a-zA-Z]+)', lambda m: f"$\\sqrt{{{m.group(1)}}}$", s)

    # Interval brackets [0, 1]
    s = re.sub(r'\[\s*(-?[0-9]+)\s*,\s*(-?[0-9]+)\s*\]', lambda m: f"$[{m.group(1)}, {m.group(2)}]$", s)

    # Fix between X and Y
    s = re.sub(r'between\s*(-?[0-9]+)\s*and\s*\.?\s*(-?[0-9]+)', lambda m: f"between ${m.group(1)}$ and ${m.group(2)}$", s)

    # Wrap standalone variables like "k for which" -> "$k$ for which"
    s = re.sub(r'(?<=\s)([a-zA-Z])(?=\s+(?:for which|where|is|such|when|denote|belongs|and|in)\b)', lambda m: f"${m.group(1)}$", s)

    # Units with superscripts: m s^{-1}, m s^{-2}
    s = re.sub(r'(?<!\$)\b([a-zA-Z0-9\(\)\+\-\\\s]+)?\s*m\s*s\^\{(-?[0-9]+)\}', lambda m: f"${m.group(1).strip() if m.group(1) else ''}\\text{{ m s}}^{{{m.group(2)}}}$", s)

    # Polynomials and equations:
    # 2x^{3} + 3x + k = 0 -> $2x^3 + 3x + k = 0$
    s = re.sub(r'(?<!\$)\b([0-9]*[a-zA-Z]?[\^_]\{[0-9a-zA-Z\+\-]+\}(?:\s*[\+\-\=\*\/]\s*[0-9a-zA-Z\^_\{\}]+)*\s*=\s*[0-9a-zA-Z\^_\{\}\+\-\*\/]+)(?!\$)', lambda m: f"${m.group(1)}$", s)
    
    # Mathematical ratios like 1 : 2 : 3
    s = re.sub(r'(?<!\$)\b([0-9a-zA-Z]\s*:\s*[0-9a-zA-Z]\s*:\s*[0-9a-zA-Z])(?!\$)', lambda m: f"${m.group(1)}$", s)

    # Variables with powers like ax^{2}
    s = re.sub(r'(?<!\$)\b([a-zA-Z][\^_]\{[0-9a-zA-Z\+\-]+\})(?!\$)', lambda m: f"${m.group(1)}$", s)

    # a, b, c \in R
    s = re.sub(r'(?<!\$)\b([a-zA-Z],\s*[a-zA-Z],\s*[a-zA-Z]\s*\\in\s*R)(?!\$)', lambda m: r"$a, b, c \in \mathbb{R}$", s)

    # Dimensional formulas in options: [M^{-1} L^{2} T^{-1} A^{-2}]
    if is_option:
        if s.startswith("[") and ("M" in s or "T" in s or "L" in s or "A" in s) and not s.startswith("$"):
            s = f"${s}$"
        elif re.search(r'[0-9]y\s*=\s*[0-9x\^\-]+', s) and not s.startswith("$"):
            s = f"${s}$"
        elif re.match(r'^[0-9\s\:\.]+$', s) and not s.startswith("$"):
            s = f"${s}$"
        elif re.match(r'^[0-9]+(?:\.[0-9]+)?\s*(?:m|cm|mm|V|Hz|W|J|eV|kJ|s|K|N|kg|g|A|Ω|Wb|T|pF|μF|F|mol|atoms|molecules|min|hours)$', s) and not s.startswith("$"):
            s = f"${s}$"
        elif s.startswith("$\\sqrt") and not s.endswith("$"):
            s = f"{s}$"

    # Normalize double dollars
    s = re.sub(r'\$\$+', '$', s)
    # Strip inner whitespace from $...$
    s = re.sub(r'\$\s*([^\$]+?)\s*\$', lambda m: f"${m.group(1).strip()}$", s)
    s = re.sub(r'[ \t]+', ' ', s)
    return s.strip()

def extract_questions_from_pdf(pdf_path, paper_code, attempt, shift):
    doc = pymupdf.open(pdf_path)
    all_lines = []
    for page in doc:
        page_lines = extract_page_lines_from_chars(page)
        all_lines.extend(page_lines)
        
    full_text = "\n".join(all_lines)
    full_text = clean_watermarks(full_text)
    
    # Normalize question anchors
    full_text = re.sub(r'(?m)^[^\w\s]*Q([0-9]+)\.\s*', r'\nQ\1. ', full_text)
    
    q_blocks = re.split(r'\n(?=Q[0-9]+\.\s*)', full_text)
    
    questions = []
    seen_qnums = set()
    
    for block in q_blocks:
        m = re.match(r'^\s*Q([0-9]+)\.\s*(.*)', block, re.DOTALL)
        if not m:
            continue
        qnum = int(m.group(1))
        if qnum in seen_qnums or qnum < 1 or qnum > 90:
            continue
        seen_qnums.add(qnum)
        
        content = m.group(2).strip()
        
        # Extract statement and options
        first_opt_idx = re.search(r'(?:\n|\s+)\(1\)', content)
        if first_opt_idx:
            q_raw = content[:first_opt_idx.start()].strip()
            opts_raw = content[first_opt_idx.start():].strip()
        else:
            q_raw = content
            opts_raw = ""
            
        opt_matches = re.findall(r'\(([1-4])\)\s*([\s\S]*?)(?=(?:\([1-4]\)|$))', opts_raw)
        opts = {"a": "", "b": "", "c": "", "d": ""}
        for num_str, val in opt_matches:
            num = int(num_str)
            key = ["a", "b", "c", "d"][num - 1]
            val = re.sub(r'\nQ[0-9]+\..*', '', val, flags=re.DOTALL).strip()
            val = clean_watermarks(val)
            opts[key] = format_latex(val, is_option=True)
            
        # Subject assignment
        if 1 <= qnum <= 30:
            subject = "Physics"
        elif 31 <= qnum <= 60:
            subject = "Chemistry"
        else:
            subject = "Mathematics"
            
        diag_info = DIAGRAM_MAP.get(f"{paper_code}_{qnum}", {})
        ans_num = ANSWER_KEYS.get(paper_code, {}).get(str(qnum), 1)
        correct_option = ["a", "b", "c", "d"][ans_num - 1] if 1 <= ans_num <= 4 else "a"
        
        q_formatted = format_latex(q_raw, is_option=False)
        
        questions.append({
            "qnum": qnum,
            "paper_code": paper_code,
            "attempt": attempt,
            "shift": shift,
            "subject": subject,
            "question_text": q_formatted,
            "option_a": opts["a"] or "Option A",
            "option_b": opts["b"] or "Option B",
            "option_c": opts["c"] or "Option C",
            "option_d": opts["d"] or "Option D",
            "correct_option": correct_option,
            "ans_num": ans_num,
            "has_diagram": diag_info.get("has_diagram", False),
            "local_diagram_path": diag_info.get("local_diagram_path"),
            "public_diagram_url": diag_info.get("public_diagram_url"),
        })
        
    questions.sort(key=lambda x: x["qnum"])
    return questions

def run():
    all_dataset = []
    for pdf_path, paper_code, attempt, shift in PAPERS:
        print(f"Extracting {paper_code} ({attempt} {shift})...")
        qs = extract_questions_from_pdf(pdf_path, paper_code, attempt, shift)
        print(f"  Extracted {len(qs)} questions.")
        all_dataset.extend(qs)
        
    print(f"\nTotal extracted: {len(all_dataset)} questions.")
    with open("scratch/complete_clean_jee_2013.json", "w") as f:
        json.dump(all_dataset, f, indent=2)
    print("Saved to scratch/complete_clean_jee_2013.json")

if __name__ == "__main__":
    run()
