from __future__ import annotations
import json,re,sys
from pathlib import Path
import pdfplumber

QUESTION=re.compile(r"(?m)^[ \t]*(\d{1,3})\.[ \t]+")
OPTION=re.compile(r"\(([1-4])\)\s*")
ANSWER=re.compile(r"(?im)^\s*Answer\s*\(\s*([1-4])\s*\*?\s*\)")
def compact(v:str)->str:return re.sub(r"\s+"," ",v).strip()
def subject(n:int)->str:return "Physics" if n<=45 else "Chemistry" if n<=90 else "Biology"

def main()->None:
 source,out=Path(sys.argv[1]),Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
 with pdfplumber.open(source) as pdf:
  streams=[]
  for page in pdf.pages[1:]:
   middle=page.width/2
   streams.append(page.crop((0,0,middle,page.height)).extract_text(x_tolerance=2,y_tolerance=3) or "")
   streams.append(page.crop((middle,0,page.width,page.height)).extract_text(x_tolerance=2,y_tolerance=3) or "")
 text="\n".join(streams)
 matches=[m for m in QUESTION.finditer(text) if 1<=int(m.group(1))<=180]
 chosen=[];cursor=0
 for wanted in range(1,181):
  found=next((m for m in matches if m.start()>=cursor and int(m.group(1))==wanted),None)
  if not found:raise ValueError(f"Missing Q{wanted}")
  chosen.append(found);cursor=found.end()
 rows=[]
 for i,start in enumerate(chosen):
  number=i+1;end=chosen[i+1].start() if i<179 else len(text);block=text[start.end():end]
  answer=ANSWER.search(block)
  if not answer:raise ValueError(f"Q{number}: missing answer")
  before=block[:answer.start()];markers=list(OPTION.finditer(before));selected=None
  for offset in range(len(markers)-3):
   if [x.group(1) for x in markers[offset:offset+4]]==list("1234"):selected=markers[offset:offset+4];break
  if not selected:raise ValueError(f"Q{number}: malformed options {[x.group(1) for x in markers]}")
  question=compact(before[:selected[0].start()]);options=[]
  for j,marker in enumerate(selected):
   stop=selected[j+1].start() if j<3 else len(before);options.append(compact(before[marker.end():stop]) or "Diagram shown.")
  s=subject(number);key="abcd"[int(answer.group(1))-1]
  # The Code-AA key marks Q65 with an asterisk; both options 2 and 3 are accepted.
  accepted=["b","c"] if number==65 else [key]
  explanation=compact(block[answer.end():]);rows.append(dict(number=number,exam="NEET",exam_type="NEET UG",year=2018,attempt="NEET UG 2018",shift="Single Shift",paper_code="NEET 2018 Code AA",subject=s,chapter=f"NEET 2018 {s}",question_type="MCQ",question=question,option_a=options[0],option_b=options[1],option_c=options[2],option_d=options[3],correct_option=accepted[0],accepted_options=accepted,explanation=explanation,marks_positive=4,marks_negative=-1))
 out.write_text(json.dumps(rows,ensure_ascii=False,indent=2));print(json.dumps({"count":len(rows),"subjects":{s:sum(x["subject"]==s for x in rows) for s in ["Physics","Chemistry","Biology"]},"answers":{a:sum(x["correct_option"]==a for x in rows) for a in "abcd"}},indent=2))
if __name__=="__main__":main()
