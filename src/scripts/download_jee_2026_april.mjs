import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const LINKS = [
  { id: "1jgHHrnTC5I9vT62QjVPe-MWRUMWh04of", name: "JEE-MAIN-26-02APR-S1", filename: "JEE_Main_2026_02_April_Shift_1.pdf" },
  { id: "1zT_QWzZOPVeu8f_54e8RlBE2-qQ5N1hi", name: "JEE-MAIN-26-02APR-S2", filename: "JEE_Main_2026_02_April_Shift_2.pdf" },
  { id: "1g4Ll1LloNjDMFI6CnzVL32AoFLsUCplJ", name: "JEE-MAIN-26-04APR-S1", filename: "JEE_Main_2026_04_April_Shift_1.pdf" },
  { id: "11OMn1I3Tgu3DzbSuASaFmwWuhsIxJ7W2", name: "JEE-MAIN-26-04APR-S2", filename: "JEE_Main_2026_04_April_Shift_2.pdf" },
  { id: "1sC5lpzJiaybYgkPtVK9niJJdvaWJduLP", name: "JEE-MAIN-26-05APR-S1", filename: "JEE_Main_2026_05_April_Shift_1.pdf" },
  { id: "1UY6RjigabN8iDk7Afy_GkaJB1CcpbtWw", name: "JEE-MAIN-26-05APR-S2", filename: "JEE_Main_2026_05_April_Shift_2.pdf" },
  { id: "1z7fPE6EgO5PHRxPkK7LEWl0aRgmLdESC", name: "JEE-MAIN-26-06APR-S1", filename: "JEE_Main_2026_06_April_Shift_1.pdf" },
  { id: "1VA-bw7I60YW77uQPzXomIqZWT7qqSgL9", name: "JEE-MAIN-26-06APR-S2", filename: "JEE_Main_2026_06_April_Shift_2.pdf" },
  { id: "1k2Rq_9WYgzqLYJTnOPaTvq0UWOLE_ksC", name: "JEE-MAIN-26-08APR-S2", filename: "JEE_Main_2026_08_April_Shift_2.pdf" },
];

const OUT_DIR = path.join(process.cwd(), "tmp/jee-main-2026-april-input");
fs.mkdirSync(OUT_DIR, { recursive: true });

function downloadFile(id, destPath) {
  return new Promise((resolve, reject) => {
    const url = `https://drive.usercontent.google.com/download?id=${id}&export=download&authuser=0`;
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301 || res.statusCode === 303) {
        https.get(res.headers.location, (redirectRes) => {
          const fileStream = fs.createWriteStream(destPath);
          redirectRes.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close();
            resolve();
          });
        }).on("error", reject);
      } else if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${id}: status ${res.statusCode}`));
      }
    }).on("error", reject);
  });
}

async function main() {
  console.log("Starting download of 9 JEE Main April papers...");
  for (let i = 0; i < LINKS.length; i++) {
    const { id, name, filename } = LINKS[i];
    const dest = path.join(OUT_DIR, filename);
    console.log(`[${i + 1}/9] Downloading ${name} (${id})...`);
    await downloadFile(id, dest);
    const stat = fs.statSync(dest);
    console.log(`  Saved ${filename} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  }
  console.log("All 9 PDFs downloaded successfully!");
}

main().catch(console.error);
