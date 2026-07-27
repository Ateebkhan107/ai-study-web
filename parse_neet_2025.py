import os
import re
import json

pdf_path = "/Users/ateebfatmi/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/EE89D0F9-47ED-4CD9-84FD-CF229363E08A/NEET UG 2025 Question Paper with Solutions_ FREE PDF Download.pdf"

# Read environment variables from .env.local
env_vars = {}
env_file = ".env.local"
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                env_vars[k.strip()] = v.strip().strip("'\"")

import pypdf
reader = pypdf.PdfReader(pdf_path)
full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n"

print(f"Extracted {len(full_text)} characters from {len(reader.pages)} pages.")

# Pattern to split by Question X:
q_blocks = re.split(r'Question\s+(\d+):', full_text)
print(f"Found {len(q_blocks)//2} potential question blocks.")
