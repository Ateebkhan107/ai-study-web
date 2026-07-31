"""Prepare clean, single-question images for the supplied JEE Main Apr-2025 papers."""
import json, re, subprocess
from pathlib import Path
import pdfplumber
from PIL import Image

ROOT = Path.cwd(); OUT = ROOT / "tmp" / "jee-main-2025-april-clean"
PDFTOPPM = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
KEY = Path("/Users/ateebfatmi/Desktop/JEE Main 2025 April Session Answer Keys.pdf")
PAPERS = [(2,1),(2,2),(3,1),(3,2),(4,1),(4,2),(7,1),(7,2),(8,2)]

def subject(n): return "Maths" if n <= 25 else "Physics" if n <= 50 else "Chemistry"

with pdfplumber.open(KEY) as d: key = "\n".join(p.extract_text() or "" for p in d.pages)
for day, shift in PAPERS:
    src = Path(f"/Users/ateebfatmi/Desktop/JEE Main 2025 Apr{day} S{shift}.pdf")
    code = f"JEE-MAIN-25-{day:02}APR-S{shift}"; out = OUT / code; pages = out / "pages"; crops = out / "crops"
    pages.mkdir(parents=True, exist_ok=True); crops.mkdir(exist_ok=True)
    if not list(pages.glob("*.png")):
        subprocess.run([PDFTOPPM,"-png","-r","180",str(src),str(pages/"page")],check=True)
    with pdfplumber.open(src) as doc:
        texts = [p.extract_text() or "" for p in doc.pages]; words = [p.extract_words() for p in doc.pages]; anchors=[]
        for pi, page_words in enumerate(words,1):
            for word in page_words:
                m=re.fullmatch(r"Q\.?([1-9]|[1-6][0-9]|7[0-5])\.?",word["text"])
                if m: anchors.append((int(m.group(1)),pi,word["top"]))
        anchors.sort()
        if [x[0] for x in anchors] != list(range(1,76)): raise RuntimeError(f"{code}: missing or duplicate anchors")
        images={int(p.stem.split("-")[-1]):Image.open(p).convert("RGB") for p in pages.glob("*.png")}; full="\n".join(texts); manifest=[]
        for i,(number,pi,top) in enumerate(anchors):
            nxt=anchors[i+1] if i<74 else None; image=images[pi]; scale=image.height/doc.pages[pi-1].height; crop_top=max(0,int((top-8)*scale)); crop_bottom=int((nxt[2]-6)*scale) if nxt and nxt[1]==pi else image.height
            page_words=words[pi-1]
            metadata=next((word for word in page_words if word["top"]>top and word["text"]=="Question" and any(c["text"]=="Type" and abs(c["top"]-word["top"])<5 and c["x0"]>word["x0"] for c in page_words)),None)
            crop=image.crop((0,crop_top,image.width,max(crop_top+1,crop_bottom)))
            if metadata:
                panel_top=max(0,int((metadata["top"]-28)*scale)-crop_top)
                crop.paste("white",(int(crop.width*.45),panel_top,crop.width,crop.height))
            path=crops/f"q{number:02}.png"; crop.save(path,optimize=True)
            start=full.find(f"Q.{number}"); end=full.find(f"Q.{number+1}",start+1) if number<75 else len(full); chunk=full[start:end]
            qid=re.search(r"Question ID\s*:\s*(\d+)",chunk)
            if not qid: raise RuntimeError(f"{code} Q{number}: missing ID")
            qid=qid.group(1); option_ids=re.findall(r"Option ([1-4]) ID\s*:\s*(\d+)",chunk)
            answer=re.search(rf"\b{qid}\s*(\d+|DROP(?:PED)?)\b",key,re.I)
            if not answer: raise RuntimeError(f"{code} Q{number}: answer key mismatch")
            answer=answer.group(1).upper(); answer="DROP" if answer.startswith("DROP") else answer; selected=next((n for n,oid in option_ids if oid==answer),None)
            manifest.append({"number":number,"subject":subject(number),"question_type":"MCQ" if option_ids else "NUMERICAL","image_path":str(path),"answer":selected or answer})
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2)); print(code)
