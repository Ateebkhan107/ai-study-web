import { getUserAnalytics } from "../services/analytics.js";

async function run() {
  try {
    const userId = 'user_3FgkqSrzFtkzCpjkbXadl4upu09'; // Test User ID
    const stats = await getUserAnalytics(userId, "JEE");
    console.log("SUCCESS!", stats);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

run();
