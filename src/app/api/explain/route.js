// app/api/explain/route.js
import Anthropic from "@anthropic-ai/sdk";
export async function POST(req) {
  const { question } = await req.json();
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: "You are an expert JEE/NEET tutor...",
    messages: [{ role: "user", content: `Explain: ${question.text}` }],
  });
  return Response.json({ text: msg.content[0].text });
}