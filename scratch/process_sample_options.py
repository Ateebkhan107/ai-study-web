import cv2
import numpy as np
import os

def crop_box(img, y1, y2, x1, x2, pad=6):
    h, w, _ = img.shape
    y1, y2 = max(0, y1), min(h, y2)
    x1, x2 = max(0, x1), min(w, x2)
    gray = cv2.cvtColor(img[y1:y2, x1:x2], cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    col_sums = np.sum(thresh, axis=0) / 255.0
    row_sums = np.sum(thresh, axis=1) / 255.0
    cols = np.where(col_sums > 0)[0]
    rows = np.where(row_sums > 0)[0]
    if len(cols) == 0 or len(rows) == 0:
        return img[y1:y2, x1:x2]
    
    sub_x1 = max(0, x1 + cols[0] - pad)
    sub_x2 = min(w, x1 + cols[-1] + pad)
    sub_y1 = max(0, y1 + rows[0] - pad)
    sub_y2 = min(h, y1 + rows[-1] + pad)
    return img[sub_y1:sub_y2, sub_x1:sub_x2]

def split_row_2opts(img, y1, y2, x_start=150, x_end=1300):
    row = img[y1:y2, x_start:x_end]
    rh, rw, _ = row.shape
    gray = cv2.cvtColor(row, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    col_sums = np.sum(thresh, axis=0) / 255.0
    mid = rw // 2
    search_range = range(mid - int(rw*0.2), mid + int(rw*0.2))
    min_idx = min(search_range, key=lambda x: col_sums[x])
    
    left = crop_box(img, y1, y2, x_start, x_start + min_idx)
    right = crop_box(img, y1, y2, x_start + min_idx, x_end)
    return left, right

out_base = "scratch/jee2023/diagram_crops/JEE-MAIN-23-24JAN-S1"

# --- Q31 ---
img31 = cv2.imread("tmp/jee-main-2023-january-clean/JEE-MAIN-23-24JAN-S1/crops/q31.png")
q31_diag = crop_box(img31, 53, 488, 500, 1000)
q31_a, q31_b = split_row_2opts(img31, 490, 679)
q31_c, q31_d = split_row_2opts(img31, 688, 875)
cv2.imwrite(f"{out_base}/q31.png", q31_diag)
cv2.imwrite(f"{out_base}/q31_opt_a.png", q31_a)
cv2.imwrite(f"{out_base}/q31_opt_b.png", q31_b)
cv2.imwrite(f"{out_base}/q31_opt_c.png", q31_c)
cv2.imwrite(f"{out_base}/q31_opt_d.png", q31_d)

# --- Q34 ---
img34 = cv2.imread("tmp/jee-main-2023-january-clean/JEE-MAIN-23-24JAN-S1/crops/q34.png")
q34_diag = crop_box(img34, 57, 227, 300, 1200)
q34_a, q34_b = split_row_2opts(img34, 241, 417)
q34_c, q34_d = split_row_2opts(img34, 426, 583)
cv2.imwrite(f"{out_base}/q34.png", q34_diag)
cv2.imwrite(f"{out_base}/q34_opt_a.png", q34_a)
cv2.imwrite(f"{out_base}/q34_opt_b.png", q34_b)
cv2.imwrite(f"{out_base}/q34_opt_c.png", q34_c)
cv2.imwrite(f"{out_base}/q34_opt_d.png", q34_d)

# --- Q40 ---
img40 = cv2.imread("tmp/jee-main-2023-january-clean/JEE-MAIN-23-24JAN-S1/crops/q40.png")
q40_diag = crop_box(img40, 61, 261, 300, 1200)
q40_a, q40_b = split_row_2opts(img40, 282, 460)
q40_c, q40_d = split_row_2opts(img40, 477, 631)
cv2.imwrite(f"{out_base}/q40.png", q40_diag)
cv2.imwrite(f"{out_base}/q40_opt_a.png", q40_a)
cv2.imwrite(f"{out_base}/q40_opt_b.png", q40_b)
cv2.imwrite(f"{out_base}/q40_opt_c.png", q40_c)
cv2.imwrite(f"{out_base}/q40_opt_d.png", q40_d)

# --- Q44 --- (Question image has reaction diagram only, options are LaTeX formulas)
img44 = cv2.imread("tmp/jee-main-2023-january-clean/JEE-MAIN-23-24JAN-S1/crops/q44.png")
q44_diag = crop_box(img44, 56, 206, 300, 1200)
cv2.imwrite(f"{out_base}/q44.png", q44_diag)

print("Generated sample crops successfully.")
