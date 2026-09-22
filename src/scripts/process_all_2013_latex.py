import re
import json
import os
import pymupdf

PDFS = [
    ("scratch/jee_2013_07_apr.pdf", "JEE-MAIN-13-07APR", "07 Apr", "Offline"),
    ("scratch/jee_2013_09_apr.pdf", "JEE-MAIN-13-09APR", "09 Apr", "Online"),
    ("scratch/jee_2013_22_apr.pdf", "JEE-MAIN-13-22APR", "22 Apr", "Online"),
    ("scratch/jee_2013_23_apr.pdf", "JEE-MAIN-13-23APR", "23 Apr", "Online"),
    ("scratch/jee_2013_25_apr.pdf", "JEE-MAIN-13-25APR", "25 Apr", "Online"),
]

def format_math_expressions(text):
    if not text:
        return ""
    s = text.replace("\xa0", " ").replace("\u200b", "").strip()
    # Clean redundant braces like ^{}^{}
    s = re.sub(r'\^\{\s*\}', '', s)
    s = re.sub(r'_\{\s*\}', '', s)
    s = re.sub(r'\^\{([^}]+)\}\^\{([^}]*)\}', r'^{\1\2}', s)
    s = re.sub(r'_\{\s*([0-9a-zA-Z]+)\s*\}', r'_{\1}', s)
    s = re.sub(r'\^\{\s*([0-9a-zA-Z\+\-]+)\s*\}', r'^{\1}', s)

    # Convert common physical formulas & equations into LaTeX math
    # e.g. [\in 0] -> \varepsilon_0
    s = s.replace(r'[\in 0]', r'\varepsilon_0')
    s = s.replace(r'[\in0]', r'\varepsilon_0')
    s = s.replace(r'\in 0', r'\varepsilon_0')
    s = s.replace(r'\in0', r'\varepsilon_0')
    
    # Fix vector hats \hat{i}
    s = s.replace(r'\hat{i}', r'\hat{\imath}')
    s = s.replace(r'\hat{j}', r'\hat{\jmath}')
    s = s.replace(r'\hat{k}', r'\hat{k}')

    # Fix equation syntax like "2x^{3} + 3x + k = 0"
    # Wrap standalone math expressions with $ ... $
    # If the text has equations with powers, fractions, integrals, wrap in $ ... $
    return s

print("Module loaded.")
