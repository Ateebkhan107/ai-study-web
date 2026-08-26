import re
import os
import json

def fix_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    try:
        data = json.loads(content)
        return True, len(data)
    except json.JSONDecodeError as e:
        # Regex to fix unescaped backslashes not followed by valid JSON escape chars (" \ / b f n r t u)
        # In LaTeX JSON strings: \alpha, \frac, \begin, \hat, etc. should be \\alpha, \\frac, etc.
        fixed = re.sub(r'\\(?![/"\\bfnrtu])', r'\\\\', content)
        try:
            data = json.loads(fixed)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return True, len(data)
        except Exception as e2:
            return False, str(e2)

for f in sorted(os.listdir("tmp")):
    if f.endswith(".json") and "jan" in f:
        p = os.path.join("tmp", f)
        ok, res = fix_json_file(p)
        print(f"{f:30s} -> {'OK (' + str(res) + ' items)' if ok else 'FAILED: ' + str(res)}")
