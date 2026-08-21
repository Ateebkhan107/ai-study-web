from __future__ import annotations
import json,re,shutil,sys
from pathlib import Path
from xml.etree import ElementTree as ET
Q=re.compile(r"Question\s+(\d+)\s*:?",re.I)
def at(p,t):return p*10000+t
def main():
 x,o=Path(sys.argv[1]).resolve(),Path(sys.argv[2]).resolve();o.mkdir(parents=True,exist_ok=True);root=ET.parse(x).getroot();qs={};ans=[];imgs=[]
 for pn in root.findall("page"):
  p=int(pn.attrib["number"])
  for c in pn:
   t=int(c.attrib.get("top",0))
   if c.tag=="text":
    z="".join(c.itertext()).strip();m=Q.search(z)
    if m and 1<=int(m.group(1))<=200 and int(m.group(1)) not in qs:qs[int(m.group(1))]=at(p,t)
    if z.lower().startswith("answer:"):ans.append(at(p,t))
   elif c.tag=="image":
    w,h=int(c.attrib.get("width",0)),int(c.attrib.get("height",0))
    if w>=18 and h>=18 and not(w>800 and h>1100):imgs.append({"at":at(p,t),"page":p,"top":t,"left":int(c.attrib.get("left",0)),"width":w,"height":h,"src":c.attrib["src"]})
 if sorted(qs)!=list(range(1,201)):raise ValueError(f"starts {len(qs)}")
 ans.sort();out=[]
 for n in range(1,201):
  end=next((v for v in ans if v>qs[n]),None);sel=[i for i in imgs if qs[n]<i["at"]<end];files=[]
  for j,i in enumerate(sel,1):
   src=Path(i["src"])
   if not src.is_absolute() and not src.is_file():src=x.parent/src.name
   dst=o/f"neet-2022-q{n:03d}-visual-{j}{src.suffix.lower() or '.png'}";shutil.copyfile(src,dst);files.append({**i,"file":str(dst)})
  out.append({"number":n,"visuals":files})
 (o/"visual-manifest.json").write_text(json.dumps(out,indent=2));counts={z["number"]:len(z["visuals"]) for z in out if z["visuals"]};print(json.dumps({"questions_with_visuals":len(counts),"visuals":sum(counts.values()),"counts":counts}))
if __name__=="__main__":main()
