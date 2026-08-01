"""Extract ordered final answers for JEE Advanced 2023 from the blue key overlays."""
import json, re, subprocess
from pathlib import Path
from PIL import Image

ROOT = Path.cwd()
KEY_ROOT = ROOT / "tmp" / "jee-advanced-answer-keys"

for paper in (1, 2):
    answers = []
    page_answers = []
    pages = sorted((KEY_ROOT / f"2023-p{paper}-pages").glob("page-*.png"))
    mask_path = KEY_ROOT / "blue-mask.png"
    for page in pages:
        image = Image.open(page).convert("RGB")
        source = image.load()
        mask = Image.new("RGB", image.size, "white")
        target = mask.load()
        for y in range(image.height):
            for x in range(image.width):
                red, green, blue = source[x, y]
                if blue > 100 and blue > red * 1.25 and blue > green * 1.1:
                    target[x, y] = (0, 0, 0)
        mask.save(mask_path)
        result = subprocess.run(["tesseract", str(mask_path), "stdout", "--psm", "6"], text=True, capture_output=True, check=True)
        for line in result.stdout.splitlines():
            line = line.strip()
            match = re.search(r"Answer\s*:\s*(.+)$", line, re.I)
            range_value = re.match(r"^(-?\d+(?:\.\d+)?)\s*\.?(?:\s+Range\b)", line, re.I)
            if match:
                answers.append(match.group(1).strip())
                page_answers.append((page.name, match.group(1).strip()))
            elif range_value:
                answers.append(range_value.group(1))
                page_answers.append((page.name, range_value.group(1)))
            elif re.fullmatch(r"[\[\]()\d.,+\- ]+(?:(?:OR|or|to)[\[\]()\d.,+\- ]+)*", line) and re.search(r"\d", line):
                answers.append(line)
                page_answers.append((page.name, line))
        if paper == 2 and page.name in {"page-20.png", "page-21.png"}:
            answers.append("MARKS TO ALL")
            page_answers.append((page.name, "MARKS TO ALL"))
    if len(answers) != 51:
        raise ValueError(f"2023 paper {paper}: expected 51 blue answers, found {len(answers)}: {page_answers}")
    output = KEY_ROOT / f"2023-p{paper}-answers.json"
    output.write_text(json.dumps(answers, indent=2))
    print(json.dumps({"year": 2023, "paper": paper, "answers": len(answers)}))
