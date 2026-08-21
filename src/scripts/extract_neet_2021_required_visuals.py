from __future__ import annotations
import json,sys
from pathlib import Path
import pdfplumber

def key(page,top):return page*10000+top
def artifact(i):return (330<=i['width']<=350 and 330<=i['height']<=350) or (80<=i['width']<=100 and 20<=i['height']<=40)

def main():
 src,out=Path(sys.argv[1]),Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
 positions={};answers=[];images=[]
 with pdfplumber.open(src) as pdf:
  expected=1
  for pi,page in enumerate(pdf.pages):
   words=page.extract_words(use_text_flow=True)
   for w in words:
    if expected<=200 and w['text']==f"{expected}.":positions[expected]=key(pi,w['top']);expected+=1
    if w['text'].lower()=="answer:":answers.append(key(pi,w['top']))
   for im in page.images:
    z={"page":pi,"top":im['top'],"x0":im['x0'],"x1":im['x1'],"bottom":im['bottom'],"width":im['width'],"height":im['height']}
    if im['width']>=18 and im['height']>=18 and not artifact(im):images.append(z)
  if expected!=201:raise ValueError(f"Found only {expected-1} question positions")
  if len(answers)!=200:raise ValueError(f"Found {len(answers)} answers")
  result=[]
  for n in range(1,201):
   end=next(a for a in answers if a>positions[n]);selected=[i for i in images if positions[n]<key(i['page'],i['top'])<end];files=[]
   for j,im in enumerate(selected,1):
    page=pdf.pages[im['page']];pad=3;crop=page.crop((max(0,im['x0']-pad),max(0,im['top']-pad),min(page.width,im['x1']+pad),min(page.height,im['bottom']+pad)))
    dest=out/f"neet-2021-q{n:03d}-visual-{j}.png";crop.to_image(resolution=220).save(dest,format="PNG")
    files.append({**im,"file":str(dest.resolve())})
   result.append({"number":n,"visuals":files})
 (out/'visual-manifest.json').write_text(json.dumps(result,indent=2));counts={r['number']:len(r['visuals']) for r in result if r['visuals']};print(json.dumps({"questions":len(counts),"visuals":sum(counts.values()),"counts":counts}))
if __name__=="__main__":main()
