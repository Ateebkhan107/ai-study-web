import path from "node:path";
import sharp from "sharp";

const CROPS_DIR = path.join(process.cwd(), "tmp/jee-main-2025-january-clean/JEE-MAIN-25-22JAN-S1/crops");
const OUT_DIR = path.join(process.cwd(), "tmp/jee-main-2025-january-clean/JEE-MAIN-25-22JAN-S1/tight-diagrams");

const EXACT_BOXES = {
  26: { left: 80, top: 168, width: 320, height: 195 },
  30: { left: 80, top: 82, width: 520, height: 835 },
  33: { left: 105, top: 15, width: 450, height: 215 },
  36: { left: 80, top: 142, width: 370, height: 250 },
  37: { left: 80, top: 115, width: 420, height: 202 },
  38: { left: 80, top: 135, width: 420, height: 204 },
  40: { left: 130, top: 90, width: 520, height: 1325 },
  44: { left: 80, top: 136, width: 270, height: 150 },
  50: { left: 60, top: 88, width: 320, height: 124 },
  60: { left: 50, top: 100, width: 730, height: 245 },
};

async function main() {
  for (const [qNumStr, box] of Object.entries(EXACT_BOXES)) {
    const qNum = Number(qNumStr);
    const src = path.join(CROPS_DIR, `q${String(qNum).padStart(2, "0")}.png`);
    const dst = path.join(OUT_DIR, `q${String(qNum).padStart(2, "0")}_diagram.png`);

    await sharp(src)
      .extract(box)
      .trim()
      .extend({ top: 12, bottom: 12, left: 12, right: 12, background: "#ffffff" })
      .toFile(dst);

    console.log(`Saved exact diagram for Q${qNum}`);
  }
}

main().catch(console.error);
