const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

const imageDir = "/Users/ateebfatmi/Desktop/prepzii/tmp/neet-ug-2025-clean/question-images";
const storagePath = "pyq-images/neet-ug-2025/narmada-48";

async function uploadCleanedImages() {
  const files = fs.readdirSync(imageDir).filter(f => f.endsWith('.png')).sort();
  
  console.log(`Found ${files.length} images to upload`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imageDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Extract question number from filename
    const match = file.match(/question-(\d+)\.png/);
    if (!match) {
      console.log(`Skipping ${file} - no question number found`);
      continue;
    }
    
    const questionNum = parseInt(match[1], 10);
    const storageFileName = `question-${String(questionNum).padStart(3, '0')}.png`;
    const fullPath = `${storagePath}/${storageFileName}`;
    
    try {
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('pyq-images')
        .upload(fullPath, fileBuffer, {
          upsert: true,
          contentType: 'image/png'
        });
      
      if (error) {
        console.error(`[${i+1}/${files.length}] Error uploading ${file}:`, error.message);
        errorCount++;
      } else {
        console.log(`[${i+1}/${files.length}] Uploaded: ${file} -> ${fullPath}`);
        successCount++;
      }
    } catch (err) {
      console.error(`[${i+1}/${files.length}] Exception uploading ${file}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\nUpload complete: ${successCount} succeeded, ${errorCount} failed`);
}

uploadCleanedImages();
