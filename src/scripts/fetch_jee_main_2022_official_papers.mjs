import fs from "node:fs/promises";
import path from "node:path";

const html = await fs.readFile("tmp/jee-main-2022/study4india.html", "utf8");
const pattern = /data-search="\d+ jee-main btech english 2022 (\d{2})-(06|07)-2022 ([12]) (https?:\/\/www\.nta\.ac\.in\/download\/exampaper\/[^ ]+\.pdf) download"/gi;
const papers = new Map();
for (const match of html.matchAll(pattern)) {
  const [, day, month, shift, rawUrl] = match;
  const code = `JEE-MAIN-22-${day}${month === "06" ? "JUN" : "JUL"}-S${shift}`;
  if (!papers.has(code)) papers.set(code, rawUrl.replace("http://", "https://"));
}

const expected = [
  ...[24, 25, 26, 27, 28, 29].flatMap((day) => [1, 2].map((shift) => `JEE-MAIN-22-${day}JUN-S${shift}`)),
  "JEE-MAIN-22-30JUN-S1",
  ...[25, 26, 27, 28, 29].flatMap((day) => [1, 2].map((shift) => `JEE-MAIN-22-${day}JUL-S${shift}`)),
  "JEE-MAIN-22-30JUL-S2",
];
for (const code of expected) if (!papers.has(code)) throw new Error(`Official English paper missing for ${code}`);

for (const code of expected) {
  const output = path.join("tmp/jee-main-2022/sources", code, "official-reference.pdf");
  try {
    const stat = await fs.stat(output);
    if (stat.size > 1000) { console.log(`${code}: cached ${(stat.size / 1048576).toFixed(1)} MiB`); continue; }
  } catch {}
  const response = await fetch(papers.get(code));
  if (!response.ok) throw new Error(`${code}: ${response.status} ${response.statusText}`);
  const content = Buffer.from(await response.arrayBuffer());
  if (!content.subarray(0, 4).equals(Buffer.from("%PDF"))) throw new Error(`${code}: response was not a PDF`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, content);
  console.log(`${code}: downloaded ${(content.length / 1048576).toFixed(1)} MiB`);
}

await fs.writeFile("tmp/jee-main-2022/official-paper-map.json", `${JSON.stringify(Object.fromEntries(papers), null, 2)}\n`);
