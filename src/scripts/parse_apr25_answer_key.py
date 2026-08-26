import fitz
import re
import json

doc = fitz.open("tmp/jee-main-2025-apr/pdfs/paper_10.pdf")

shifts_data = {} # shift_name -> { qid: correct_ans }

# 9 shifts in April 2025 Session 2
SHIFT_MAP = {
    (1, 2): "JEE-MAIN-25-02APR-S1",
    (3, 4): "JEE-MAIN-25-02APR-S2",
    (5, 6): "JEE-MAIN-25-03APR-S1",
    (7, 8): "JEE-MAIN-25-03APR-S2",
    (9, 10): "JEE-MAIN-25-04APR-S1",
    (11, 12): "JEE-MAIN-25-04APR-S2",
    (13, 14): "JEE-MAIN-25-07APR-S1",
    (15, 16): "JEE-MAIN-25-07APR-S2",
    (17, 18): "JEE-MAIN-25-08APR-S2",
}

for (p_start, p_end), paper_code in SHIFT_MAP.items():
    shift_answers = {}
    for pno in range(p_start - 1, p_end):
        page = doc[pno]
        txt = page.get_text("text")
        
        # Look for table entries
        # Format in text: Question ID \n Correct Option ID
        # E.g. "603421901 \n 6034213061" or numerical answer "603421921 \n 5"
        lines = [l.strip() for l in txt.split("\n") if l.strip()]
        
        for i in range(len(lines) - 1):
            qid = lines[i]
            ans = lines[i+1]
            if re.match(r"^\d{8,10}$", qid):
                # Valid QID
                if re.match(r"^\d{8,10}$", ans) or re.match(r"^-?\d+(\.\d+)?$", ans) or ans in ["Drop", "Dropped"]:
                    shift_answers[qid] = ans
                    
    shifts_data[paper_code] = shift_answers
    print(f"{paper_code}: Parsed {len(shift_answers)} answers from official key.")

with open("tmp/jee-main-2025-apr/official_answers.json", "w") as f:
    json.dump(shifts_data, f, indent=2)

print("Official answer key parsing complete!")
