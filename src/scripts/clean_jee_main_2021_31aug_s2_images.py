#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PAPER = "JEE-MAIN-21-31AUG-S2"
DIR = ROOT / "scratch/jee2021/images" / PAPER

def norm(im):
    im=im.convert("RGB"); c=im.crop((0,0,min(24,im.width),min(24,im.height)))
    if sum(sum(p) for p in c.getdata())/(max(1,c.width*c.height)*3)<128: im=ImageOps.invert(im)
    return ImageOps.grayscale(im).point(lambda v:255 if v>=205 else 0).convert("RGB")
def trim(im,p=12):
    b=ImageChops.difference(im,Image.new("RGB",im.size,"white")).getbbox()
    if not b:return im
    l,t,r,d=b;return im.crop((max(0,l-p),max(0,t-p),min(im.width,r+p),min(im.height,d+p)))
def save(im,box,name):trim(norm(im.crop(box))).save(DIR/name)

raw={}
for f in DIR.glob("q*_raw.png"):
    n=int(f.stem.split("_")[0][1:]);raw[n]=Image.open(f).convert("RGB");trim(norm(raw[n])).save(DIR/f"q{n}.png")
def split(n,qbox,boxes):
    s=raw[n]
    if qbox:save(s,qbox,f"q{n}.png")
    else:(DIR/f"q{n}.png").unlink(missing_ok=True)
    for l,b in zip("abcd",boxes):save(s,b,f"q{n}_opt_{l}.png")

split(33,(0,0,1253,250),[(50,255,1253,480),(50,485,1253,710),(50,715,1253,945),(50,950,1253,1182)])
split(36,(0,0,1254,330),[(50,335,1254,700),(50,705,1254,1070),(50,1075,1254,1445),(50,1450,1254,1822)])
split(47,(0,0,1235,210),[(35,215,615,445),(620,215,1235,445),(35,450,615,684),(620,450,1235,684)])
split(48,(0,0,1231,240),[(45,245,1231,430),(45,435,1231,620),(45,625,1231,810),(45,815,1231,1005)])
split(49,(0,0,1231,220),[(45,225,1231,375),(45,380,1231,530),(45,535,1231,685),(45,690,1231,842)])
print({"normalized_sources":len(raw),"graphical_option_questions":5,"option_images":20})
