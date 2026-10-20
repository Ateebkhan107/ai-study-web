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

split(33,(0,0,1253,310),[(310,310,1253,550),(310,550,1253,765),(210,765,1253,1010),(210,1010,1253,1182)])
split(36,(0,0,1254,330),[(50,335,1254,700),(50,705,1254,1070),(50,1075,1254,1445),(50,1450,1254,1822)])
split(47,(0,0,1235,210),[(35,215,615,445),(620,215,1235,445),(35,450,615,684),(620,450,1235,684)])
split(48,(0,0,1231,175),[(190,175,1231,380),(190,380,1231,590),(190,590,1231,790),(190,790,1231,1005)])
split(49,(0,0,1231,205),[(190,205,1231,365),(190,365,1231,525),(190,525,1231,685),(190,685,1231,842)])
print({"normalized_sources":len(raw),"graphical_option_questions":5,"option_images":20})
