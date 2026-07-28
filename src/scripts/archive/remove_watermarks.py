import os
import cv2
import numpy as np
from pathlib import Path

def remove_vedantu_watermark(image_path, output_path):
    """
    Remove Vedantu watermarks and branding from NEET question images.
    """
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Failed to read {image_path}")
        return False
    
    height, width = img.shape[:2]
    
    # AGGRESSIVE CORNER REMOVAL - Remove larger areas for branding
    # Top right corner (Vedantu logo area) - expanded area
    top_right_roi = img[0:250, width-350:width]
    top_right_roi[:] = [255, 255, 255]
    
    # Top left corner - expanded area
    top_left_roi = img[0:150, 0:300]
    top_left_roi[:] = [255, 255, 255]
    
    # Bottom right corner (often has website URLs) - expanded area
    bottom_right_roi = img[height-120:height, width-400:width]
    bottom_right_roi[:] = [255, 255, 255]
    
    # Bottom left corner
    bottom_left_roi = img[height-100:height, 0:250]
    bottom_left_roi[:] = [255, 255, 255]
    
    # Convert to grayscale for text detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Create mask for watermark removal
    mask = np.zeros(gray.shape, np.uint8)
    
    # Method 1: Detect light gray/white text watermarks (typical Vedantu style)
    # Vedantu watermarks are often semi-transparent light text
    _, thresh_light = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    contours_light, _ = cv2.findContours(thresh_light, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for contour in contours_light:
        area = cv2.contourArea(contour)
        if 50 < area < 10000:
            x, y, w, h = cv2.boundingRect(contour)
            # Check aspect ratio - text is typically wider than tall
            aspect_ratio = w / h if h > 0 else 0
            if 2 < aspect_ratio < 20:
                cv2.rectangle(mask, (x-5, y-5), (x+w+5, y+h+5), 255, -1)
    
    # Method 2: Detect diagonal text patterns using edge detection
    edges = cv2.Canny(gray, 50, 150)
    kernel_diag = np.array([[-1, -1, -1], [2, 2, 2], [-1, -1, -1]])
    diagonal_edges = cv2.filter2D(edges, -1, kernel_diag)
    _, diag_thresh = cv2.threshold(diagonal_edges, 50, 255, cv2.THRESH_BINARY)
    mask = cv2.bitwise_or(mask, diag_thresh)
    
    # Method 3: AGGRESSIVE color pattern removal for Vedantu branding
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Expanded orange/red color ranges (Vedantu brand colors)
    lower_orange1 = np.array([0, 30, 30])
    upper_orange1 = np.array([30, 255, 255])
    orange_mask1 = cv2.inRange(hsv, lower_orange1, upper_orange1)
    
    lower_orange2 = np.array([10, 50, 50])
    upper_orange2 = np.array([25, 255, 255])
    orange_mask2 = cv2.inRange(hsv, lower_orange2, upper_orange2)
    
    # Red ranges
    lower_red1 = np.array([0, 50, 50])
    upper_red1 = np.array([10, 255, 255])
    red_mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    
    lower_red2 = np.array([170, 50, 50])
    upper_red2 = np.array([180, 255, 255])
    red_mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    
    # Combine all color masks
    brand_mask = cv2.bitwise_or(orange_mask1, orange_mask2)
    brand_mask = cv2.bitwise_or(brand_mask, red_mask1)
    brand_mask = cv2.bitwise_or(brand_mask, red_mask2)
    
    # Remove brand colors in ALL areas (not just corners) to catch the "V" logo
    # But be more aggressive in corners
    corner_mask = np.zeros_like(brand_mask)
    corner_mask[0:300, :] = 255  # Top strip - expanded
    corner_mask[height-250:height, :] = 255  # Bottom strip - expanded
    corner_mask[:, 0:300] = 255  # Left strip - expanded
    corner_mask[:, width-350:width] = 255  # Right strip - expanded
    
    # Combine corner mask with full image mask for aggressive removal
    full_mask = np.ones_like(brand_mask) * 255
    brand_mask_corners = cv2.bitwise_and(brand_mask, brand_mask, mask=corner_mask)
    brand_mask_full = cv2.bitwise_or(brand_mask_corners, cv2.bitwise_and(brand_mask, brand_mask, mask=full_mask))
    
    mask = cv2.bitwise_or(mask, brand_mask_full)
    
    # Dilate mask to cover surrounding area
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.dilate(mask, kernel, iterations=3)
    
    # Inpaint to remove detected watermarks
    if cv2.countNonZero(mask) > 0:
        img = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    
    # Additional pass: AGGRESSIVE removal of any remaining patterns
    gray_final = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Remove very light patterns (watermarks are often light)
    _, thresh_final = cv2.threshold(gray_final, 220, 255, cv2.THRESH_BINARY)
    contours_final, _ = cv2.findContours(thresh_final, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    mask_final = np.zeros(gray.shape, np.uint8)
    for contour in contours_final:
        area = cv2.contourArea(contour)
        # Wider range to catch more watermark patterns
        if 10 < area < 5000:
            x, y, w, h = cv2.boundingRect(contour)
            # Remove in outer regions AND also check for diagonal patterns
            is_outer = (x < 200 or x > width - 200 or y < 200 or y > height - 200)
            # Check for diagonal/wide aspect ratio (typical of watermarks)
            aspect_ratio = w / h if h > 0 else 0
            is_diagonal = aspect_ratio > 3 or aspect_ratio < 0.33
            
            if is_outer or is_diagonal:
                cv2.rectangle(mask_final, (x-5, y-5), (x+w+5, y+h+5), 255, -1)
    
    if cv2.countNonZero(mask_final) > 0:
        kernel = np.ones((5, 5), np.uint8)
        mask_final = cv2.dilate(mask_final, kernel, iterations=3)
        img = cv2.inpaint(img, mask_final, 5, cv2.INPAINT_TELEA)
    
    # Final pass: Morphological opening to remove small isolated bright spots
    kernel_open = np.ones((3, 3), np.uint8)
    gray_final = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    opened = cv2.morphologyEx(gray_final, cv2.MORPH_OPEN, kernel_open)
    
    # Find regions where opened is significantly different (likely watermarks)
    diff = cv2.absdiff(gray_final, opened)
    _, diff_thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
    
    # Only remove in corners/edges for this final pass
    corner_mask_final = np.zeros_like(diff_thresh)
    corner_mask_final[0:250, :] = 255
    corner_mask_final[height-200:height, :] = 255
    corner_mask_final[:, 0:250] = 255
    corner_mask_final[:, width-300:width] = 255
    
    diff_thresh = cv2.bitwise_and(diff_thresh, diff_thresh, mask=corner_mask_final)
    
    if cv2.countNonZero(diff_thresh) > 0:
        kernel = np.ones((7, 7), np.uint8)
        diff_thresh = cv2.dilate(diff_thresh, kernel, iterations=2)
        img = cv2.inpaint(img, diff_thresh, 7, cv2.INPAINT_TELEA)
    
    # Save the processed image
    cv2.imwrite(output_path, img)
    return True

def process_all_images(input_dir, output_dir):
    """
    Process all PNG images in the input directory to remove watermarks.
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Get all PNG files
    png_files = sorted(input_path.glob("*.png"))
    
    print(f"Found {len(png_files)} images to process")
    
    success_count = 0
    for i, png_file in enumerate(png_files, 1):
        output_file = output_path / png_file.name
        
        if remove_vedantu_watermark(str(png_file), str(output_file)):
            success_count += 1
            print(f"[{i}/{len(png_files)}] Processed: {png_file.name}")
        else:
            print(f"[{i}/{len(png_files)}] Failed: {png_file.name}")
    
    print(f"\nCompleted: {success_count}/{len(png_files)} images processed successfully")
    return success_count

if __name__ == "__main__":
    # Directory containing the NEET 2025 question images
    input_directory = "/Users/ateebfatmi/Desktop/prepzii/tmp/neet-ug-2025-clean/question-images"
    # Output directory for cleaned images
    output_directory = "/Users/ateebfatmi/Desktop/prepzii/tmp/neet-ug-2025-clean/question-images-cleaned"
    
    process_all_images(input_directory, output_directory)
