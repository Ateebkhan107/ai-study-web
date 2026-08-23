import path from "node:path";
import sharp from "sharp";

const CROPS_DIR = path.join(process.cwd(), "tmp/jee-main-2025-january-clean/JEE-MAIN-25-22JAN-S1/crops");

async function analyzeQuestion(qNum, xMin = 50, xMax = 700, maxRows = 600) {
  const file = path.join(CROPS_DIR, `q${String(qNum).padStart(2, "0")}.png`);
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });

  console.log(`\n=== Analyzing Q${qNum} (${info.width}x${info.height}) ===`);
  const rowCounts = [];
  for (let y = 0; y < Math.min(info.height, maxRows); y++) {
    let nonWhite = 0;
    for (let x = xMin; x < Math.min(info.width, xMax); x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r < 220 || g < 220 || b < 220) nonWhite++;
    }
    rowCounts.push(nonWhite);
  }

  // Print grouped vertical blocks (non-zero runs vs zero runs)
  let inBlock = false;
  let blockStart = 0;
  let maxCountInBlock = 0;

  for (let y = 0; y < rowCounts.length; y++) {
    const isDark = rowCounts[y] > 2;
    if (isDark && !inBlock) {
      inBlock = true;
      blockStart = y;
      maxCountInBlock = rowCounts[y];
    } else if (isDark && inBlock) {
      if (rowCounts[y] > maxCountInBlock) maxCountInBlock = rowCounts[y];
    } else if (!isDark && inBlock) {
      inBlock = false;
      console.log(`Block y=${blockStart}..${y - 1} (height ${y - blockStart}, maxDensity: ${maxCountInBlock})`);
    }
  }
  if (inBlock) {
    console.log(`Block y=${blockStart}..${rowCounts.length - 1} (height ${rowCounts.length - blockStart}, maxDensity: ${maxCountInBlock})`);
  }
}

async function main() {
  const qList = [26, 30, 33, 36, 37, 38, 40, 44, 50, 60];
  for (const q of qList) {
    const maxRows = q === 40 || q === 30 || q === 60 ? 1500 : 600;
    await analyzeQuestion(q, 50, 750, maxRows);
  }
}

main().catch(console.error);
