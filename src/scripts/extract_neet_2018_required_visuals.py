from pathlib import Path
from PIL import Image, ImageChops

ROOT=Path("tmp/neet-2018"); SOURCE=ROOT/"source/png"; OUTPUT=ROOT/"structured/visuals"; OUTPUT.mkdir(parents=True,exist_ok=True)
def crop(page,box,name,pad=6):
 image=Image.open(SOURCE/f"page-{page:02d}.png").convert("RGB").crop(box)
 diff=ImageChops.difference(image,Image.new("RGB",image.size,"white")).convert("L")
 bounds=diff.point(lambda x:255 if x>20 else 0).getbbox()
 if bounds:
  l,t,r,b=bounds;image=image.crop((max(0,l-pad),max(0,t-pad),min(image.width,r+pad),min(image.height,b+pad)))
 image.save(OUTPUT/name)

questions={1:(2,(220,195,355,320)),15:(5,(185,805,435,1015)),17:(5,(625,825,875,1010)),30:(8,(620,690,855,900)),35:(10,(180,780,410,990)),39:(11,(170,1060,440,1245)),52:(13,(565,755,895,880)),81:(20,(150,970,430,1160))}
for n,(p,b) in questions.items():crop(p,b,f"neet-2018-q{n:03d}-question.png")
options={7:(3,[(145,935,295,1075),(330,935,485,1075),(145,1070,295,1220),(330,1070,485,1220)]),52:(13,[(595,875,950,965),(595,950,950,1060),(595,1040,950,1150),(595,1135,950,1210)])}
for n,(p,boxes) in options.items():
 for i,b in enumerate(boxes,1):crop(p,b,f"neet-2018-q{n:03d}-option-{i}.png")
print({"question_images":len(questions),"option_images":sum(len(v[1]) for v in options.values())})
