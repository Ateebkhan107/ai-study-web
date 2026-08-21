from __future__ import annotations
import json,re,sys
from pathlib import Path
from pypdf import PdfReader

NUMBER=re.compile(r"(?m)^\s*(\d{1,3})\.\s+")
OPTION=re.compile(r"(?im)^\s*\(([a-d])\)\s*")

def compact(s:str)->str:return re.sub(r"\s+"," ",s).strip()
def subject(n:int)->str:return "Physics" if n<=50 else "Chemistry" if n<=100 else "Biology"

def main():
 src,out=Path(sys.argv[1]),Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
 text="\n".join((p.extract_text() or "") for p in PdfReader(src).pages)
 text=re.sub(r"(?im)^\s*A\s*\n\s*nswer\s*:","Answer:",text)
 text=re.sub(r"(?im)^\s*Op\s*\n\s*tions\s*:","Options:",text)
 starts=[];cursor=0
 for wanted in range(1,201):
  found=None
  for m in NUMBER.finditer(text,cursor):
   if int(m.group(1))!=wanted:continue
   tail=text[m.end():m.end()+12000]
   a=re.search(r"(?im)^\s*Answer\s*:",tail);o=re.search(r"(?im)^\s*Options\s*:",tail)
   if a and o and o.start()<a.start():found=m;break
  if not found:raise ValueError(f"Could not locate question {wanted} after offset {cursor}")
  starts.append(found);cursor=found.end()
 rows=[]
 for i,m in enumerate(starts):
  end=starts[i+1].start() if i+1<len(starts) else len(text);block=text[m.end():end]
  ans=re.search(r"(?im)^\s*Answer\s*:\s*\(?([a-d])\)?",block)
  if not ans:raise ValueError(f"Q{i+1}: answer missing")
  before=block[:ans.start()];ol=re.search(r"(?im)^\s*Options\s*:\s*",before)
  if not ol:raise ValueError(f"Q{i+1}: options missing")
  q=compact(before[:ol.start()]);ot=before[ol.end():];om=list(OPTION.finditer(ot))
  if [x.group(1).lower() for x in om]!=list("abcd"):raise ValueError(f"Q{i+1}: malformed options {[x.group(1) for x in om]}")
  opts={}
  for j,x in enumerate(om):opts[x.group(1).lower()]=compact(ot[x.end():om[j+1].start() if j+1<len(om) else len(ot)]) or "Diagram shown."
  sol=re.search(r"(?im)^\s*Solution\s*:\s*",block[ans.end():]);ex=compact(block[ans.end()+sol.end():]) if sol else ""
  n=i+1;s=subject(n)
  rows.append(dict(number=n,exam="NEET",exam_type="NEET UG",year=2021,attempt="NEET UG 2021",shift="Single Shift",paper_code="NEET 2021 Code 01",subject=s,chapter=f"NEET 2021 {s}",question_type="MCQ",question=f"Question {n}: {q}",option_a=opts['a'],option_b=opts['b'],option_c=opts['c'],option_d=opts['d'],correct_option=ans.group(1).lower(),explanation=ex,marks_positive=4,marks_negative=-1))
 out.write_text(json.dumps(rows,ensure_ascii=False,indent=2));print(json.dumps({"count":len(rows),"answers":{a:sum(q['correct_option']==a for q in rows) for a in 'abcd'}}))
if __name__=="__main__":main()
