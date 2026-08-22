from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path("tmp/neet-2019")
SOURCE = ROOT / "source/png"
OUTPUT = ROOT / "structured/visuals"
OUTPUT.mkdir(parents=True, exist_ok=True)


def crop(page: int, box: tuple[int, int, int, int], name: str, pad: int = 6) -> None:
    image = Image.open(SOURCE / f"page-{page:02d}.png").convert("RGB").crop(box)
    difference = ImageChops.difference(image, Image.new("RGB", image.size, "white")).convert("L")
    bounds = difference.point(lambda value: 255 if value > 20 else 0).getbbox()
    if bounds:
        left, top, right, bottom = bounds
        image = image.crop((max(0, left - pad), max(0, top - pad), min(image.width, right + pad), min(image.height, bottom + pad)))
    image.save(OUTPUT / name)


question_crops = {
    17: (3, (650, 285, 820, 485)),
    24: (4, (105, 700, 450, 1160)),
    33: (5, (205, 790, 370, 1000)),
    39: (6, (85, 75, 410, 285)),
    42: (6, (175, 810, 390, 985)),
    47: (7, (95, 330, 480, 455)),
    55: (8, (95, 165, 480, 275)),
    78: (10, (545, 430, 880, 515)),
}
for number, (page, box) in question_crops.items():
    crop(page, box, f"neet-2019-q{number:03d}-question.png")


option_crops = {
    45: (6, [(545, 860, 780, 970), (545, 960, 780, 1070), (545, 1060, 780, 1175), (545, 1160, 780, 1280)]),
    47: (7, [(100, 455, 265, 590), (265, 455, 480, 590), (100, 575, 270, 735), (270, 575, 480, 735)]),
    48: (7, [(100, 755, 480, 850), (100, 850, 480, 950), (100, 950, 480, 1050), (100, 1050, 480, 1145)]),
    65: (9, [(95, 200, 485, 280), (95, 280, 485, 370), (95, 370, 485, 525), (95, 525, 485, 665)]),
    69: (9, [(545, 295, 835, 365), (545, 370, 835, 440), (545, 445, 835, 515), (545, 515, 835, 555)]),
    74: (10, [(100, 230, 485, 330), (100, 345, 485, 445), (100, 445, 485, 555), (100, 555, 485, 675)]),
    78: (10, [(545, 505, 820, 635), (545, 625, 820, 755), (545, 745, 820, 870), (545, 860, 820, 975)]),
}
for number, (page, boxes) in option_crops.items():
    for index, box in enumerate(boxes, 1):
        crop(page, box, f"neet-2019-q{number:03d}-option-{index}.png")

print({"question_images": len(question_crops), "option_images": sum(len(value[1]) for value in option_crops.values())})
