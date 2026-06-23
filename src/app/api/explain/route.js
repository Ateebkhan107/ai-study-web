export async function POST(req) {
  const { question } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Anthropic API key is not configured." },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "You are an expert JEE/NEET tutor...",
      messages: [{ role: "user", content: `Explain: ${question.text}` }],
    }),
  });

  if (!response.ok) {
    return Response.json({ error: "Failed to generate explanation." }, { status: 500 });
  }

  const data = await response.json();
  return Response.json({ text: data.content?.[0]?.text || "" });
}
