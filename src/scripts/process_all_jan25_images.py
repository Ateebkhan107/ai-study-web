import fitz
import json
import os
import glob
import re
from PIL import Image
import numpy as np

def detect_diagram_in_image(pil_img):
    """
    Analyzes an image to detect if it has a non-text graphic (lines, curves, circuits, diagrams, plots).
    Returns (has_diagram, crop_bbox)
    """
    # Convert to grayscale numpy array
    img_gray = pil_img.convert("L")
    arr = np.array(img_gray)
    
    # White background threshold
    is_ink = arr < 220
    
    # If no ink, return False
    if not np.any(is_ink):
        return False, None
        
    # Get bounding box of all ink
    rows = np.any(is_ink, axis=1)
    cols = np.any(is_ink, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    return True, (cmin, rmin, cmax, rmax)

print("Diagram detector ready")
