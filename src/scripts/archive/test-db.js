import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

const env = dotenv.parse(readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from("pyq_exams")
    .insert([{
      exam: "NEET",
      year: 2021,
      exam_type: "UG",
      exam_date: "2021-09-12",
      shift: null,
      paper_code: null,
      duration: 180,
      total_marks: 720,
      instructions: null,
      status: "PUBLISHED"
    }])
    .select()
    .single();

//   console.log("Error:", error);
//   console.log("Data:", data);
}

test();
