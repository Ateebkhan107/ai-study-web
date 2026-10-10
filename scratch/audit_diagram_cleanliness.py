import cv2
import numpy as np
import subprocess
import csv
import io
import os
import glob

def find_residual_text(image_path):
    cmd = ["/opt/homebrew/bin/tesseract", image_path, "stdout", "tsv"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    rows = []
    reader = csv.reader(io.StringIO(res.stdout), delimiter='\t')
    header = next(reader, None)
    for r in reader:
        if len(r) >= 12:
            try:
                level = int(r[0])
                left = int(r[6])
                top = int(r[7])
                width = int(r[8])
                height = int(r[9])
                conf = float(r[10])
                text = r[11].strip()
                rows.append({
                    'level': level,
                    'left': left,
                    'top': top,
                    'width': width,
                    'height': height,
                    'conf': conf,
                    'text': text
                })
            except (ValueError, IndexError):
                continue

    lines = [r for r in rows if r['level'] == 4]
    words = [r for r in rows if r['level'] == 5 and r['text']]
    
    dirty_lines = []
    for line in lines:
        lx, ly, lw, lh = line['left'], line['top'], line['width'], line['height']
        line_words = [w for w in words if w['top'] >= ly - 5 and (w['top'] + w['height']) <= (ly + lh + 5) and w['left'] >= lx - 5 and (w['left'] + w['width']) <= (lx + lw + 5)]
        line_text = " ".join([w['text'] for w in line_words])
        
        # Check if contains full question sentence prose
        if any(phrase in line_text.lower() for phrase in [
            "in the figure", "if the", "when the", "is equal to", "then the", "which of",
            "choose the", "as shown", "a body of", "the ratio", "consider", "respectively",
            "(1)", "(2)", "(3)", "(4)", "(a)", "(b)", "(c)", "(d)"
        ]) or (len(line_text.split()) >= 4 and not any(ch in line_text for ch in ['->', '=', '+', '—'])):
            dirty_lines.append((ly, ly + lh, line_text))
            
    return dirty_lines

def main():
    crops = glob.glob("scratch/jee2023/diagram_crops/**/*.png", recursive=True)
    print(f"Checking {len(crops)} cropped diagrams for residual text...")
    
    dirty_count = 0
    for c in crops:
        dirty = find_residual_text(c)
        if dirty:
            dirty_count += 1
            print(f"Dirty crop: {c}")
            for d in dirty:
                print(f"   y={d[0]}-{d[1]}: [{d[2]}]")

    print(f"\nTotal crops with residual text: {dirty_count}/{len(crops)}")

if __name__ == "__main__":
    main()
