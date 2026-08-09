from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path.cwd()
SOURCE_ROOT = ROOT / "tmp" / "wiley-jee-main-physics"
OUTPUT_ROOT = SOURCE_ROOT / "visuals"

# Coordinates use the locally rendered 1530 x 1980 source pages. Each crop
# contains only the indispensable graph or diagram, not page furniture,
# branding, question prose, or answer choices.
CROPS = [
    # chapter, question, source image, (left, top, right, bottom)
    (1, 12, SOURCE_ROOT / "front" / "page-008.png", (210, 1365, 660, 1690)),
    (2, 2, SOURCE_ROOT / "front" / "page-013.png", (130, 875, 685, 1320)),
    (2, 4, SOURCE_ROOT / "front" / "page-013.png", (775, 500, 1260, 735)),
    (2, 5, SOURCE_ROOT / "front" / "page-013.png", (820, 1170, 1260, 1510)),
    (2, 10, SOURCE_ROOT / "front" / "page-014.png", (155, 990, 520, 1920)),
    (2, 11, SOURCE_ROOT / "front" / "page-014.png", (760, 260, 1260, 1060)),
    (2, 19, SOURCE_ROOT / "front" / "page-015.png", (145, 1450, 690, 1900)),
    (2, 22, SOURCE_ROOT / "front" / "page-015.png", (760, 1020, 1480, 1510)),
    (2, 24, SOURCE_ROOT / "front" / "page-016.png", (180, 345, 650, 690)),
    (2, 26, SOURCE_ROOT / "front" / "page-016.png", (105, 940, 670, 1210)),
    (3, 3, SOURCE_ROOT / "all-pages" / "page-017.png", (275, 1270, 610, 1585)),
    (3, 6, SOURCE_ROOT / "all-pages" / "page-017.png", (805, 1090, 1175, 1500)),
    (3, 11, SOURCE_ROOT / "all-pages" / "page-018.png", (770, 165, 1225, 390)),
    (3, 15, SOURCE_ROOT / "all-pages" / "page-019.png", (150, 445, 660, 1245)),
    (3, 27, SOURCE_ROOT / "all-pages" / "page-020.png", (150, 1180, 660, 1415)),
    (3, 34, SOURCE_ROOT / "all-pages" / "page-021.png", (840, 175, 1110, 430)),
    (3, 35, SOURCE_ROOT / "all-pages" / "page-021.png", (760, 640, 1260, 895)),
    (3, 44, SOURCE_ROOT / "all-pages" / "page-022.png", (255, 235, 560, 405)),
    (3, 45, SOURCE_ROOT / "all-pages" / "page-022.png", (785, 290, 1175, 515)),
    (4, 10, SOURCE_ROOT / "all-pages" / "page-024.png", (205, 170, 610, 430)),
    (4, 20, SOURCE_ROOT / "all-pages" / "page-025.png", (250, 975, 590, 1390)),
    (4, 22, SOURCE_ROOT / "all-pages" / "page-025.png", (800, 500, 1160, 815)),
    (4, 44, SOURCE_ROOT / "all-pages" / "page-028.png", (245, 175, 570, 445)),
    (4, 47, SOURCE_ROOT / "all-pages" / "page-028.png", (140, 1115, 685, 1455)),
    (4, 48, SOURCE_ROOT / "all-pages" / "page-028.png", (735, 175, 1280, 970)),
    (4, 50, SOURCE_ROOT / "all-pages" / "page-029.png", (205, 165, 615, 475)),
    (4, 57, SOURCE_ROOT / "all-pages" / "page-029.png", (790, 1100, 1125, 1540)),
    (4, 58, SOURCE_ROOT / "all-pages" / "page-030.png", (205, 165, 610, 455)),
    (4, 60, SOURCE_ROOT / "all-pages" / "page-030.png", (750, 220, 1210, 610)),
    (5, 1, SOURCE_ROOT / "all-pages" / "page-031.png", (150, 675, 650, 1000)),
    (5, 13, SOURCE_ROOT / "all-pages" / "page-032.png", (250, 1150, 620, 1585)),
    (5, 24, SOURCE_ROOT / "all-pages" / "page-033.png", (710, 305, 1280, 1160)),
    (5, 26, SOURCE_ROOT / "all-pages" / "page-034.png", (245, 165, 580, 380)),
    (5, 27, SOURCE_ROOT / "all-pages" / "page-034.png", (255, 850, 615, 1120)),
    (5, 46, SOURCE_ROOT / "all-pages" / "page-036.png", (135, 785, 665, 1415)),
    (5, 48, SOURCE_ROOT / "all-pages" / "page-036.png", (755, 445, 1190, 745)),
    (5, 54, SOURCE_ROOT / "all-pages" / "page-037.png", (255, 685, 590, 1090)),
    (5, 59, SOURCE_ROOT / "all-pages" / "page-037.png", (760, 1240, 1200, 1585)),
    (5, 63, SOURCE_ROOT / "all-pages" / "page-038.png", (265, 1000, 545, 1300)),
    (5, 64, SOURCE_ROOT / "all-pages" / "page-038.png", (115, 1290, 670, 1545)),
    (5, 65, SOURCE_ROOT / "all-pages" / "page-038.png", (720, 455, 1320, 920)),
    (6, 4, SOURCE_ROOT / "all-pages" / "page-039.png", (715, 500, 1265, 1330)),
    (6, 7, SOURCE_ROOT / "all-pages" / "page-040.png", (260, 520, 600, 720)),
    (6, 8, SOURCE_ROOT / "all-pages" / "page-040.png", (245, 790, 610, 1120)),
    (6, 9, SOURCE_ROOT / "all-pages" / "page-040.png", (810, 165, 1190, 415)),
    (6, 11, SOURCE_ROOT / "all-pages" / "page-040.png", (780, 1260, 1210, 1600)),
    (6, 14, SOURCE_ROOT / "all-pages" / "page-041.png", (270, 900, 590, 1120)),
    (6, 15, SOURCE_ROOT / "all-pages" / "page-041.png", (250, 1380, 600, 1600)),
    (6, 23, SOURCE_ROOT / "all-pages" / "page-042.png", (245, 1215, 620, 1530)),
    (6, 26, SOURCE_ROOT / "all-pages" / "page-042.png", (775, 1530, 1200, 1770)),
    (6, 28, SOURCE_ROOT / "all-pages" / "page-043.png", (250, 650, 610, 940)),
    (6, 33, SOURCE_ROOT / "all-pages" / "page-043.png", (790, 755, 1190, 1130)),
    (6, 39, SOURCE_ROOT / "all-pages" / "page-044.png", (260, 1360, 610, 1760)),
    (6, 40, SOURCE_ROOT / "all-pages" / "page-044.png", (815, 430, 1190, 810)),
    (6, 41, SOURCE_ROOT / "all-pages" / "page-044.png", (770, 1070, 1240, 1620)),
    (6, 42, SOURCE_ROOT / "all-pages" / "page-045.png", (250, 275, 590, 545)),
    (6, 43, SOURCE_ROOT / "all-pages" / "page-045.png", (260, 895, 600, 1280)),
    (6, 45, SOURCE_ROOT / "all-pages" / "page-045.png", (800, 295, 1200, 640)),
    (6, 46, SOURCE_ROOT / "all-pages" / "page-045.png", (790, 845, 1200, 1165)),
    (6, 47, SOURCE_ROOT / "all-pages" / "page-045.png", (770, 1200, 1230, 1530)),
    (6, 49, SOURCE_ROOT / "all-pages" / "page-046.png", (250, 550, 610, 970)),
    (6, 50, SOURCE_ROOT / "all-pages" / "page-046.png", (260, 1260, 610, 1660)),
    (6, 52, SOURCE_ROOT / "all-pages" / "page-046.png", (790, 730, 1190, 1220)),
    (6, 60, SOURCE_ROOT / "all-pages" / "page-047.png", (790, 835, 1180, 1130)),
    (6, 64, SOURCE_ROOT / "all-pages" / "page-048.png", (250, 650, 610, 1070)),
    (6, 67, SOURCE_ROOT / "all-pages" / "page-048.png", (790, 480, 1210, 915)),
    (6, 68, SOURCE_ROOT / "all-pages" / "page-048.png", (780, 1100, 1220, 1530)),
    (6, 74, SOURCE_ROOT / "all-pages" / "page-049.png", (170, 1290, 650, 1700)),
    (6, 75, SOURCE_ROOT / "all-pages" / "page-049.png", (780, 720, 1220, 1070)),
    (6, 76, SOURCE_ROOT / "all-pages" / "page-049.png", (840, 1175, 1180, 1415)),
    (6, 77, SOURCE_ROOT / "all-pages" / "page-049.png", (820, 1440, 1200, 1730)),
    (7, 2, SOURCE_ROOT / "all-pages" / "page-051.png", (230, 990, 610, 1300)),
    (7, 4, SOURCE_ROOT / "all-pages" / "page-051.png", (780, 600, 1210, 900)),
    (7, 8, SOURCE_ROOT / "all-pages" / "page-052.png", (180, 520, 660, 940)),
    (7, 10, SOURCE_ROOT / "all-pages" / "page-052.png", (800, 320, 1200, 660)),
    (7, 12, SOURCE_ROOT / "all-pages" / "page-052.png", (760, 1040, 1260, 1460)),
    (7, 26, SOURCE_ROOT / "all-pages" / "page-054.png", (760, 165, 1240, 420)),
    (7, 28, SOURCE_ROOT / "all-pages" / "page-054.png", (830, 1120, 1220, 1430)),
    (7, 29, SOURCE_ROOT / "all-pages" / "page-055.png", (180, 360, 610, 1180)),
    (8, 6, SOURCE_ROOT / "all-pages" / "page-059.png", (860, 640, 1160, 850)),
    (8, 21, SOURCE_ROOT / "all-pages" / "page-061.png", (180, 970, 640, 1390)),
    (8, 25, SOURCE_ROOT / "all-pages" / "page-061.png", (880, 850, 1160, 1370)),
    (8, 27, SOURCE_ROOT / "all-pages" / "page-062.png", (190, 570, 650, 920)),
    (9, 4, SOURCE_ROOT / "all-pages" / "page-063.png", (300, 1490, 580, 1650)),
    (9, 12, SOURCE_ROOT / "all-pages" / "page-064.png", (300, 1490, 650, 1760)),
    (9, 13, SOURCE_ROOT / "all-pages" / "page-064.png", (860, 720, 1110, 1115)),
    (9, 19, SOURCE_ROOT / "all-pages" / "page-065.png", (330, 1270, 590, 1645)),
    (9, 20, SOURCE_ROOT / "all-pages" / "page-065.png", (830, 670, 1225, 1105)),
    (9, 23, SOURCE_ROOT / "all-pages" / "page-066.png", (250, 300, 620, 1420)),
    (9, 26, SOURCE_ROOT / "all-pages" / "page-066.png", (800, 730, 1200, 1430)),
    (9, 28, SOURCE_ROOT / "all-pages" / "page-067.png", (225, 180, 565, 455)),
    (9, 30, SOURCE_ROOT / "all-pages" / "page-067.png", (245, 1160, 585, 1425)),
    (9, 35, SOURCE_ROOT / "all-pages" / "page-067.png", (825, 1430, 1245, 1585)),
    (10, 2, SOURCE_ROOT / "all-pages" / "page-071.png", (270, 1230, 645, 1415)),
    (10, 4, SOURCE_ROOT / "all-pages" / "page-071.png", (780, 585, 1240, 1100)),
    (10, 5, SOURCE_ROOT / "all-pages" / "page-071.png", (875, 1450, 1135, 1645)),
    (10, 6, SOURCE_ROOT / "all-pages" / "page-072.png", (330, 485, 575, 635)),
    (10, 27, SOURCE_ROOT / "all-pages" / "page-074.png", (760, 180, 1250, 890)),
    (10, 29, SOURCE_ROOT / "all-pages" / "page-074.png", (770, 1510, 1250, 1690)),
    (10, 31, SOURCE_ROOT / "all-pages" / "page-075.png", (315, 835, 610, 915)),
    (10, 34, SOURCE_ROOT / "all-pages" / "page-075.png", (780, 300, 1240, 645)),
    (10, 35, SOURCE_ROOT / "all-pages" / "page-075.png", (780, 845, 1240, 1585)),
    (10, 39, SOURCE_ROOT / "all-pages" / "page-076.png", (790, 245, 1220, 775)),
    (11, 6, SOURCE_ROOT / "all-pages" / "page-079.png", (850, 670, 1160, 960)),
    (11, 12, SOURCE_ROOT / "all-pages" / "page-080.png", (285, 1530, 580, 1685)),
    (11, 19, SOURCE_ROOT / "all-pages" / "page-081.png", (230, 1070, 600, 1310)),
    (11, 20, SOURCE_ROOT / "all-pages" / "page-081.png", (230, 1070, 600, 1310)),
    (11, 21, SOURCE_ROOT / "all-pages" / "page-081.png", (230, 1070, 600, 1310)),
    (11, 28, SOURCE_ROOT / "all-pages" / "page-082.png", (270, 1260, 590, 1490)),
    (11, 30, SOURCE_ROOT / "all-pages" / "page-082.png", (820, 700, 1110, 935)),
    (11, 32, SOURCE_ROOT / "all-pages" / "page-083.png", (250, 180, 570, 460)),
    (11, 34, SOURCE_ROOT / "all-pages" / "page-083.png", (250, 690, 600, 925)),
    (11, 36, SOURCE_ROOT / "all-pages" / "page-083.png", (820, 180, 1200, 475)),
    (11, 55, SOURCE_ROOT / "all-pages" / "page-085.png", (820, 500, 1200, 850)),
    (12, 11, SOURCE_ROOT / "all-pages" / "page-088.png", (285, 600, 585, 860)),
    (12, 13, SOURCE_ROOT / "all-pages" / "page-088.png", (180, 1280, 1260, 1720)),
    (12, 18, SOURCE_ROOT / "all-pages" / "page-089.png", (250, 310, 600, 590)),
    (13, 19, SOURCE_ROOT / "all-pages" / "page-093.png", (180, 300, 620, 1330)),
    (13, 35, SOURCE_ROOT / "all-pages" / "page-095.png", (180, 520, 620, 1450)),
    (13, 36, SOURCE_ROOT / "all-pages" / "page-095.png", (760, 180, 1240, 575)),
    (13, 44, SOURCE_ROOT / "all-pages" / "page-096.png", (210, 1420, 620, 1700)),
    (13, 45, SOURCE_ROOT / "all-pages" / "page-096.png", (880, 350, 1140, 625)),
    (13, 46, SOURCE_ROOT / "all-pages" / "page-096.png", (760, 780, 1260, 1290)),
    (13, 61, SOURCE_ROOT / "all-pages" / "page-098.png", (250, 1110, 610, 1570)),
    (13, 63, SOURCE_ROOT / "all-pages" / "page-098.png", (900, 1050, 1080, 1360)),
]

