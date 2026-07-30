import json,re,subprocess
from pathlib import Path
from PIL import Image
import pdfplumber
R=Path.cwd(); O=R/'tmp'/'jee-main-2024-april-clean'; P='/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'; K=Path('/Users/ateebfatmi/Downloads/JEE Main 2024 April Session Answer Keys.pdf')
S=[(4,1),(4,2),(5,1),(5,2),(6,1),(6,2),(8,1),(8,2),(9,1),(9,2)]
key='\n'.join(p.extract_text() or '' for p in pdfplumber.open(K).pages)
def sub(n):return 'Maths' if n<=30 else 'Physics' if n<=60 else 'Chemistry'
for d,s in S:
 src=Path(f'/Users/ateebfatmi/Downloads/April {d} Shift {s}.pdf'); code=f'JEE-MAIN-24-{d:02}APR-S{s}'; out=O/code; pg=out/'pages'; cr=out/'crops';pg.mkdir(parents=True,exist_ok=True);cr.mkdir(exist_ok=True)
 if not list(pg.glob('*.png')):subprocess.run([P,'-png','-r','180',str(src),str(pg/'page')],check=True)
 with pdfplumber.open(src) as doc:
  texts=[x.extract_text() or '' for x in doc.pages]; words=[x.extract_words() for x in doc.pages]; a=[]
  for pi,x in enumerate(doc.pages,1):
   for w in x.extract_words():
    m=re.fullmatch(r'Q\.?([1-9]|[1-8][0-9]|90)\.?',w['text']);
    if m:a.append((int(m.group(1)),pi,w['top']))
  a.sort();assert [x[0] for x in a]==list(range(1,91))
  ims={int(x.stem.split('-')[-1]):Image.open(x).convert('RGB') for x in pg.glob('*.png')}; rows=[]
  for i,(n,pi,t) in enumerate(a):
   nx=a[i+1] if i<89 else None; sc=ims[pi].height/doc.pages[pi-1].height; top=max(0,int((t-8)*sc)); bot=int((nx[2]-6)*sc) if nx and nx[1]==pi else ims[pi].height; im=ims[pi].crop((0,top,ims[pi].width,max(top+1,bot))); meta=next((w for w in words[pi-1] if w['top']>t and w['text']=='Question'),None)
   if meta:
    y=max(0,int((meta['top']-24)*sc)-top); im.paste('white',(int(im.width*.50),y,im.width,min(im.height,y+int(120*sc))))
   path=cr/f'q{n:02}.png';im.save(path,optimize=True)
   full='\n'.join(texts); start=full.find('Q.'+str(n)); end=full.find('Q.'+str(n+1),start+1) if n<90 else len(full); chunk=full[start:end]; qid=re.search(r'Question ID\s*:\s*(\d+)',chunk).group(1); opts=re.findall(r'Option ([1-4]) ID\s*:\s*(\d+)',chunk); ans=re.search(rf'\b{qid}\s+(\d+|DROP)\b',key).group(1); answer=next((x for x,y in opts if y==ans),None)
   rows.append({'number':n,'subject':sub(n),'question_type':'MCQ' if opts else 'NUMERICAL','image_path':str(path),'answer':answer or ans})
 (out/'manifest.json').write_text(json.dumps(rows,indent=2));print(code)
