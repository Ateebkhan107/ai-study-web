import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const PDFTOTEXT = "/Users/ateebfatmi/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext";
const ROOT = path.resolve("tmp/jee-main-2022");
const OUT = path.resolve("scratch/jee2022/transcribed");
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];
const papers = [
  ["june", "JEE-MAIN-22-24JUN-S1",2,25],["june","JEE-MAIN-22-24JUN-S2",26,48],["june","JEE-MAIN-22-25JUN-S1",49,63],["june","JEE-MAIN-22-25JUN-S2",64,98],
  ["june","JEE-MAIN-22-26JUN-S1",99,126],["june","JEE-MAIN-22-26JUN-S2",127,150],["june","JEE-MAIN-22-27JUN-S1",151,179],["june","JEE-MAIN-22-27JUN-S2",180,207],
  ["june","JEE-MAIN-22-28JUN-S1",208,233],["june","JEE-MAIN-22-28JUN-S2",234,261],["june","JEE-MAIN-22-29JUN-S1",262,287],["june","JEE-MAIN-22-29JUN-S2",288,309],
  ["july","JEE-MAIN-22-25JUL-S1",2,22],["july","JEE-MAIN-22-25JUL-S2",23,41],["july","JEE-MAIN-22-26JUL-S1",42,67],["july","JEE-MAIN-22-26JUL-S2",68,92],
  ["july","JEE-MAIN-22-27JUL-S1",93,122],["july","JEE-MAIN-22-27JUL-S2",123,151],["july","JEE-MAIN-22-28JUL-S1",152,178],["july","JEE-MAIN-22-28JUL-S2",179,202],
  ["july","JEE-MAIN-22-29JUL-S1",203,229],["july","JEE-MAIN-22-29JUL-S2",230,255],
];

function normalize(text) { return String(text || "").replace(/\f/g,"\n").replace(/-\n(?=[a-z])/g,"").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim(); }
function parseBody(body, numerical) {
  if (numerical) return { question: normalize(body), options: ["","","",""] };
  const markers = [...body.matchAll(/(?:^|\n)\s*\(([A-D])\)\s*/g)];
  if (markers.length < 4) return { question: normalize(body), options: ["","","",""] };
  return { question: normalize(body.slice(0, markers[0].index)), options: markers.slice(0,4).map((m,i)=>normalize(body.slice(m.index+m[0].length,markers[i+1]?.index ?? body.length))) };
}
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }

await fs.mkdir(OUT,{recursive:true});
const audit=[];
for (const [session,code,first,last] of papers) {
  const outputFiles = SUBJECTS.map((subject)=>path.join(OUT,`${code}_${subject.toLowerCase()}.json`));
  if ((await Promise.all(outputFiles.map(exists))).every(Boolean)) { audit.push({paper_code:code,status:"preserved-better-source"}); continue; }
  const pdf=path.join(ROOT,"combined",`${session}.pdf`), parts=[];
  for(let page=first;page<=last;page+=1){
    for(const [x,width] of [[0,298],[298,297]]){
      const temp=path.join("/tmp",`jee2022-${process.pid}-${page}-${x}.txt`);
      execFileSync(PDFTOTEXT,["-f",String(page),"-l",String(page),"-x",String(x),"-y","0","-W",String(width),"-H","842","-layout",pdf,temp],{stdio:"ignore"});
      parts.push(await fs.readFile(temp,"utf8")); await fs.rm(temp,{force:true});
    }
  }
  const text=parts.join("\n"), answerMatches=[...text.matchAll(/Official Ans\. by NTA\s*\(([^)]+)\)/g)];
  if(answerMatches.length!==90){audit.push({paper_code:code,status:"failed",answer_markers:answerMatches.length});continue;}
  const rows=[];
  const subjectCounts = new Map(SUBJECTS.map((subject) => [subject, 0]));
  for(let i=0;i<90;i+=1){
    const answer=answerMatches[i], from=i===0?0:answerMatches[i-1].index+answerMatches[i-1][0].length;
    const segment=text.slice(from,answer.index), starts=[...segment.matchAll(/(?:^|\n)\s*(\d{1,2})\.\s*/g)];
    if(!starts.length) throw new Error(`${code}: no question start before answer ${i+1}`);
    const start=starts.at(-1), body=segment.slice(start.index+start[0].length), prefix=text.slice(0,from+start.index);
    const subjectMatches=[...prefix.matchAll(/^\s*(PHYSICS|CHEMISTRY|MATHEMATICS)\s*$/gmi)];
    const sectionMatches=[...prefix.matchAll(/^\s*SECTION\s*-?\s*([AB])\s*$/gmi)];
    const subject=(subjectMatches.at(-1)?.[1]||"").toLowerCase().replace(/^./,(c)=>c.toUpperCase());
    const section=sectionMatches.at(-1)?.[1]||"A";
    const printed=Number(start[1]);
    // Several editions reset, repeat, or OCR the printed question numbers
    // inconsistently.  The answer blocks themselves remain in strict source
    // order: 20 MCQs followed by 10 numerical questions for each subject.
    // Occurrence order is therefore the stable identifier.
    const local = (subjectCounts.get(subject) || 0) + 1;
    subjectCounts.set(subject, local);
    const numerical = local > 20 || section === "B";
    const parsed=parseBody(body,numerical), q=SUBJECTS.indexOf(subject)*30+local;
    rows.push({paper_code:code,question_number:q,source_question_number:printed,subject,chapter:"",question_type:numerical?"NUMERICAL":"MCQ",question:parsed.question,
      option_a:parsed.options[0],option_b:parsed.options[1],option_c:parsed.options[2],option_d:parsed.options[3],correct_option:numerical?String(answer[1]).trim():String(answer[1]).trim().toLowerCase(),
      question_image:null,option_a_image:null,option_b_image:null,option_c_image:null,option_d_image:null});
  }
  const valid=rows.length===90&&new Set(rows.map((r)=>r.question_number)).size===90&&rows.every((r)=>SUBJECTS.includes(r.subject)&&r.question_number>=1&&r.question_number<=90);
  if(!valid){audit.push({paper_code:code,status:"failed-mapping",count:rows.length,unique:new Set(rows.map((r)=>r.question_number)).size,subjects:[...new Set(rows.map((r)=>r.subject))]});continue;}
  rows.sort((a,b)=>a.question_number-b.question_number);
  for(const subject of SUBJECTS) await fs.writeFile(path.join(OUT,`${code}_${subject.toLowerCase()}.json`),`${JSON.stringify(rows.filter((r)=>r.subject===subject),null,2)}\n`);
  audit.push({paper_code:code,status:"written",count:90,empty_mcq_options:rows.filter((r)=>r.question_type==="MCQ"&&[r.option_a,r.option_b,r.option_c,r.option_d].some((x)=>!x)).map((r)=>r.question_number)});
}
await fs.writeFile(path.join(OUT,"combined-normalization-audit.json"),`${JSON.stringify(audit,null,2)}\n`);
console.log(JSON.stringify(audit,null,2));
