const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  console.log("Checking PYQ attempts join with pyq_questions...");
  const pyqRes = await fetch(`${supabaseUrl}/rest/v1/pyq_attempts?select=*,pyq_questions!inner(exam)&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  const pyqJson = await pyqRes.json();
  console.log(pyqJson.length ? pyqJson : pyqJson);

  console.log("Checking user_answers join with questions...");
  const ansRes = await fetch(`${supabaseUrl}/rest/v1/user_answers?select=*,questions!inner(exam)&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  console.log("Checking nested join test_attempts -> user_answers -> questions...");
  const nestedRes = await fetch(`${supabaseUrl}/rest/v1/test_attempts?select=*,user_answers!inner(questions!inner(exam))&user_answers.questions.exam=eq.JEE%20Main&limit=1`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  const nestedJson = await nestedRes.json();
  console.log(nestedJson);
}

run();
