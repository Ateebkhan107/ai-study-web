from __future__ import annotations
import json,re,sys
from pathlib import Path
import pdfplumber

QUESTION=re.compile(r"(?m)^\s*(\d{1,3})\.\s*")
OPTION=re.compile(r"\(([1-4A-D])\)\s*")
ANSWER=re.compile(r"(?im)^\s*(?:Solution|Answer Key):\s*\(([^)]+)\)")
ANSWER_OVERRIDES={76:"b",115:"c"}
def compact(value): return re.sub(r"\s+"," ",value).strip()
def subject(number): return "Chemistry" if number<=45 else "Biology" if number<=135 else "Physics"

def main():
 source,out=Path(sys.argv[1]),Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
 with pdfplumber.open(source) as pdf: text="\n".join(page.extract_text(x_tolerance=2,y_tolerance=3) or "" for page in pdf.pages)
 matches=[m for m in QUESTION.finditer(text) if 1<=int(m.group(1))<=180]; chosen=[]; cursor=0
 for number in range(1,181):
  match=next((m for m in matches if m.start()>=cursor and int(m.group(1))==number),None)
  if not match: raise ValueError(f"missing Q{number}")
  chosen.append(match); cursor=match.end()
 rows=[]
 for index,match in enumerate(chosen):
  number=index+1; end=chosen[index+1].start() if index<179 else len(text); block=text[match.end():end]; answer=ANSWER.search(block)
  if not answer and number not in ANSWER_OVERRIDES: raise ValueError(f"Q{number} missing solution key")
  before=block[:answer.start()] if answer else block; option_marks=list(OPTION.finditer(before)); selected=None
  for offset in range(len(option_marks)-3):
   labels=[m.group(1) for m in option_marks[offset:offset+4]]
   if labels==list("1234") or labels==list("ABCD"): selected=option_marks[offset:offset+4]; break
  if not selected: raise ValueError(f"Q{number} malformed options")
  question=compact(before[:selected[0].start()]); options=[]
  for option_index,mark in enumerate(selected): options.append(compact(before[mark.end():selected[option_index+1].start() if option_index<3 else len(before)]) or "Diagram shown.")
  answers=re.findall(r"[1-4]",answer.group(1)) if answer else []; accepted=["abcd"[int(value)-1] for value in answers] if answers else ([ANSWER_OVERRIDES[number]] if number in ANSWER_OVERRIDES else [])
  bonus=bool(answer and "bonus" in answer.group(1).lower())
  if not accepted: accepted=["a"] if bonus else []
  if not accepted: raise ValueError(f"Q{number} bad answer {answer.group(1)}")
  name=subject(number)
  explanation=compact(block[answer.end():]) if answer else ""
  rows.append({"number":number,"exam":"NEET","exam_type":"NEET UG","year":2015,"attempt":"NEET UG 2015 Code A","shift":"Single Shift","paper_code":"NEET 2015 Code A","subject":name,"chapter":f"NEET 2015 {name}","question_type":"MCQ","question":question,"option_a":options[0],"option_b":options[1],"option_c":options[2],"option_d":options[3],"correct_option":accepted[0],"accepted_options":accepted,"bonus":bonus,"explanation":explanation,"marks_positive":4,"marks_negative":-1})
 out.write_text(json.dumps(rows,ensure_ascii=False,indent=2)); print({"count":len(rows),"subjects":{name:sum(row["subject"]==name for row in rows) for name in ["Chemistry","Physics","Biology"]},"bonus":[row["number"] for row in rows if row["bonus"]]})
if __name__=="__main__": main()
