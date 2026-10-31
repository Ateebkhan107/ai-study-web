#!/usr/bin/env python3
"""
Systematic stripper for embedded option labels (1)..(4) across JEE Main 2021 option images.
Excludes option labels while preserving 100% of the chemical structure / diagram.
"""

import re
import sys
from collections import defaultdict
from pathlib import Path
from PIL import Image, ImageChops, ImageOps
import numpy as np

ROOT = Path("/Users/ateebfatmi/Desktop/prepzii")
IMAGES_DIR = ROOT / "scratch/jee2021/images"


def is_paren(arr: np.ndarray, comp: tuple[int, int], is_open: bool = True) -> bool:
    sub = arr[:, comp[0]:comp[1]+1]
    ys, xs = np.where(sub < 200)
    if len(ys) == 0:
        return False
    h = ys.max() - ys.min() + 1
    w = xs.max() - xs.min() + 1
    if h < 14 or w > 25 or (h / max(1, w)) < 1.4:
        return False
    y_min, y_max = ys.min(), ys.max()
    top_mask = ys < y_min + h * 0.3
    mid_mask = (ys >= y_min + h * 0.3) & (ys <= y_max - h * 0.3)
    bot_mask = ys > y_max - h * 0.3
    if not (any(top_mask) and any(mid_mask) and any(bot_mask)):
        return False
    x_top = np.mean(xs[top_mask])
    x_mid = np.mean(xs[mid_mask])
    x_bot = np.mean(xs[bot_mask])
    if is_open:
        return (x_mid < x_top) and (x_mid < x_bot)
    else:
        return (x_mid > x_top) and (x_mid > x_bot)


def detect_parens_label(im: Image.Image) -> tuple[int, int, int, int] | None:
    arr = np.array(im.convert("L"))
    if arr.shape[1] < 80 or arr.shape[0] < 30:
        return None
    bin_arr = (arr < 200).astype(np.uint8)
    proj = np.sum(bin_arr, axis=0)
    comps = []
    in_comp = False
    s = 0
    for i, cnt in enumerate(proj[:min(350, len(proj))]):
        if cnt > 0 and not in_comp:
            in_comp = True
            s = i
        elif cnt == 0 and in_comp:
            in_comp = False
            comps.append((s, i-1))
    if in_comp:
        comps.append((s, min(350, len(proj))-1))
    
    for i in range(len(comps) - 2):
        c1, c2, c3 = comps[i], comps[i+1], comps[i+2]
        gap_after = comps[i+3][0] - c3[1] if (i+3 < len(comps)) else (arr.shape[1] - c3[1])
        if c1[0] < 350 and gap_after >= 12:
            if is_paren(arr, c1, is_open=True) and is_paren(arr, c3, is_open=False):
                sub2 = bin_arr[:, c2[0]:c2[1]+1]
                ys2, _ = np.where(sub2 > 0)
                if len(ys2) > 0 and 12 <= (ys2.max() - ys2.min() + 1) <= 55:
                    cut_point = c3[1] + 1 + min(15, gap_after // 2)
                    return (c1[0], c3[1], gap_after, cut_point)
    return None


def normalize_and_trim(im: Image.Image, padding: int = 12) -> Image.Image:
    im = im.convert("RGB")
    corner = im.crop((0, 0, min(15, im.width), min(15, im.height)))
    mean = sum(sum(p) for p in corner.getdata()) / (max(1, corner.width * corner.height) * 3)
    if mean < 128:
        im = ImageOps.invert(im)
    
    pixels = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = pixels[x, y]
            if min(r, g, b) >= 240:
                pixels[x, y] = (255, 255, 255)
            elif max(r, g, b) <= 25:
                pixels[x, y] = (0, 0, 0)

    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255)))
    bbox = diff.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    trimmed = im.crop((
        max(0, l - padding),
        max(0, t - padding),
        min(im.width, r + padding),
        min(im.height, b + padding)
    ))
    return trimmed


def strip_paper(paper_dir: Path, apply: bool = False) -> int:
    paper_code = paper_dir.name
    opt_files = sorted(paper_dir.glob("*_opt_*.png"))
    if not opt_files:
        return 0

    groups = defaultdict(dict)
    for p in opt_files:
        m = re.match(r"^(q\d+)_opt_([abcd])\.png$", p.name)
        if m:
            groups[m.group(1)][m.group(2)] = p

    modified_count = 0
    for q_id, opts in sorted(groups.items()):
        images = {let: Image.open(path) for let, path in opts.items()}
        detections = {let: detect_parens_label(im) for let, im in images.items()}
        valid_dets = {let: det for let, det in detections.items() if det is not None}
        
        # If at least 2 options in the group have a confirmed parens label:
        if len(valid_dets) >= 2:
            median_cut = int(np.median([d[3] for d in valid_dets.values()]))
            for let, path in opts.items():
                im = images[let]
                cut = valid_dets[let][3] if let in valid_dets else median_cut
                # Ensure cut is within image width
                if cut < im.width - 20:
                    cropped = im.crop((cut, 0, im.width, im.height))
                    trimmed = normalize_and_trim(cropped, padding=12)
                    if apply:
                        trimmed.save(path)
                    modified_count += 1
            print(f"  {paper_code} {q_id}: stripped labels from {len(opts)} options (median cut={median_cut}px)")

    return modified_count


def main():
    apply = "--apply" in sys.argv
    paper_filter = None
    for arg in sys.argv[1:]:
        if arg.startswith("--paper="):
            paper_filter = arg.split("=")[1]

    total_modified = 0
    papers_modified = 0

    paper_dirs = sorted([d for d in IMAGES_DIR.iterdir() if d.is_dir()])
    for pdir in paper_dirs:
        if paper_filter and pdir.name != paper_filter:
            continue
        count = strip_paper(pdir, apply=apply)
        if count > 0:
            papers_modified += 1
            total_modified += count

    print(f"\nDone! {'Applied' if apply else 'Dry-run'}: {total_modified} option images across {papers_modified} papers.")


if __name__ == "__main__":
    main()
