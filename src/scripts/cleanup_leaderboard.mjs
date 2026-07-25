const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function cleanup() {
  console.log("Starting leaderboard cleanup...");

  const res1 = await fetch(`${supabaseUrl}/rest/v1/user_xp?user_id=eq.guest_user`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });

  if (!res1.ok) {
    console.error("Error deleting guest_user:", await res1.text());
  } else {
    console.log("Deleted guest_user records.");
  }

  const res2 = await fetch(`${supabaseUrl}/rest/v1/user_xp?user_id=in.(undefined,null,"")`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });

  if (!res2.ok) {
    console.error("Error deleting undefined users:", await res2.text());
  } else {
    console.log("Deleted undefined/null user records.");
  }

  console.log("Cleanup complete!");
}

cleanup();
