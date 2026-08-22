from pathlib import Path
from PIL import Image,ImageChops
R=Path("tmp/neet-2016");S=R/"source/png";O=R/"structured/visuals";O.mkdir(parents=True,exist_ok=True)
def crop(p,b,n,pad=5):
 im=Image.open(S/f"page-{p:02d}.png").convert("RGB").crop(b);d=ImageChops.difference(im,Image.new("RGB",im.size,"white")).convert("L");z=d.point(lambda x:255 if x>20 else 0).getbbox()
 if z:l,t,r,b=z;im=im.crop((max(0,l-pad),max(0,t-pad),min(im.width,r+pad),min(im.height,b+pad)))
 # Keep the source diagram strokes while removing the publisher's pale page watermark.
 im=im.point(lambda x:255 if x>150 else x)
 im.save(O/n)
for q,p,b in [(5,3,(75,765,380,925)),(13,9,(95,1090,525,1160)),(34,22,(85,700,525,790)),(82,41,(90,445,570,525))]:crop(p,b,f"neet-2016-q{q:03d}-question.png")
for i,b in enumerate([(90,145,340,300),(90,290,340,455),(90,445,340,610),(90,620,340,770)],1):crop(42,b,f"neet-2016-q084-option-{i}.png")
print({"question_images":4,"option_images":4})
