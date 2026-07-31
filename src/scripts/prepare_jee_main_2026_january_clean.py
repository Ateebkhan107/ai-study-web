import json,re,subprocess
from pathlib import Path
import pdfplumber
from PIL import Image
R=Path.cwd();O=R/'tmp'/'jee-main-2026-january-clean';P='/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm';K=Path('/Users/ateebfatmi/Downloads/JEEM26_JanExam_Paper1_AnswerKeys.pdf');S=[(21,1),(21,2),(22,1),(22,2),(23,1),(23,2),(24,1),(24,2),(28,1),(28,2)]
def sub(n):return 'Maths' if n<=25 else 'Physics' if n<=50 else 'Chemistry'
with pdfplumber.open(K) as d:key='\n'.join(p.extract_text() or '' for p in d.pages)
for day,shift in S:
 src=Path(f'/Users/ateebfatmi/Downloads/JEEM26_Jan{day}_Shift{shift}.pdf');code=f'JEE-MAIN-26-{day:02}JAN-S{shift}';out=O/code;pg=out/'pages';cr=out/'crops';pg.mkdir(parents=True,exist_ok=True);cr.mkdir(exist_ok=True)
 if not list(pg.glob('*.png')):subprocess.run([P,'-png','-r','180',str(src),str(pg/'page')],check=True)
 with pdfplumber.open(src) as doc:
  texts=[p.extract_text() or '' for p in doc.pages];words=[p.extract_words() for p in doc.pages];a=[]
  for pi,ws in enumerate(words,1):
   for w in ws:
    m=re.fullmatch(r'Q\.?([1-9]|[1-6][0-9]|7[0-5])\.?',w['text'])
    if m:a.append((int(m.group(1)),pi,w['top']))
  a.sort()
  if [x[0] for x in a]!=list(range(1,76)):raise RuntimeError(f'{code}: invalid anchors')
  ims={int(p.stem.split('-')[-1]):Image.open(p).convert('RGB') for p in pg.glob('*.png')};full='\n'.join(texts);rows=[]
  for i,(n,pi,t) in enumerate(a):
   nx=a[i+1] if i<74 else None;im=ims[pi];sc=im.height/doc.pages[pi-1].height;top=max(0,int((t-8)*sc));bot=int((nx[2]-6)*sc) if nx and nx[1]==pi else im.height;ws=words[pi-1]
   meta=next((w for w in ws if w['top']>t and w['text']=='Question' and any(c['text']=='Type' and abs(c['top']-w['top'])<5 and c['x0']>w['x0'] for c in ws)),None);crop=im.crop((0,top,im.width,max(top+1,bot)))
   if meta:crop.paste('white',(int(crop.width*.45),max(0,int((meta['top']-28)*sc)-top),crop.width,crop.height))
   watermark=next((w for w in ws if w['top']>t and 'college' in w['text'].lower()),None)
   if watermark: crop.paste('white',(0,max(0,int((watermark['top']-25)*sc)-top),crop.width,crop.height))
   path=cr/f'q{n:02}.png';crop.save(path,optimize=True);start=full.find(f'Q.{n}');end=full.find(f'Q.{n+1}',start+1) if n<75 else len(full);chunk=full[start:end];qid=re.search(r'Question ID\s*:\s*(\d+)',chunk)
   if not qid: raise RuntimeError(f'{code} Q{n}: id')
   qid=qid.group(1);opts=re.findall(r'Option ([1-4]) ID\s*:\s*(\d+)',chunk);ans=re.search(rf'\b{qid}\s*(\d+|DROP(?:PED)?)\b',key,re.I)
   if not ans: raise RuntimeError(f'{code} Q{n}: key')
   ans=ans.group(1).upper();ans='DROP' if ans.startswith('DROP') else ans;choice=next((x for x,y in opts if y==ans),None);rows.append({'number':n,'subject':sub(n),'question_type':'MCQ' if opts else 'NUMERICAL','image_path':str(path),'answer':choice or ans})
 (out/'manifest.json').write_text(json.dumps(rows,indent=2));print(code)
