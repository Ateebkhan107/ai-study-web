from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
IMAGE_ROOT = ROOT / "scratch" / "jee2022" / "images"

# Crop rectangles are (left, top, right, bottom). They remove neighboring PDF
# prose, question labels, and answer rows while retaining the complete figure.
CROPS = {
    "JEE-MAIN-22-26JUL-S1/q1.png": ((497, 207), (0, 24, 497, 207)),
    "JEE-MAIN-22-26JUL-S1/q25.png": ((580, 314), (0, 150, 580, 314)),
    "JEE-MAIN-22-26JUL-S1/q26.png": ((690, 328), (160, 0, 690, 328)),
    "JEE-MAIN-22-26JUL-S1/q28.png": ((882, 458), (165, 0, 882, 458)),
    "JEE-MAIN-22-27JUL-S1/q7.png": ((1234, 276), (210, 0, 1230, 198)),
    "JEE-MAIN-22-27JUL-S2/q20.png": ((712, 446), (165, 0, 712, 245)),
    "JEE-MAIN-22-29JUL-S1/q4.png": ((335, 215), (0, 50, 335, 215)),
    "JEE-MAIN-22-29JUL-S1/q48.png": ((572, 250), (0, 25, 572, 190)),
}


def main() -> None:
    for relative_path, (source_size, box) in CROPS.items():
        image_path = IMAGE_ROOT / relative_path
        with Image.open(image_path) as image:
            if image.size == (box[2] - box[0], box[3] - box[1]):
                print(f"already repaired: {relative_path}")
                continue
            if image.size != source_size:
                raise ValueError(
                    f"Unexpected dimensions for {relative_path}: {image.size}; "
                    f"expected {source_size}"
                )
            image.crop(box).save(image_path, optimize=True)
            print(f"repaired: {relative_path} {image.size} -> "
                  f"{(box[2] - box[0], box[3] - box[1])}")


if __name__ == "__main__":
    main()
