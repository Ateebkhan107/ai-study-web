from __future__ import annotations
import json,re,sys
from pathlib import Path
import pdfplumber
Q=re.compile(r"(?m)^\s*(\d{1,3})\.\s*")
O=re.compile(r"\(([1-4])\)\s*")
A=re.compile(r"(?im)^\s*Solution:\s*\(([^)]+)\)")
def compact(s):return re.sub(r"\s+"," ",s).strip()
def subject(n):return "Physics" if n<=45 else "Chemistry" if n<=90 else "Biology"
def main():
 source,out=Path(sys.argv[1]),Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
 with pdfplumber.open(source) as pdf:text="\n".join(p.extract_text(x_tolerance=2,y_tolerance=3) or "" for p in pdf.pages)
 matches=[m for m in Q.finditer(text) if 1<=int(m.group(1))<=180];chosen=[];cursor=0
 for n in range(1,181):
  m=next((x for x in matches if x.start()>=cursor and int(x.group(1))==n),None)
  if not m:raise ValueError(f"missing Q{n}")
  chosen.append(m);cursor=m.end()
 rows=[]
 for i,m in enumerate(chosen):
  n=i+1;end=chosen[i+1].start() if i<179 else len(text);block=text[m.end():end];ans=A.search(block)
  if not ans:raise ValueError(f"Q{n} missing solution key")
  before=block[:ans.start()];marks=list(O.finditer(before));selected=None
  for j in range(len(marks)-3):
   if [x.group(1) for x in marks[j:j+4]]==list("1234"):selected=marks[j:j+4];break
  if not selected:raise ValueError(f"Q{n} malformed {[x.group(1) for x in marks]}")
  question=compact(before[:selected[0].start()]);opts=[]
  for j,x in enumerate(selected):opts.append(compact(before[x.end():selected[j+1].start() if j<3 else len(before)]) or "Diagram shown.")
  nums=re.findall(r"[1-4]",ans.group(1));accepted=["abcd"[int(x)-1] for x in nums] if nums else []
  if not accepted: accepted=["a"] if "bonus" in ans.group(1).lower() else []
  if not accepted:raise ValueError(f"Q{n} unparsed key {ans.group(1)}")
  explanation=compact(block[ans.end():]);s=subject(n);rows.append(dict(number=n,exam="NEET",exam_type="NEET UG",year=2016,attempt="NEET UG 2016 Phase I",shift="Phase I",paper_code="NEET 2016 Phase I Code A-P-W",subject=s,chapter=f"NEET 2016 {s}",question_type="MCQ",question=question,option_a=opts[0],option_b=opts[1],option_c=opts[2],option_d=opts[3],correct_option=accepted[0],accepted_options=accepted,bonus="bonus" in ans.group(1).lower(),explanation=explanation,marks_positive=4,marks_negative=-1))
 out.write_text(json.dumps(rows,ensure_ascii=False,indent=2));print({"count":len(rows),"subjects":{s:sum(x["subject"]==s for x in rows) for s in ["Physics","Chemistry","Biology"]},"bonus":[x["number"] for x in rows if x["bonus"]]})
if __name__=="__main__":main()
