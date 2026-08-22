from pathlib import Path
from PIL import Image,ImageChops

ROOT=Path("tmp/neet-2015"); SOURCE=ROOT/"source/png"; OUT=ROOT/"structured/visuals"; OUT.mkdir(parents=True,exist_ok=True)
def crop(page,box,name,pad=5):
 image=Image.open(SOURCE/f"page-{page:02d}.png").convert("RGB").crop(box)
 difference=ImageChops.difference(image,Image.new("RGB",image.size,"white")).convert("L")
 bounds=difference.point(lambda value:255 if value>20 else 0).getbbox()
 if bounds:
  left,top,right,bottom=bounds; image=image.crop((max(0,left-pad),max(0,top-pad),min(image.width,right+pad),min(image.height,bottom+pad)))
 image=image.point(lambda value:255 if value>150 else value)
 image.save(OUT/name)

for number,page,box in [(41,14,(535,535,650,605)),(138,36,(95,1085,325,1210)),(144,39,(70,700,325,820)),(150,42,(50,390,295,520)),(180,56,(35,220,325,365))]:
 crop(page,box,f"neet-2015-q{number:03d}-question.png")
sets={
 14:(5,[(75,755,190,840),(75,870,190,955),(75,980,310,1080),(75,1100,190,1190)]),
 33:(11,[(75,735,270,815),(75,845,270,925),(75,955,270,1035),(75,1070,300,1155)]),
 41:(14,[(75,620,255,695),(75,730,255,805),(75,825,255,900),(75,930,255,1010)]),
}
for number,(page,boxes) in sets.items():
 for index,box in enumerate(boxes,1): crop(page,box,f"neet-2015-q{number:03d}-option-{index}.png")
print({"question_images":5,"option_images":12})
