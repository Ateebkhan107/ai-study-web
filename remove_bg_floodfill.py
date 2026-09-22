from PIL import Image
import sys

def remove_background(input_path, output_path, tolerance=15):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Flood fill starting from the corners
    to_visit = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    visited = set()
    
    while to_visit:
        x, y = to_visit.pop()
        if (x, y) in visited:
            continue
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        visited.add((x, y))
        r, g, b, a = pixels[x, y]
        
        # If it's close to black
        if r <= tolerance and g <= tolerance and b <= tolerance:
            pixels[x, y] = (0, 0, 0, 0)
            to_visit.append((x+1, y))
            to_visit.append((x-1, y))
            to_visit.append((x, y+1))
            to_visit.append((x, y-1))

    img.save(output_path, "PNG")

remove_background('/Users/ateebmazhar/Desktop/ai-study-web/public/nav-icons/test_new.jpg', '/Users/ateebmazhar/Desktop/ai-study-web/public/nav-icons/test.png')
print("Done")
