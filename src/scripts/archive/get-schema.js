const url = "https://vyqcciooigmnfmzrwtpp.supabase.co/rest/v1/";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cWNjaW9vaWdtbmZtenJ3dHBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg0MzQxNiwiZXhwIjoyMDk2NDE5NDE2fQ.91zhSyFkLbS5NFauG-ghdc6i8tqvxEgKCEj8nW7dkww";

async function run() {
  const res = await fetch(url, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  const data = await res.json();
  const pyq_exams = data.definitions.pyq_exams.properties;
//   console.log(Object.keys(pyq_exams));
}
run();
