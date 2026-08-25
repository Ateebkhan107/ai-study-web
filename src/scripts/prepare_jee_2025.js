const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { fromPath } = require("pdf2pic");

// Load .env.local
const envPath = path.join(__dirname, "..", "..", ".env.local");
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

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Please add GEMINI_API_KEY to your .env.local file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Get all PDFs in root matching "selfstudys_com_file"
const rootDir = path.join(__dirname, "..", "..");
const files = fs.readdirSync(rootDir).filter(f => f.startsWith("selfstudys") && f.endsWith(".pdf"));

async function extractPageData(imagePath) {
  const imagePart = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
      mimeType: "image/png"
    },
  };

  const prompt = `
  You are an expert at extracting JEE Main exam questions from images.
  This page contains multiple questions. Extract all of them.
  
  For each question, return a JSON object exactly matching this schema:
  {
    "number": <integer, the question number>,
    "question": "<string, the question text. If heavily image-based, write 'Refer to the source visual.'>",
    "question_type": "<string, either 'MCQ' or 'NUMERICAL'>",
    "option_a": "<string, option A text, or null if NUMERICAL>",
    "option_b": "<string, option B text, or null if NUMERICAL>",
    "option_c": "<string, option C text, or null if NUMERICAL>",
    "option_d": "<string, option D text, or null if NUMERICAL>",
    "correct_option": "<string, 'a', 'b', 'c', or 'd', or null if NUMERICAL>",
    "numerical_answer": "<number, the numeric answer if NUMERICAL, or null if MCQ>",
    "explanation": "<string, detailed solution text>",
    "subject": "<string, 'Physics', 'Chemistry', or 'Maths'>",
    "chapter": "<string, guess the JEE chapter name>"
  }
  
  Return a JSON array containing all questions found on this page. Do not include markdown formatting or backticks. Just the raw JSON array.
  `;

  const result = await model.generateContent([prompt, imagePart]);
  let text = result.response.text().trim();
  if (text.startsWith("\`\`\`json")) text = text.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON for page:", text);
    return [];
  }
}

async function processPDF(pdfFile, shiftNumber) {
//   console.log(`\n=============================================`);
//   console.log(`Processing ${pdfFile} (Shift ${shiftNumber})`);
  const pdfPath = path.join(rootDir, pdfFile);
  const outputDir = path.join(rootDir, "tmp", `jee-main-2025-shift-${shiftNumber}`);
  const imagesDir = path.join(outputDir, "question-images");
  fs.mkdirSync(imagesDir, { recursive: true });

  const options = {
    density: 300,
    saveFilename: "page",
    savePath: imagesDir,
    format: "png",
    width: 2480,
    height: 3508
  };
  const storeAsImage = fromPath(pdfPath, options);

  let allQuestions = [];
  
  // Hardcoded to 30 pages max to prevent infinite loops, adjust if PDFs are longer
  for (let pageNum = 1; pageNum <= 30; pageNum++) {
    try {
//       console.log(\`   Converting page \${pageNum} to image...\`);
      const img = await storeAsImage(pageNum);
      const imgPath = img.path;

//       console.log(`   Extracting questions via Gemini from page ${pageNum}...`);
      const questionsOnPage = await extractPageData(imgPath);
      
      for (const q of questionsOnPage) {
        q.exam = "JEE Main";
        q.year = 2025;
        q.attempt = "January Session";
        q.shift = `Shift ${shiftNumber}`;
        q.image_path = imgPath; // Storing the full page as the image for now
        allQuestions.push(q);
      }
      
//       console.log(`   Found ${questionsOnPage.length} questions.`);
    } catch (err) {
      if (err.message && (err.message.includes("could not load pdf") || err.message.includes("Page number out of range") || err.message.includes("does not exist"))) {
//         console.log(`   Reached end of PDF at page ${pageNum - 1}.`);
        break;
      }
      console.error(`Error on page ${pageNum}:`, err);
    }
  }

  // Deduplicate and sort
  allQuestions = allQuestions.filter((v,i,a)=>a.findIndex(v2=>(v2.number===v.number))===i);
  allQuestions.sort((a, b) => a.number - b.number);

//   console.log(`Total unique questions found: ${allQuestions.length}`);

  const manifestPath = path.join(outputDir, `jee-main-2025-shift-${shiftNumber}-manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(allQuestions, null, 2));
//   console.log(`Saved manifest to ${manifestPath}`);
}

async function run() {
  for (let i = 0; i < files.length; i++) {
    // Determine shift number 1-10
    let shiftNumber = i + 1;
    // You can add logic to extract shift dynamically from file name if needed
    await processPDF(files[i], shiftNumber);
  }
//   console.log("\\nALL PDFS PROCESSED SUCCESSFULLY!");
}

run();
