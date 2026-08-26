import json
import re
from pathlib import Path

files = [
    '02apr_s2_chem.json',
    '02apr_s2_physics.json',
    '02apr_s2_maths.json',
    '04apr_s1_chem.json',
    '04apr_s1_physics.json',
    '04apr_s1_maths.json',
]

def fix_json_string(s: str) -> str:
    # Protect valid JSON escapes: \\, \", \n, \r, \t, \b, \f, \/
    # Replace all other backslashes with double backslash
    out = []
    i = 0
    n = len(s)
    while i < n:
        if s[i] == '\\':
            if i + 1 < n:
                nxt = s[i+1]
                if nxt in {'\\', '"', 'n', 'r', 't', 'b', 'f', '/'}:
                    out.append('\\' + nxt)
                    i += 2
                    continue
                elif nxt == 'u' and i + 5 <= n and all(c in '0123456789abcdefABCDEF' for c in s[i+2:i+6]):
                    out.append(s[i:i+6])
                    i += 6
                    continue
            out.append('\\\\')
            i += 1
        else:
            out.append(s[i])
            i += 1
    return "".join(out)

for fname in files:
    p = Path('tmp') / fname
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    fixed = fix_json_string(text)
    try:
        data = json.loads(fixed)
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
        print(f"{fname}: VALID, items = {len(data)}")
    except Exception as e:
        print(f"{fname}: ERROR: {e}")
