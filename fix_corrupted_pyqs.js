const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Run with: node --env-file=.env.local fix_corrupted_pyqs.js");
  process.exit(1);
}

async function fetchSupabase(path, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "apikey": supabaseKey,
      "Authorization": "Bearer " + supabaseKey,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(supabaseUrl + "/rest/v1/" + path, options);
  if (!res.ok) {
    throw new Error("Supabase request failed: " + res.statusText);
  }
  if (method === "GET") {
    return res.json();
  }
}

async function run() {
  console.log("Fetching all PYQs to check for corruption...");

  let allQuestions = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchSupabase("pyq_questions?select=*&limit=" + limit + "&offset=" + offset);
    if (data.length > 0) {
      allQuestions.push(...data);
      offset += limit;
    } else {
      hasMore = false;
    }
  }

  console.log("Found " + allQuestions.length + " total questions.");

  const unrecoverable = [];
  const fixed = [];

  for (const q of allQuestions) {
    let corrupted = false;
    let updates = {};

    if (!q.year) {
      if (q.exam_type && (q.exam_type.includes("Jan") || q.exam_type.includes("Feb") || q.exam_type.includes("Mar") || q.exam_type.includes("Apr") || q.exam_type.includes("Sep"))) {
        corrupted = true;
        unrecoverable.push(q.id);
        continue;
      }
    }

    if (q.shift === "MCQ" || q.shift === "Numerical" || q.shift === "Multiple Correct") {
      corrupted = true;
      updates.question_type = q.shift;
      
      if (q.attempt === "1" || q.attempt === "2" || q.attempt === "Morning" || q.attempt === "Afternoon") {
        updates.shift = q.attempt;
        if (q.exam_type && q.exam_type.match(/\\d+ [a-zA-Z]{3}/)) {
          updates.attempt = q.exam_type;
          updates.exam_type = null; 
        } else {
          updates.attempt = null;
        }
      } else {
        updates.shift = null;
      }
    }

    if (corrupted && Object.keys(updates).length > 0) {
      fixed.push({ id: q.id, ...updates });
    } else if (corrupted) {
      unrecoverable.push(q.id);
    }
  }

  console.log("Found " + fixed.length + " recoverable corrupted questions.");
  console.log("Found " + unrecoverable.length + " unrecoverable corrupted questions.");

  if (fixed.length > 0) {
    console.log("Applying fixes...");
    let successCount = 0;
    for (const f of fixed) {
      const { id, ...updates } = f;
      try {
        await fetchSupabase("pyq_questions?id=eq." + id, "PATCH", updates);
        successCount++;
      } catch (err) {
        console.error("Failed to update " + id + ":", err);
      }
    }
    console.log("Successfully repaired " + successCount + " questions.");
  }

  if (unrecoverable.length > 0) {
    console.log("\\nThe following question IDs are corrupted and could not be automatically repaired:");
    console.log(unrecoverable.join(", "));
  }

  console.log("Migration script complete.");
}

run();
