import re

def polish_latex(s):
    if not s:
        return ""
    # Strip footer noise
    s = re.sub(r'\^\{J[oO]\}[\s\S]*', '', s)
    s = re.sub(r'(?i)Join the Most Relevant[\s\S]*', '', s)
    s = re.sub(r'(?i)JEE Main Previous Year Paper[\s\S]*', '', s)
    s = re.sub(r'(?i)Question Paper\s*MathonGo[\s\S]*', '', s)
    s = re.sub(r'(?i)https?://[^\s]+', '', s)
    s = re.sub(r'(?i)J\s*EE\s*Main\s*2013\s*\([^)]*\)', '', s)

    # Clean double superscripts / subscripts
    s = re.sub(r'\^\{\s*\}', '', s)
    s = re.sub(r'_\{\s*\}', '', s)
    s = re.sub(r'\^\{([^}]+)\}\^\{([^}]*)\}', r'^{\1\2}', s)
    s = re.sub(r'_\{\s*([0-9a-zA-Z]+)\s*\}', r'_{\1}', s)
    s = re.sub(r'\^\{\s*([0-9a-zA-Z\+\-]+)\s*\}', r'^{\1}', s)

    # Variables with powers like ax^{2} -> $ax^2$
    s = re.sub(r'(?<!\$)\b([a-zA-Z][\^_]\{[0-9a-zA-Z\+\-]+\})(?!\$)', lambda m: f"${m.group(1)}$", s)
    
    # a, b, c \in R -> $a, b, c \in \mathbb{R}$
    s = re.sub(r'(?<!\$)\b([a-zA-Z],\s*[a-zA-Z],\s*[a-zA-Z]\s*\\in\s*R)(?!\$)', lambda m: r"$a, b, c \in \mathbb{R}$", s)
    
    # a : b : c -> $a : b : c$
    s = re.sub(r'(?<!\$)\b([a-zA-Z]\s*:\s*[a-zA-Z]\s*:\s*[a-zA-Z])(?!\$)', lambda m: f"${m.group(1)}$", s)

    # Fix internal spacing in $ ... $
    s = re.sub(r'\$\s*([^\$]+?)\s*\$', lambda m: f"${m.group(1).strip()}$", s)
    
    # Fix spacing around $ ... $
    s = re.sub(r'([a-zA-Z0-9,\.\?\)])\$([^\$]+)\$', lambda m: f"{m.group(1)} ${m.group(2)}$", s)
    s = re.sub(r'\$([^\$]+)\$([a-zA-Z0-9\(])', lambda m: f"${m.group(1)}$ {m.group(2)}", s)

    s = re.sub(r'[ \t]+', ' ', s)
    return s.strip()

print("Loaded polish_latex.")
