import fitz
import re
import json

doc = fitz.open("tmp/jee-main-2026-jan/pdfs/answer_key.pdf")

shifts_data = {}

for p_idx in range(10):
    page = doc[p_idx]
    text = page.get_text("text")
    
    date_match = re.search(r"Exam Date\s*:\s*([\d\.]+)", text)
    shift_match = re.search(r"Exam Shift\s*:\s*(\w+)", text)
    date_str = date_match.group(1) if date_match else f"Day_{p_idx+1}"
    shift_str = "Shift 1" if "First" in (shift_match.group(1) if shift_match else "") else "Shift 2"
    
    # Map to standard paper code
    day_map = {
        "22.01.2025": ("JEE-MAIN-25-22JAN", "22 Jan"),
        "23.01.2025": ("JEE-MAIN-25-23JAN", "23 Jan"),
        "24.01.2025": ("JEE-MAIN-25-24JAN", "24 Jan"),
        "28.01.2025": ("JEE-MAIN-25-28JAN", "28 Jan"),
        "29.01.2025": ("JEE-MAIN-25-29JAN", "29 Jan"),
    }
    base_code, attempt_label = day_map.get(date_str, ("JEE-MAIN-25-UNKNOWN", date_str))
    shift_suffix = "S1" if shift_str == "Shift 1" else "S2"
    paper_code = f"{base_code}-{shift_suffix}"
    
    # Extract all question ID -> correct option ID pairs
    # Pattern: \d+ \d+ or \d+\n\d+
    tokens = re.findall(r"\b(\d{7,12})\b", text)
    
    # Filter tokens: Question ID usually 8-10 digits, Correct Option ID usually 8-10 digits
    q_pairs = {}
    i = 0
    # Find start of table (after 'Mathematics')
    math_idx = text.find("( Mathematics")
    if math_idx != -1:
        table_text = text[math_idx:]
        pairs = re.findall(r"(\d{7,11})\s+(\d{7,11}|[A-Za-z0-9\-]+)", table_text)
        for qid, ans in pairs:
            q_pairs[qid] = ans
            
    shifts_data[paper_code] = {
        "page": p_idx + 1,
        "date": date_str,
        "shift": shift_str,
        "paper_code": paper_code,
        "attempt": attempt_label,
        "keys": q_pairs
    }
    print(f"Page {p_idx+1}: {paper_code} -> {len(q_pairs)} answers parsed. First QID: {list(q_pairs.keys())[:2]}")

with open("tmp/jee-main-2026-jan/parsed_answer_key.json", "w") as f:
    json.dump(shifts_data, f, indent=2)

# Now identify which paper_X.pdf belongs to which paper_code
print("\n--- Matching PDFs to Paper Codes ---")
pdf_mapping = {}
for i in range(1, 11):
    pdf_path = f"tmp/jee-main-2026-jan/pdfs/paper_{i}.pdf"
    p_doc = fitz.open(pdf_path)
    all_text = ""
    for page_num in range(min(5, len(p_doc))):
        all_text += p_doc[page_num].get_text("text") + "\n"
    
    pdf_qids = re.findall(r"Question ID\s*:\s*(\d+)", all_text)
    
    matched_code = None
    best_overlap = 0
    for code, s_data in shifts_data.items():
        overlap = len(set(pdf_qids).intersection(set(s_data["keys"].keys())))
        if overlap > best_overlap:
            best_overlap = overlap
            matched_code = code
            
    pdf_mapping[f"paper_{i}"] = {
        "file": f"paper_{i}.pdf",
        "paper_code": matched_code,
        "overlap_count": best_overlap,
        "total_pages": len(p_doc)
    }
    print(f"paper_{i}.pdf -> {matched_code} (matched {best_overlap} QIDs, {len(p_doc)} pages)")

with open("tmp/jee-main-2026-jan/pdf_mapping.json", "w") as f:
    json.dump(pdf_mapping, f, indent=2)
