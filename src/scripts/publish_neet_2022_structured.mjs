import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Papa from "papaparse";
import {createClient} from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const APPLY=process.argv.includes("--apply"),ROOT=process.cwd();
const DIR=path.join(ROOT,"tmp/neet-2022-clean/structured");
const DATASET=path.join(DIR,"neet-2022-structured-draft.json");
const CSV=path.join(DIR,"neet-2022-structured.csv"),REPORT=path.join(DIR,"publish-report.json");
const imageFields=["question_image","option_a_image","option_b_image","option_c_image","option_d_image"];
for(const k of ["NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"])if(!process.env[k])throw new Error(`${k} is required`);
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

function explanation(q){const a=String(q.correct_option).toLowerCase();if(a==="none"){if(q.number===34)return "**Dropped question: none of the listed options is correct.**\n\nUsing Einstein's photoelectric equation for the two stated cases produces inconsistent conditions, so no listed threshold frequency can be selected.";return "**Dropped question: all five statements are correct.**\n\nThe source printed only four combinations; none includes all of (a), (b), (c), (d) and (e)."}const label=a.toUpperCase(),text=q[`option_${a}`],has=Boolean(q[`option_${a}_image`]);return `**Correct option: ${label}**\n\n${text}${has?`\n\nThe corresponding diagram is shown with option ${label}.`:""}`}
function mime(f){return path.extname(f).toLowerCase()===".png"?"image/png":"image/jpeg"}
async function upload(file,n,field){const ext=path.extname(file)||".png",object=`neet-ug-2022/structured/q${String(n).padStart(3,"0")}-${field.replaceAll("_","-")}${ext}`;const {error}=await supabase.storage.from("pyq-images").upload(object,await fs.readFile(file),{contentType:mime(file),upsert:true});if(error)throw new Error(`Q${n} ${field}: ${error.message}`);return supabase.storage.from("pyq-images").getPublicUrl(object).data.publicUrl}

async function main(){
 const data=JSON.parse(await fs.readFile(DATASET,"utf8"));if(data.length!==200||data.some((q,i)=>q.number!==i+1))throw new Error("Dataset must be 1..200");
 const bad=[];for(const q of data){for(const f of ["question","option_a","option_b","option_c","option_d"])if(!String(q[f]||"").trim())bad.push(`Q${q.number} empty ${f}`);const s=[q.question,q.option_a,q.option_b,q.option_c,q.option_d].join(" ");if(/[�□]|[\uE000-\uF8FF]|[]/u.test(s))bad.push(`Q${q.number} unresolved glyph`);if(!/^(?:[a-d]|none)$/.test(q.correct_option))bad.push(`Q${q.number} answer`)}if(bad.length)throw new Error(bad.join("\n"));
 const {count,error:ce}=await supabase.from("pyq_questions").select("id",{count:"exact",head:true}).eq("exam","NEET").eq("year",2022);if(ce)throw ce;if(count)throw new Error(`Refusing to overwrite ${count} existing NEET 2022 rows`);
 const {data:exam,error:ee}=await supabase.from("pyq_questions").select("exam_id").eq("exam","NEET").not("exam_id","is",null).limit(1).single();if(ee)throw ee;
 let packageId=null;if(APPLY){const {data:p,error}=await supabase.from("pyq_import_packages").insert([{name:"NEET 2022 Structured Text Import"}]).select("id").single();if(error)throw error;packageId=p.id}
 const records=[];for(const q of data){const r={exam:"NEET",exam_type:"NEET UG",year:2022,attempt:"NEET UG 2022",shift:"Single Shift",paper_code:"NEET 2022",exam_id:exam.exam_id,subject:q.subject,chapter:q.chapter,question_type:"MCQ",question:q.question,option_a:q.option_a,option_b:q.option_b,option_c:q.option_c,option_d:q.option_d,correct_option:String(q.correct_option).toUpperCase(),explanation:explanation(q),explanation_image:null,marks_positive:4,marks_negative:-1,question_number:q.number,display_order:q.number,status:"PUBLISHED",import_package_id:packageId};for(const f of imageFields)r[f]=q[f]?(APPLY?await upload(q[f],q.number,f):q[f]):null;records.push(r)}
 await fs.writeFile(CSV,Papa.unparse(records,{newline:"\n"}));const report={mode:APPLY?"apply":"dry-run",total:records.length,subjects:Object.fromEntries(["Physics","Chemistry","Biology"].map(s=>[s,records.filter(q=>q.subject===s).length])),tables:records.filter(q=>q.question.includes("\n|")).length,questionImages:records.filter(q=>q.question_image).length,optionImages:records.reduce((n,q)=>n+imageFields.slice(1).filter(f=>q[f]).length,0),dropped:records.filter(q=>q.correct_option==="NONE").map(q=>q.question_number)};
 if(APPLY){for(let i=0;i<records.length;i+=25){const {error}=await supabase.from("pyq_questions").insert(records.slice(i,i+25));if(error)throw new Error(`Insert ${i+1}: ${error.message}`)}const {data:v,error}=await supabase.from("pyq_questions").select("question_number,question,option_a,option_b,option_c,option_d,correct_option,explanation,explanation_image").eq("exam","NEET").eq("year",2022).eq("paper_code","NEET 2022").order("question_number");if(error)throw error;report.verified={total:v.length,sequence:v.every((q,i)=>q.question_number===i+1),empty:v.filter(q=>[q.question,q.option_a,q.option_b,q.option_c,q.option_d].some(x=>!String(x||"").trim())).length,explanationImages:v.filter(q=>q.explanation_image).length};if(report.verified.total!==200||!report.verified.sequence||report.verified.empty||report.verified.explanationImages)throw new Error(`Verification failed ${JSON.stringify(report.verified)}`)}
 await fs.writeFile(REPORT,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
