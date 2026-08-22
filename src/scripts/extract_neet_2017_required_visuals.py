from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path("tmp/neet-2017");SOURCE=ROOT/"source/png";OUTPUT=ROOT/"structured/visuals";OUTPUT.mkdir(parents=True,exist_ok=True)
def crop(page,box,name,pad=5):
 im=Image.open(SOURCE/f"page-{page:02d}.png").convert("RGB").crop(box);d=ImageChops.difference(im,Image.new("RGB",im.size,"white")).convert("L");b=d.point(lambda x:255 if x>20 else 0).getbbox()
 if b:l,t,r,z=b;im=im.crop((max(0,l-pad),max(0,t-pad),min(im.width,r+pad),min(im.height,z+pad)))
 im.save(OUTPUT/name)
questions={4:(2,(570,350,940,660)),8:(3,(630,175,910,310)),11:(4,(220,970,410,1100)),16:(5,(640,365,860,565)),29:(8,(625,240,860,455)),36:(10,(190,280,410,510)),57:(14,(570,300,940,365))}
for n,(p,b) in questions.items():crop(p,b,f"neet-2017-q{n:03d}-question.png")
options={12:(4,[(565,325,660,475),(655,325,745,475),(740,325,835,475),(830,325,930,475)]),22:(7,[(135,1040,405,1090),(135,1090,405,1140),(135,1140,405,1190),(135,1190,405,1250)]),52:(13,[(570,1010,750,1120),(760,1010,950,1120),(570,1110,750,1235),(760,1110,950,1235)]),55:(14,[(100,620,270,775),(285,620,470,775),(100,760,270,930),(285,750,475,930)]),57:(14,[(565,345,950,425),(565,415,950,500),(565,490,950,575),(565,560,950,635)])}
for n,(p,boxes) in options.items():
 for i,b in enumerate(boxes,1):crop(p,b,f"neet-2017-q{n:03d}-option-{i}.png")
print({"question_images":len(questions),"option_images":sum(len(x[1]) for x in options.values())})
