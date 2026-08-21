from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from xml.etree import ElementTree as ET


QUESTION_RE = re.compile(r"Question\s+(\d+)\s*:?")


def order(page: int, top: int) -> int:
    return page * 10_000 + top


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: extract_neet_2024_required_visuals.py PDF2HTML_XML OUTPUT_DIR")
    xml_path = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    root = ET.parse(xml_path).getroot()

    questions: dict[int, int] = {}
    answers: list[tuple[int, int]] = []
    images: list[dict] = []
    for page_node in root.findall("page"):
        page = int(page_node.attrib["number"])
        for child in page_node:
            top = int(child.attrib.get("top", 0))
            if child.tag == "text":
                text = "".join(child.itertext()).strip()
                match = QUESTION_RE.search(text)
                if match:
                    number = int(match.group(1))
                    if 1 <= number <= 200 and number not in questions:
                        questions[number] = order(page, top)
                if text.startswith("Answer:"):
                    answers.append((order(page, top), page))
            elif child.tag == "image":
                width = int(child.attrib.get("width", 0))
                height = int(child.attrib.get("height", 0))
                left = int(child.attrib.get("left", 0))
                # Repeated PDF page branding: central translucent seal and header logo.
                if (500 <= width <= 520 and 500 <= height <= 520) or (130 <= width <= 150 and 30 <= height <= 45 and top < 100):
                    continue
                images.append({
                    "at": order(page, top), "page": page, "top": top, "left": left,
                    "width": width, "height": height, "src": child.attrib["src"],
                })

    if sorted(questions) != list(range(1, 201)):
        missing = sorted(set(range(1, 201)) - set(questions))
        raise ValueError(f"Found {len(questions)}/200 question starts; missing={missing}")
    answers.sort()
    manifest = []
    for number in range(1, 201):
        start = questions[number]
        answer = next((at for at, _ in answers if at > start), None)
        if answer is None:
            raise ValueError(f"Q{number}: no following answer boundary")
        selected = [image for image in images if start < image["at"] < answer]
        files = []
        for index, image in enumerate(selected, 1):
            source = xml_path.parent / image["src"]
            suffix = source.suffix.lower() or ".png"
            destination = output_dir / f"neet-2024-q{number:03d}-visual-{index}{suffix}"
            shutil.copyfile(source, destination)
            files.append({**image, "file": str(destination)})
        manifest.append({"number": number, "visuals": files})

    (output_dir / "visual-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    counts = {item["number"]: len(item["visuals"]) for item in manifest if item["visuals"]}
    print(json.dumps({"questions_with_visuals": len(counts), "visuals": sum(counts.values()), "counts": counts}))


if __name__ == "__main__":
    main()
