import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader
import pdfplumber
from PIL import Image

QUESTION_RE = re.compile(r"(?im)^\s*Question\s+(\d+)\s*:")
SOLUTION_RE = re.compile(r"(?i)S\s*o\s*l\s*u\s*t\s*i\s*o\s*n\s*:")

def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()

def extract_solution_images(pdf_path: Path, output_dir: Path, year: int) -> dict[int, str]:
    text = "\n".join((page.extract_text() or "") for page in PdfReader(pdf_path).pages)
    text = text.replace("Qu\nestion", "Question")
    
    # Same logic to find questions
    all_matches = list(QUESTION_RE.finditer(text))
    starts = []
    seen = set()
    for match in all_matches:
        num = int(match.group(1))
        if num not in seen and 1 <= num <= 200:
            seen.add(num)
            starts.append(match)
    
    starts.sort(key=lambda m: int(m.group(1)))
    numbers = [int(match.group(1)) for match in starts]
    
    pdf = pdfplumber.open(pdf_path)
    # Find locations of "Question X" and "Solution:"
    page_locations = {} # number -> {'q_page', 'q_y', 's_page', 's_y'}
    
    current_q = 0
    
    for page_index, page in enumerate(pdf.pages):
        words = page.extract_words(use_text_flow=True, keep_blank_chars=False)
        for index, word in enumerate(words):
            x0, y0, x1, y1 = word["x0"], word["top"], word["x1"], word["bottom"]
            w_text = word["text"].lower()
            
            is_question = w_text == "question"
            if not is_question and w_text == "estion" and index > 0 and words[index-1]["text"].lower() == "qu":
                is_question = True
            
            if is_question and index + 1 < len(words):
                digits = re.sub(r"\D", "", words[index + 1]["text"])
                if digits and 1 <= int(digits) <= 200:
                    number = int(digits)
                    if number not in page_locations:
                        page_locations[number] = {"q_page": page_index, "q_y": y0}
                        current_q = number
            
            if w_text.startswith("solution") and current_q > 0:
                if "s_page" not in page_locations[current_q]:
                    page_locations[current_q]["s_page"] = page_index
                    page_locations[current_q]["s_y"] = y0

    output_paths = {}
    image_dir = output_dir / "solution-images"
    image_dir.mkdir(parents=True, exist_ok=True)
    
    for number in numbers:
        if number not in page_locations:
            continue
        
        loc = page_locations[number]
        if "s_page" not in loc:
            # No solution found for this question
            continue
            
        start_page = loc["s_page"]
        start_y = max(0, loc["s_y"] - 10)
        
        end_page = None
        end_y = None
        
        # End is the start of the next question, or end of document
        if number + 1 in page_locations:
            next_loc = page_locations[number + 1]
            end_page = next_loc["q_page"]
            end_y = max(0, next_loc["q_y"] - 10)
        else:
            # Last question
            end_page = len(pdf.pages) - 1
            end_y = pdf.pages[end_page].height
            
        parts = []
        for p in range(start_page, end_page + 1):
            page = pdf.pages[p]
            clip_y0 = start_y if p == start_page else 0
            clip_y1 = end_y if p == end_page else page.height
            
            if clip_y1 > clip_y0 + 5: # Valid height
                bbox = (0, clip_y0, page.width, clip_y1)
                img = page.crop(bbox).to_image(resolution=300).original
                parts.append(img)
                
        if parts:
            total_height = sum(p.height for p in parts) + (len(parts) - 1) * 12
            combined = Image.new("RGB", (parts[0].width, total_height), "white")
            offset = 0
            for part in parts:
                combined.paste(part, (0, offset))
                offset += part.height + 12
            path = image_dir / f"neet-ug-{year}-solution-{number:03d}.png"
            combined.save(path, "PNG", optimize=True)
            output_paths[number] = str(path)
            
    return output_paths

def main():
    pdf_2023 = Path("NEET_2023_Question_Paper_with_Solutions_no_watermark.pdf").resolve()
    pdf_2024 = Path("NEET_UG_2024_Question_Paper_with_Solutions_no_watermark.pdf").resolve()
    
    paths_2023 = extract_solution_images(pdf_2023, Path("tmp/neet-ug-2023").resolve(), 2023)
    paths_2024 = extract_solution_images(pdf_2024, Path("tmp/neet-ug-2024").resolve(), 2024)
    
    Path("tmp/neet-ug-2023-solutions.json").write_text(json.dumps(paths_2023, indent=2))
    Path("tmp/neet-ug-2024-solutions.json").write_text(json.dumps(paths_2024, indent=2))
    print(f"Extracted {len(paths_2023)} solutions for 2023 and {len(paths_2024)} solutions for 2024")

if __name__ == "__main__":
    main()
