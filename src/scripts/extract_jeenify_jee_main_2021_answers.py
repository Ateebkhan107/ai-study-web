#!/usr/bin/env python3
"""Extract the 90 schema.org question/accepted-answer pairs from JEEnify HTML."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("html", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    source = args.html.read_text(encoding="utf-8")
    marker = '{"@context":"https://schema.org","@graph":'
    quiz = None
    cursor = 0
    while True:
        start = source.find(marker, cursor)
        if start < 0:
            break
        payload, consumed = json.JSONDecoder().raw_decode(source[start:])
        graph = payload.get("@graph", [])
        quiz = next((item for item in graph if item.get("@type") == "Quiz"), None)
        if quiz:
            break
        cursor = start + consumed
    if not quiz:
        raise SystemExit("Quiz node was not found")
    rows = []
    for index, item in enumerate(quiz.get("hasPart", []), 1):
        rows.append({
            "source_number": index,
            "question": item.get("name", ""),
            "answer": item.get("acceptedAnswer", {}).get("text", ""),
        })
    if len(rows) != 90:
        raise SystemExit(f"Expected 90 answers, found {len(rows)}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"questions": len(rows), "output": str(args.output)}))


if __name__ == "__main__":
    main()
