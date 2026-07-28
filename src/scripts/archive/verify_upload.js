const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, count } = await supabase
    .from("pyq_questions")
    .select("id, subject, chapter", { count: "exact" })
    .eq("exam", "NEET")
    .eq("year", 2025);

//   console.log("TOTAL NEET 2025 QUESTIONS IN SUPABASE:", count);
  console.log("Breakdown by subject:", {
    Physics: data.filter((d) => d.subject === "Physics").length,
    Chemistry: data.filter((d) => d.subject === "Chemistry").length,
    Biology: data.filter((d) => d.subject === "Biology").length,
  });
}

check();
