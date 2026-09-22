from PIL import Image
import os

icons = ["dashboard", "test", "pyq", "community", "analytics", "profile"]
base_dir = "/Users/ateebmazhar/Desktop/ai-study-web/public/nav-icons"

def remove_background(input_path, output_path, tolerance=25):
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"Skipping {input_path}")
        return
        
    width, height = img.size
    pixels = img.load()
    
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
        
        if r <= tolerance and g <= tolerance and b <= tolerance:
            pixels[x, y] = (0, 0, 0, 0)
            to_visit.append((x+1, y))
            to_visit.append((x-1, y))
            to_visit.append((x, y+1))
            to_visit.append((x, y-1))

    # Optional: basic feathering / edge cleaning
    # We can leave it as is to avoid destroying the neon edges.
    
    img.save(output_path, "PNG")
    print(f"Processed {output_path}")

for icon in icons:
    input_path = os.path.join(base_dir, f"{icon}_new.jpg")
    if not os.path.exists(input_path):
        input_path = os.path.join(base_dir, f"{icon}.jpg")
    output_path = os.path.join(base_dir, f"{icon}.png")
    remove_background(input_path, output_path, tolerance=20)
