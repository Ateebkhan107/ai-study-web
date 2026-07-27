const fs = require("fs");
const path = require("path");

const pdfPath = "/Users/ateebfatmi/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/EE89D0F9-47ED-4CD9-84FD-CF229363E08A/NEET UG 2025 Question Paper with Solutions_ FREE PDF Download.pdf";

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function parsePDF() {
  const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  console.log(`Extracted text from ${pdf.numPages} pages. Length: ${fullText.length}`);
  return fullText;
}

parsePDF();
