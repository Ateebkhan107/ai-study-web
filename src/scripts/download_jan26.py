import os
import gdown

DRIVE_FILES = [
    ("paper_1", "1vgt5bghFO2ssdAwtOJIo7zM-cOgAlQK8"),
    ("paper_2", "1D9HgKkhzdB7CeD1k8kLUFVfGSxW6ZFKn"),
    ("paper_3", "1VsXx0gZba0Aj_U0d2OVOjhooaeGTAe_c"),
    ("paper_4", "1OQpFG9ZU_h8kKc68lEDa7WTO1KX6M0PL"),
    ("paper_5", "1izw8wOtTuWclwpFzNPY7O0XPc8VHtBvX"),
    ("paper_6", "1db0HGDhCpw2JjFyiUfaT4rewmBfjBf99"),
    ("paper_7", "12OfK_H7Dlabs4SPIUe9t-vusUhjQ00sb"),
    ("paper_8", "1S_TM1UgPXoDVT3FBdE056id8een6bnZ5"),
    ("paper_9", "1AwMQwa6K2BEnwJEQVkzuKo5ISLyTZZ9D"),
    ("paper_10", "1QMRolXRgZyUkbfrn34cYeTP9R575u_YJ"),
    ("answer_key", "1Fw6X6d1EEhe7DFBGlXv88b9VmL03Wigj"),
]

out_dir = "tmp/jee-main-2026-jan/pdfs"
os.makedirs(out_dir, exist_ok=True)

for name, file_id in DRIVE_FILES:
    out_path = os.path.join(out_dir, f"{name}.pdf")
    print(f"\nDownloading {name} ({file_id})...")
    gdown.download(id=file_id, output=out_path, quiet=False)
    print(f"Downloaded {out_path} ({os.path.getsize(out_path)} bytes)")

print("\nALL 11 FILES DOWNLOADED SUCCESSFULLY!")
