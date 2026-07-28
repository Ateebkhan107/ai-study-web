import cv2
import pytesseract
import numpy as np
from pdf2image import convert_from_path
import os
import re
import sys

def process_pdf(pdf_path):
    print(f"Processing {pdf_path}...")
    basename = os.path.basename(pdf_path).replace('.pdf', '')
    out_dir = f"tmp/jee-main-cropped/{basename}"
    os.makedirs(out_dir, exist_ok=True)
    
    pages = convert_from_path(pdf_path, dpi=200)
    print(f"Extracted {len(pages)} pages.")
    
    current_q_num = 1
    
    for page_num, page_img in enumerate(pages):
        print(f"Processing Page {page_num+1}...")
        img = np.array(page_img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        h, w = gray.shape
        mid_x = w // 2
        
        # Split into left and right columns
        # Give some margin from the edges and center
        left_col = img[:, 50:mid_x-20]
        right_col = img[:, mid_x+20:w-50]
        
        for col_idx, col_img in enumerate([left_col, right_col]):
            if col_img.shape[1] <= 0:
                continue
            
            # Extract text data
            data = pytesseract.image_to_data(col_img, output_type=pytesseract.Output.DICT)
            
            # Find markers
            markers = []
            for i in range(len(data['text'])):
                text = data['text'][i].strip()
                if not text:
                    continue
                y = data['top'][i]
                
                # Check for "1.", "2.", etc.
                if re.match(r'^\d+\.$', text):
                    num = int(text.replace('.', ''))
                    markers.append({'type': 'Q', 'num': num, 'y': y})
                elif text.lower() == 'ans.':
                    markers.append({'type': 'A', 'y': y})
                elif text.lower() == 'sol.':
                    markers.append({'type': 'S', 'y': y})
            
            # Sort markers by Y coordinate
            markers = sorted(markers, key=lambda m: m['y'])
            
            # Process markers to define bounding boxes
            for i in range(len(markers)):
                m = markers[i]
                start_y = max(0, m['y'] - 10)
                end_y = col_img.shape[0] - 10
                
                # The end of this block is the start of the next marker
                if i + 1 < len(markers):
                    end_y = max(0, markers[i+1]['y'] - 10)
                
                # Crop image
                crop_img = col_img[start_y:end_y, :]
                
                if m['type'] == 'Q':
                    current_q_num = m['num']
                    cv2.imwrite(f"{out_dir}/Q{current_q_num}_question.png", crop_img)
                elif m['type'] == 'S':
                    cv2.imwrite(f"{out_dir}/Q{current_q_num}_solution.png", crop_img)
                    
    print(f"Finished {pdf_path}")

if __name__ == '__main__':
    pdfs = ["jee_main_22_jan_shift_1.pdf", "jee_main_22_jan_shift_2.pdf"]
    for p in pdfs:
        if os.path.exists(p):
            process_pdf(p)
        else:
            print(f"Not found: {p}")
