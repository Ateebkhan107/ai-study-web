import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.local");
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const allPapers=['27JAN','29JAN','30JAN','31JAN','01FEB'].flatMap(d=>[1,2].map(n=>`JEE-MAIN-24-${d}-S${n}`));
const requestedPaper=process.argv[2]; const start=Number(process.argv[3]||1); const end=Number(process.argv[4]||90);
const papers=requestedPaper?[requestedPaper]:allPapers;
for(const code of papers){
 const manifest=JSON.parse(await fs.readFile(`tmp/jee-main-2024-clean/${code}/manifest.json`,'utf8'));
 const {data:old,error}=await s.from('pyq_questions').select('*').eq('paper_code',code).order('question_number'); if(error||old.length!==90) throw new Error(`${code}: ${error?.message||'missing rows'}`);
 for(const item of manifest.filter(item=>item.number>=start&&item.number<=end)){
  const sourceIndex=item.number<=30?item.number+59:item.number<=60?item.number-31:item.number-31;
  const source=old[sourceIndex];
  const bytes=await fs.readFile(item.image_path); const object=`jee-main-2024-clean/${code}/q${String(item.number).padStart(2,'0')}.png`;
  const {error:uploadError}=await s.storage.from('pyq-images').upload(object,bytes,{contentType:'image/png',upsert:true}); if(uploadError) throw new Error(`${code} Q${item.number}: ${uploadError.message}`);
  const image=s.storage.from('pyq-images').getPublicUrl(object).data.publicUrl;
  const payload={subject:item.subject,question_type:item.question_type,question:`Question ${item.number}: Refer to the source image.`,option_a:'Option 1',option_b:'Option 2',option_c:'Option 3',option_d:'Option 4',correct_option:source.correct_option,correct_options:source.correct_options,numerical_answer:source.numerical_answer,numerical_min:source.numerical_min,numerical_max:source.numerical_max,explanation:`Official answer key: ${source.numerical_answer ?? source.correct_option?.toUpperCase()}.`,question_image:image,explanation_image:null,question_number:item.number,display_order:item.number,status:'PUBLISHED'};
  const {error:updateError}=await s.from('pyq_questions').update(payload).eq('id',old[item.number-1].id); if(updateError) throw new Error(`${code} Q${item.number}: ${updateError.message}`);
 }
 if(end>=90){ const {error:examError}=await s.from('pyq_exams').update({status:'PUBLISHED',is_published:true}).eq('paper_code',code); if(examError) throw new Error(examError.message); }
 console.log(JSON.stringify({code,published:end-start+1}));
}
