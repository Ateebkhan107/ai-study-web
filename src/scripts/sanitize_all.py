import json
from pathlib import Path
from sanitize_json import fix_json_string

for f in Path("tmp").glob("*apr*.json"):
    text = f.read_text(encoding="utf-8")
    try:
        fixed = fix_json_string(text)
        data = json.loads(fixed)
        f.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f.name, "VALID:", len(data))
    except Exception as e:
        print(f.name, "ERR:", e)
