from __future__ import annotations

import json, re, shutil, sys
from pathlib import Path
from xml.etree import ElementTree as ET

QUESTION_RE = re.compile(r"Question\s+(\d+)\s*:?", re.I)
def order(page: int, top: int) -> int: return page * 10_000 + top

def main() -> None:
    if len(sys.argv) != 3: raise SystemExit("Usage: extract_neet_2025_required_visuals.py XML OUTPUT_DIR")
    xml_path, output_dir = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    output_dir.mkdir(parents=True, exist_ok=True); root = ET.parse(xml_path).getroot()
    questions, answers, images = {}, [], []
    for page_node in root.findall("page"):
        page = int(page_node.attrib["number"])
        for child in page_node:
            top = int(child.attrib.get("top", 0))
            if child.tag == "text":
                text = "".join(child.itertext()).strip(); match = QUESTION_RE.search(text)
                if match:
                    number = int(match.group(1))
                    if 1 <= number <= 180 and number not in questions: questions[number] = order(page, top)
                if text.lower().startswith("answer:"): answers.append(order(page, top))
            elif child.tag == "image":
                width, height = int(child.attrib.get("width", 0)), int(child.attrib.get("height", 0))
                if width < 18 or height < 18 or (width > 800 and height > 1100): continue
                images.append({"at":order(page,top),"page":page,"top":top,"left":int(child.attrib.get("left",0)),"width":width,"height":height,"src":child.attrib["src"]})
    if sorted(questions) != list(range(1,181)): raise ValueError(f"Found {len(questions)}/180 starts")
    answers.sort(); manifest=[]
    for number in range(1,181):
        start=questions[number]; answer=next((x for x in answers if x>start),None)
        if answer is None: raise ValueError(f"Q{number}: no answer boundary")
        selected=[x for x in images if start<x["at"]<answer]; files=[]
        for index,image in enumerate(selected,1):
            source=Path(image["src"])
            if not source.is_absolute() and not source.is_file(): source=xml_path.parent/source.name
            destination=output_dir/f"neet-2025-q{number:03d}-visual-{index}{source.suffix.lower() or '.png'}"
            shutil.copyfile(source,destination); files.append({**image,"file":str(destination)})
        manifest.append({"number":number,"visuals":files})
    (output_dir/"visual-manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")
    counts={x["number"]:len(x["visuals"]) for x in manifest if x["visuals"]}
    print(json.dumps({"questions_with_visuals":len(counts),"visuals":sum(counts.values()),"counts":counts}))

if __name__ == "__main__": main()
