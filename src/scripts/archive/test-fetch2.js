const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchGoals() {
  const res = await fetch(`${url}/rest/v1/user_daily_goals?select=*`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  const data = await res.json();
//   console.log("User Daily Goals:", data);
}
fetchGoals();