# Some option sets continue across columns. They are combined into one clean
# image so the four labelled graphs remain together without including the
# surrounding book page.
COMPOSITES = [
    (
        4,
        21,
        [
            (SOURCE_ROOT / "all-pages" / "page-025.png", (145, 1605, 650, 1810)),
            (SOURCE_ROOT / "all-pages" / "page-025.png", (700, 175, 1270, 350)),
        ],
    ),
    (
        7,
        17,
        [
            (SOURCE_ROOT / "all-pages" / "page-053.png", (170, 1160, 650, 1790)),
            (SOURCE_ROOT / "all-pages" / "page-053.png", (760, 160, 1260, 800)),
        ],
    ),
    (
        11,
        25,
        [
            (SOURCE_ROOT / "all-pages" / "page-081.png", (850, 1430, 1140, 1665)),
            (SOURCE_ROOT / "all-pages" / "page-082.png", (180, 190, 635, 550)),
        ],
    ),
]


def clean_crop(source: Path, box: tuple[int, int, int, int]) -> Image.Image:
    image = Image.open(source).convert("L").crop(box)
    image = ImageOps.autocontrast(image, cutoff=1)
    return image.point(lambda pixel: 255 if pixel > 175 else 0)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for chapter, question, source, box in CROPS:
        image = clean_crop(source, box)
        # Source pages contain a pale diagonal watermark. Figures are printed
        # much darker, so a conservative threshold removes the watermark while
        # retaining axes, labels, curves and circuit lines.
        image = ImageOps.expand(image, border=20, fill="white")
        output = OUTPUT_ROOT / f"chapter-{chapter:02d}-q{question:03d}.png"
        image.save(output, optimize=True)
        print(output)

    for chapter, question, pieces in COMPOSITES:
        images = [clean_crop(source, box) for source, box in pieces]
        width = max(image.width for image in images)
        height = sum(image.height for image in images) + 20 * (len(images) - 1)
        composite = Image.new("L", (width, height), "white")
        y = 0
        for image in images:
            composite.paste(image, ((width - image.width) // 2, y))
            y += image.height + 20
        composite = ImageOps.expand(composite, border=20, fill="white")
        output = OUTPUT_ROOT / f"chapter-{chapter:02d}-q{question:03d}.png"
        composite.save(output, optimize=True)
        print(output)


if __name__ == "__main__":
    main()
