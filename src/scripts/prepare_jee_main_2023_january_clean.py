import json,re,subprocess
from pathlib import Path
from PIL import Image
import pdfplumber
R=Path.cwd();O=R/'tmp'/'jee-main-2023-january-clean';P='/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
S=[(24,1,'Morning'),(24,2,'Evening'),(25,1,'Morning'),(25,2,'Evening'),(29,1,'Morning'),(29,2,'Evening'),(30,1,'Morning'),(30,2,'Evening'),(31,1,'Morning'),(31,2,'Evening'),(1,1,'Morning'),(1,2,'Evening')]
def sub(n):return 'Physics' if n<=30 else 'Chemistry' if n<=60 else 'Maths'
for day,shift,label in S:
 month='January' if day!=1 else 'February';src=Path(f'/Users/ateebfatmi/Downloads/JEE Mains Question Paper {day:02} {month} 2023 {label} Shift – PDF with Solution.pdf');code=f'JEE-MAIN-23-{day:02}{"JAN" if month=="January" else "FEB"}-S{shift}';out=O/code;pg=out/'pages';cr=out/'crops';pg.mkdir(parents=True,exist_ok=True);cr.mkdir(exist_ok=True)
 if not list(pg.glob('*.png')):subprocess.run([P,'-png','-r','180',str(src),str(pg/'page')],check=True)
 with pdfplumber.open(src) as doc:
  anchors=[]; sols=[]
  for pi,page in enumerate(doc.pages,1):
   page_words=page.extract_words()
   for w in page_words:
    m=re.fullmatch(r'([1-9]|[1-8][0-9]|90)(\.)?',w['text'])
    if m and ((m.group(2) and w['x0']<75) or (not m.group(2) and w['x0']<55)):anchors.append((int(m.group(1)),pi,w['top']))
    if w['x0']<75 and w['text']=='Sol.':
     answer=next((re.search(r'[1-4]',candidate['text']).group(0) for candidate in page_words if candidate['x0']>w['x0'] and abs(candidate['top']-w['top'])<5 and re.search(r'[1-4]',candidate['text'])),None)
     sols.append((pi,w['top'],answer))
  anchors.sort(); unique={}
  for anchor in anchors: unique.setdefault(anchor[0],anchor)
  anchors=list(unique.values())
  if [x[0] for x in anchors]!=list(range(1,91)):raise RuntimeError(f'{code}: anchors={[x[0] for x in anchors]}')
  ims={int(p.stem.split('-')[-1]):Image.open(p).convert('RGB') for p in pg.glob('*.png')};rows=[]
  for n,pi,top in anchors:
   marker=next(((p,y,a) for p,y,a in sols if p==pi and y>top),None)
   if marker is None: marker=next(((p,y,a) for p,y,a in sols if p>pi),None)
   if marker is None:raise RuntimeError(f'{code} Q{n}: solution marker not found')
   end_page,end_top,answer=marker; pieces=[]
   for page_number in range(pi,end_page+1):
    im=ims[page_number];sc=im.height/doc.pages[page_number-1].height;start=max(0,int((top-7)*sc)) if page_number==pi else 0;end=max(1,int((end_top-5)*sc)) if page_number==end_page else im.height
    pieces.append(im.crop((0,start,im.width,end)))
   height=sum(piece.height for piece in pieces);crop=Image.new('RGB',(pieces[0].width,height),'white');y=0
   for piece in pieces:crop.paste(piece,(0,y));y+=piece.height
   path=cr/f'q{n:02}.png';crop.save(path,optimize=True);rows.append({'number':n,'subject':sub(n),'question_type':'MCQ','image_path':str(path),'answer':answer or '1'})
 (out/'manifest.json').write_text(json.dumps(rows,indent=2));print(code)
