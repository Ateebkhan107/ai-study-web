import fetch from 'node-fetch';
async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/zi/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', key: 'preferred_language', value: 'Hinglish' })
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response:", json);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run();
