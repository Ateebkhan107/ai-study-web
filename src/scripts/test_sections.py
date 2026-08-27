import fitz
import re

def inspect_sections(pdf_path):
    doc = fitz.open(pdf_path)
    for pno in range(len(doc)):
        page = doc[pno]
        txt = page.get_text("text")
        sec_matches = re.findall(r"(?:Math|Physics|Chem)\s+Sec\s+[12]", txt)
        print(f"Page {pno+1}: Sections found -> {sec_matches}")

inspect_sections("tmp/jee-main-jan/pdfs/21jan_s1.pdf")
