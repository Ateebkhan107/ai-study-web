from __future__ import annotations
import json,re,sys
from pathlib import Path
from pypdf import PdfReader

Q=re.compile(r"(?m)^\s*(\d{1,3})\.\s+")
O=re.compile(r"(?m)(?:^|\s)\(([1-4])\)\s*")
def compact(s):return re.sub(r"\s+"," ",s).strip()
def subject(n):return "Chemistry" if n<=45 else "Biology" if n<=135 else "Physics"
def main():
 src,out=Path(sys.argv[1]),Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
 text="\n".join((p.extract_text() or "") for p in PdfReader(src).pages)
 marker="NEET (UG)-2020 (Code-E4)\n2\n1."
 boundary=text.find(marker)
 if boundary<0:raise ValueError("Could not locate the first actual E4 question page")
 text=text[boundary+len("NEET (UG)-2020 (Code-E4)\n2\n"):]
 starts=[];cursor=0
 for wanted in range(1,181):
  found=None
  for m in Q.finditer(text,cursor):
   if int(m.group(1))!=wanted:continue
   tail=text[m.end():m.end()+15000];a=re.search(r"(?im)^\s*Answer\s*\(([1-4])\)",tail);opts=list(O.finditer(tail[:a.start() if a else 0]))
   if a and [x.group(1) for x in opts[:4]]==list("1234"):found=m;break
  if not found:raise ValueError(f"Question {wanted} not found")
  starts.append(found);cursor=found.end()+a.end()
 rows=[]
 for i,m in enumerate(starts):
  n=i+1;end=starts[i+1].start() if i+1<len(starts) else len(text);b=text[m.end():end];a=re.search(r"(?im)^\s*Answer\s*\(([1-4])\)",b)
  before=b[:a.start()];oms=list(O.finditer(before));
  if len(oms)<4:raise ValueError(f"Q{n}: {len(oms)} options")
  oms=oms[:4];q=compact(before[:oms[0].start()]);opts=[]
  for j,x in enumerate(oms):opts.append(compact(before[x.end():oms[j+1].start() if j<3 else len(before)]) or "Diagram shown.")
  sol=re.search(r"(?im)^\s*Sol\.\s*",b[a.end():]);ex=compact(b[a.end()+sol.end():]) if sol else ""
  s=subject(n);rows.append(dict(number=n,exam="NEET",exam_type="NEET UG",year=2020,attempt="NEET UG 2020",shift="Single Shift",paper_code="NEET 2020 Set E4",subject=s,chapter=f"NEET 2020 {s}",question_type="MCQ",question=f"Question {n}: {q}",option_a=opts[0],option_b=opts[1],option_c=opts[2],option_d=opts[3],correct_option="abcd"[int(a.group(1))-1],explanation=ex,marks_positive=4,marks_negative=-1))
 out.write_text(json.dumps(rows,ensure_ascii=False,indent=2));print(json.dumps({"count":len(rows),"subjects":{s:sum(q['subject']==s for q in rows) for s in ['Physics','Chemistry','Biology']},"answers":{a:sum(q['correct_option']==a for q in rows) for a in 'abcd'}}))
if __name__=="__main__":main()
