import fitz # PyMuPDF
doc = fitz.open("jee_main_22_jan_shift_1.pdf")
page = doc[0]
images = page.get_images()
print("Page 1 Images count:", len(images))
print("Page 1 Text length:", len(page.get_text()))
blocks = page.get_text("dict")["blocks"]
print("Page 1 Blocks count:", len(blocks))
for img in images:
    print(img)
