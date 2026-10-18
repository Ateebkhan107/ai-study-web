from PIL import Image, ImageOps, ImageChops
import numpy as np
import os
from pathlib import Path

raw_path = Path("scratch/jee2021/images/JEE-MAIN-21-25FEB-S1/q48_raw.png")
out_dir = Path("scratch/jee2021/images/JEE-MAIN-21-25FEB-S1")

img = Image.open(raw_path).convert('RGB')
gray = img.convert('L')
inv = ImageOps.invert(gray)
arr = np.array(inv, dtype=np.float32)

# High-contrast clean white background:
# Map pixels: > 232 -> 255 (pure white), < 150 -> 0 (deep black)
clean_arr = np.clip((arr - 150) / (232 - 150) * 255, 0, 255).astype(np.uint8)
clean_full = Image.fromarray(clean_arr)

# 1. Question Reaction Scheme:
# Y extends from 0 to 325 (NO2 ends at ~305)
# X extends from 280 to 1350
reaction_crop = clean_full.crop((280, 0, 1350, 325))
bg_r = Image.new('L', reaction_crop.size, 255)
bbox_r = ImageChops.difference(reaction_crop, bg_r).getbbox()
if bbox_r:
    pad = 16
    reaction_crop = reaction_crop.crop((
        max(0, bbox_r[0] - pad),
        max(0, bbox_r[1] - pad),
        min(reaction_crop.width, bbox_r[2] + pad),
        min(reaction_crop.height, bbox_r[3] + pad)
    ))

reaction_crop.save(out_dir / "q48.png")
print("Saved clean q48.png:", reaction_crop.size)

# 2. Options A, B, C, D:
opt_boxes = [
    (300, 380, 1120, 690),
    (300, 760, 1130, 1070),
    (300, 1135, 1110, 1445),
    (300, 1505, 1090, 1825),
]

for letter, box in zip('abcd', opt_boxes):
    cropped = clean_full.crop(box)
    bg_o = Image.new('L', cropped.size, 255)
    bbox_o = ImageChops.difference(cropped, bg_o).getbbox()
    if bbox_o:
        pad = 12
        cropped = cropped.crop((
            max(0, bbox_o[0] - pad),
            max(0, bbox_o[1] - pad),
            min(cropped.width, bbox_o[2] + pad),
            min(cropped.height, bbox_o[3] + pad)
        ))
    cropped.save(out_dir / f"q48_opt_{letter}.png")
    print(f"Saved clean q48_opt_{letter}.png:", cropped.size)
