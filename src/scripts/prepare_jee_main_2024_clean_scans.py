"""Create page-aware, watermark-free question images from the supplied clean scans."""
import json, re, subprocess
from pathlib import Path
from PIL import Image
import pdfplumber

ROOT=Path.cwd(); OUT=ROOT/'tmp'/'jee-main-2024-clean'; POPPLER='/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
PAPERS=[('27JAN',1,'Jan27 Shift 1 3.18.53\u202fAM.pdf'),('27JAN',2,'Jan27 Shift 2 3.18.53\u202fAM.pdf'),('29JAN',1,'Jan29 Shift 1 3.18.53\u202fAM.pdf'),('29JAN',2,'Jan29 Shift 2 3.18.53\u202fAM.pdf'),('30JAN',1,'Jan30 Shift 1.pdf'),('30JAN',2,'Jan30 Shift 2.pdf'),('31JAN',1,'Jan31 Shift 1.pdf'),('31JAN',2,'Jan31 Shift 2.pdf'),('01FEB',1,'Feb1 Shift 1.pdf'),('01FEB',2,'Feb1 Shift 2.pdf')]

def subject(n): return 'Maths' if n<=30 else 'Physics' if n<=60 else 'Chemistry'
def qtype(n): return 'MCQ' if (n-1)%30<20 else 'NUMERICAL'

for day,shift,name in PAPERS:
    pdf=Path('/Users/ateebfatmi/Downloads')/name; key=f'JEE-MAIN-24-{day}-S{shift}'; directory=OUT/key; pages=directory/'pages'; crops=directory/'crops'; pages.mkdir(parents=True,exist_ok=True); crops.mkdir(exist_ok=True)
    if not list(pages.glob('*.png')): subprocess.run([POPPLER,'-png','-r','180',str(pdf),str(pages/'page')],check=True)
    anchors=[]
    with pdfplumber.open(pdf) as doc:
        for page_index,page in enumerate(doc.pages,1):
            for word in page.extract_words():
                m=re.fullmatch(r'Q\.?([1-9]|[1-8][0-9]|90)\.?',word['text'])
                if m: anchors.append((int(m.group(1)),page_index,word['top']))
    anchors.sort()
    numbers=[x[0] for x in anchors]
    if numbers!=list(range(1,91)): raise ValueError(f'{key}: anchors incomplete: {numbers}')
    rendered={int(p.stem.split('-')[-1]):Image.open(p).convert('RGB') for p in pages.glob('*.png')}
    records=[]
    for i,(number,page,top) in enumerate(anchors):
        next_item=anchors[i+1] if i+1<len(anchors) else None; scale=rendered[page].height/(pdfplumber.open(pdf).pages[page-1].height)
        top_px=max(0,int((top-8)*scale)); parts=[]
        if next_item and next_item[1]==page:
            parts=[rendered[page].crop((0,top_px,rendered[page].width,max(top_px+1,int((next_item[2]-6)*scale))))]
        else:
            parts.append(rendered[page].crop((0,top_px,rendered[page].width,rendered[page].height)))
            if next_item:
                for continuation in range(page+1,next_item[1]+1):
                    bottom=int((next_item[2]-6)*scale) if continuation==next_item[1] else rendered[continuation].height
                    parts.append(rendered[continuation].crop((0,0,rendered[continuation].width,max(1,bottom))))
        height=sum(x.height for x in parts); image=Image.new('RGB',(max(x.width for x in parts),height),'white'); y=0
        for part in parts: image.paste(part,(0,y)); y+=part.height
        path=crops/f'q{number:02}.png'; image.save(path,optimize=True)
        records.append({'number':number,'subject':subject(number),'question_type':qtype(number),'image_path':str(path)})
    (directory/'manifest.json').write_text(json.dumps(records,indent=2)); print(json.dumps({'paper':key,'questions':len(records)}))
