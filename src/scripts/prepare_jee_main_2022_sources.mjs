import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const workDir = path.join(root, 'tmp', 'jee-main-2022');
const sourceDir = path.join(workDir, 'sources');
const indexPath = path.join(workDir, 'esaral.html');

const supplemental = [
  ['JEE-MAIN-22-24JUN-S1', 'https://www.nta.ac.in/Download/ExamPaper/Paper_20230320112124.pdf'],
  ['JEE-MAIN-22-24JUN-S2', 'https://www.nta.ac.in/Download/ExamPaper/Paper_20230320113108.pdf'],
  ['JEE-MAIN-22-30JUN-S1', 'https://www.nta.ac.in/Download/ExamPaper/Paper_20230322132723.pdf'],
  ['JEE-MAIN-22-30JUL-S2', 'https://www.nta.ac.in/Download/ExamPaper/Paper_20230323142211.pdf'],
];

const html = await fs.readFile(indexPath, 'utf8');
const urls = [...html.matchAll(/href="(https:\/\/www\.esaral\.com\/media\/uploads\/[^"?]+\.pdf)"/gi)]
  .map((match) => match[1].replaceAll('&amp;', '&'));

const sources = [];
for (const url of urls) {
  const decoded = decodeURIComponent(url);
  const match = decoded.match(/(2[4-9]|30)-(06|07)\s+.*?(MORNING|EVENING).*?(MATHS|PHYSICS|CHEMISTRY)/i);
  if (!match) continue;
  const [, day, month, sitting, rawSubject] = match;
  const shift = sitting.toUpperCase() === 'MORNING' ? 1 : 2;
  const subject = rawSubject.toUpperCase() === 'MATHS' ? 'Mathematics' : `${rawSubject[0].toUpperCase()}${rawSubject.slice(1).toLowerCase()}`;
  const monthCode = month === '06' ? 'JUN' : 'JUL';
  const paperCode = `JEE-MAIN-22-${day}${monthCode}-S${shift}`;
  sources.push({ paper_code: paperCode, subject, url, kind: 'subject' });
}

for (const [paperCode, url] of supplemental) {
  sources.push({ paper_code: paperCode, subject: null, url, kind: 'full-paper' });
}

await fs.mkdir(sourceDir, { recursive: true });

let cursor = 0;
const results = [];
async function worker() {
  while (cursor < sources.length) {
    const source = sources[cursor++];
    const paperDir = path.join(sourceDir, source.paper_code);
    await fs.mkdir(paperDir, { recursive: true });
    const output = path.join(paperDir, source.kind === 'full-paper' ? 'official.pdf' : `${source.subject.toLowerCase()}.pdf`);
    let bytes = 0;
    try {
      const stat = await fs.stat(output);
      bytes = stat.size;
    } catch {
      const response = await fetch(source.url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${source.url}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) throw new Error(`Not a PDF: ${source.url}`);
      await fs.writeFile(output, buffer);
      bytes = buffer.length;
    }
    results.push({ ...source, path: output, bytes });
    console.log(`${source.paper_code} ${source.subject ?? 'Full paper'} ${(bytes / 1048576).toFixed(2)} MiB`);
  }
}

await Promise.all(Array.from({ length: 6 }, worker));
results.sort((a, b) => a.paper_code.localeCompare(b.paper_code) || String(a.subject).localeCompare(String(b.subject)));

const papers = [...new Set(results.map((item) => item.paper_code))];
const expectedPapers = [
  ...Array.from({ length: 6 }, (_, index) => 24 + index).flatMap((day) => [1, 2].map((shift) => `JEE-MAIN-22-${day}JUN-S${shift}`)),
  'JEE-MAIN-22-30JUN-S1',
  ...Array.from({ length: 5 }, (_, index) => 25 + index).flatMap((day) => [1, 2].map((shift) => `JEE-MAIN-22-${day}JUL-S${shift}`)),
  'JEE-MAIN-22-30JUL-S2',
];
const missingPapers = expectedPapers.filter((paper) => !papers.includes(paper));
if (missingPapers.length) throw new Error(`Missing papers: ${missingPapers.join(', ')}`);

await fs.writeFile(path.join(workDir, 'source-manifest.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ papers: papers.length, pdfs: results.length, missing_papers: missingPapers }, null, 2));
