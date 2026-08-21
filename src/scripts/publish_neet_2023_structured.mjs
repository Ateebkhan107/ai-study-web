import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const DIR = path.join(ROOT, "tmp/neet-2023-clean/structured");
const DATASET = path.join(DIR, "neet-2023-structured-draft.json");
const BACKUP = path.join(DIR, "live-backup-before-structured-publish.json");
const CSV = path.join(DIR, "neet-2023-structured.csv");
const REPORT = path.join(DIR, "publish-report.json");
const BUCKET = "pyq-images";
const imageFields = ["question_image","option_a_image","option_b_image","option_c_image","option_d_image"];

for (const key of ["NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]) if (!process.env[key]) throw new Error(`${key} is required`);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false,autoRefreshToken:false}});

function reviewExplanation(q) {
  const option=String(q.correct_option).toLowerCase(); const label=option.toUpperCase();
  if(option==="none") return "**Dropped question: none of the listed options is correct.**\n\nThe required ratio is $\\sqrt{3/5}$.";
  const answer=String(q[`option_${option}`]||"").trim(); const diagram=Boolean(q[`option_${option}_image`]);
  if (diagram) return `**Correct option: ${label}**\n\n${answer}\n\nThe corresponding diagram is shown with option ${label}.`;
  return `**Correct option: ${label}**\n\n${answer}`;
}
function mime(file){const e=path.extname(file).toLowerCase();return e===".png"?"image/png":e===".webp"?"image/webp":"image/jpeg"}
async function upload(file,n,field){const ext=path.extname(file).toLowerCase()||".png";const object=`neet-ug-2023/structured/q${String(n).padStart(3,"0")}-${field.replaceAll("_","-")}${ext}`;const {error}=await supabase.storage.from(BUCKET).upload(object,await fs.readFile(file),{contentType:mime(file),upsert:true});if(error)throw new Error(`Q${n} ${field}: ${error.message}`);return supabase.storage.from(BUCKET).getPublicUrl(object).data.publicUrl}
function liveNumber(row){const n=Number(row.question_number);if(n>=1&&n<=200)return n;const m=String(row.question||"").match(/^\s*Question\s+(\d+)\s*:/i);return m?Number(m[1]):NaN}

async function main(){
 const data=JSON.parse(await fs.readFile(DATASET,"utf8"));
 if(data.length!==200||data.some((q,i)=>q.number!==i+1))throw new Error("Dataset must contain the exact sequence 1..200");
 const bad=[];for(const q of data){for(const f of ["question","option_a","option_b","option_c","option_d"])if(!String(q[f]||"").trim())bad.push(`Q${q.number} empty ${f}`);const s=[q.question,q.option_a,q.option_b,q.option_c,q.option_d].join(" ");if(/[⎯�□]|[\uE000-\uF8FF]/u.test(s))bad.push(`Q${q.number} unresolved glyph`);if(!/^(?:[a-d]|none)$/i.test(q.correct_option))bad.push(`Q${q.number} answer`)}if(bad.length)throw new Error(bad.join("\n"));
 const {data:rows,error}=await supabase.from("pyq_questions").select("*").eq("exam","NEET").eq("year",2023).eq("paper_code","NEET 2023");if(error)throw error;if(rows.length!==200)throw new Error(`Expected 200 live rows, found ${rows.length}`);
 const byNumber=new Map;for(const row of rows){const n=liveNumber(row);if(!Number.isInteger(n)||byNumber.has(n))throw new Error(`Cannot uniquely map live row ${row.id}`);byNumber.set(n,row)}if(byNumber.size!==200)throw new Error("Live row map is incomplete");
 await fs.writeFile(BACKUP,JSON.stringify(rows,null,2));const records=[];
 for(const source of data){const live=byNumber.get(source.number);const record={...live,subject:source.subject,question:source.question,option_a:source.option_a,option_b:source.option_b,option_c:source.option_c,option_d:source.option_d,correct_option:String(source.correct_option).toUpperCase(),explanation:reviewExplanation(source),explanation_image:null,question_number:source.number,display_order:source.number,question_type:"MCQ",status:"PUBLISHED"};for(const field of imageFields)record[field]=source[field]?(APPLY?await upload(source[field],source.number,field):source[field]):null;records.push(record)}
 await fs.writeFile(CSV,Papa.unparse(records,{newline:"\n"}));
 const report={mode:APPLY?"apply":"dry-run",total:records.length,subjects:Object.fromEntries(["Physics","Chemistry","Biology"].map(s=>[s,records.filter(q=>q.subject===s).length])),semanticTables:records.filter(q=>/\n\|/.test(q.question)).length,questionImages:records.filter(q=>q.question_image).length,optionImages:records.reduce((n,q)=>n+[q.option_a_image,q.option_b_image,q.option_c_image,q.option_d_image].filter(Boolean).length,0),questionsWithAnyVisual:records.filter(q=>imageFields.some(f=>q[f])).length,droppedQuestions:records.filter(q=>q.correct_option==="NONE").map(q=>q.question_number),missingAnswers:records.filter(q=>!/(?:[A-D]|NONE)/.test(q.correct_option)).length,backup:BACKUP,csv:CSV};
 if(APPLY){for(let i=0;i<records.length;i+=20)await Promise.all(records.slice(i,i+20).map(async r=>{const fields=["subject","question","option_a","option_b","option_c","option_d","correct_option","explanation","explanation_image","question_number","display_order","question_type","status",...imageFields];const patch=Object.fromEntries(fields.map(f=>[f,r[f]]));const {error:e}=await supabase.from("pyq_questions").update(patch).eq("id",r.id).eq("exam","NEET").eq("year",2023).eq("paper_code","NEET 2023");if(e)throw new Error(`Q${r.question_number}: ${e.message}`)}));const {data:v,error:e}=await supabase.from("pyq_questions").select("question_number,question,option_a,option_b,option_c,option_d,correct_option,explanation,explanation_image,question_image,option_a_image,option_b_image,option_c_image,option_d_image").eq("exam","NEET").eq("year",2023).eq("paper_code","NEET 2023").order("question_number");if(e)throw e;report.verified={total:v.length,sequence:v.every((q,i)=>q.question_number===i+1),emptyFields:v.filter(q=>[q.question,q.option_a,q.option_b,q.option_c,q.option_d].some(x=>!String(x||"").trim())).length,distortedReviewText:v.filter(q=>/[�□]|[\uE000-\uF8FF]/u.test(String(q.explanation||""))).length,explanationImages:v.filter(q=>q.explanation_image).length,questionImages:v.filter(q=>q.question_image).length,optionImages:v.reduce((n,q)=>n+[q.option_a_image,q.option_b_image,q.option_c_image,q.option_d_image].filter(Boolean).length,0)};if(report.verified.total!==200||!report.verified.sequence||report.verified.emptyFields||report.verified.distortedReviewText||report.verified.explanationImages)throw new Error(`Verification failed ${JSON.stringify(report.verified)}`)}
 await fs.writeFile(REPORT,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
