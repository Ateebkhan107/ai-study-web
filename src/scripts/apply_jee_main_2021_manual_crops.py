"""Apply visually verified diagram crop boxes and normalize their backgrounds."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]


def main(paper_code: str, subject: str) -> None:
    crop_manifest = ROOT / "scratch/jee2021/manual-crops" / f"{paper_code}_{subject}.json"
    entries = json.loads(crop_manifest.read_text())
    pages = ROOT / "scratch/jee2021/local" / paper_code / subject.lower() / "pages"
    destination = ROOT / "scratch/jee2021/images" / paper_code
    raw_dir = ROOT / "scratch/jee2021/manual-crops/raw" / paper_code
    raw_dir.mkdir(parents=True, exist_ok=True)
    destination.mkdir(parents=True, exist_ok=True)

    cleaner = ROOT / "src/scripts/clean_jee_main_2021_crop.py"
    created: dict[str, str] = {}
    for entry in entries:
        source = ROOT / entry["source"] if entry.get("source") else pages / f"page-{entry['page']}.png"
        local_output = entry["output"]
        offset = {"Physics": 0, "Chemistry": 30, "Mathematics": 60}[subject]
        match = re.fullmatch(r"q(\d+)(.*\.png)", local_output)
        if not match:
            raise ValueError(f"Unexpected crop name: {local_output}")
        stored_output = f"q{int(match.group(1)) + offset}{match.group(2)}"
        raw = raw_dir / stored_output
        with Image.open(source) as image:
            cropped = image.crop(tuple(entry["box"])) if entry.get("box") else image.copy()
            cropped.save(raw)
        subprocess.run(
            [sys.executable, str(cleaner), str(raw), str(destination / stored_output)],
            check=True,
        )
        created[local_output] = str((destination / stored_output).resolve())

    transcription_path = ROOT / "scratch/jee2021/transcribed" / f"{paper_code}_{subject}.json"
    rows = json.loads(transcription_path.read_text())
    for row in rows:
        number = row["local_number"]
        row["question_image"] = created.get(f"q{number}.png")
        for letter in "abcd":
            row[f"option_{letter}_image"] = created.get(f"q{number}_opt_{letter}.png")
    transcription_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")

    print(f"Created {len(entries)} cleaned crops in {destination}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: apply_jee_main_2021_manual_crops.py PAPER_CODE SUBJECT")
    main(sys.argv[1], sys.argv[2])
