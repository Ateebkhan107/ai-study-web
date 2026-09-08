import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const result = await ai.models.generateContentStream({
    model: "gemini-3.6-flash",
    contents: "Open Analytics. Please also reply with text.",
    config: {
      tools: [{
        functionDeclarations: [{
          name: "navigate",
          description: "Navigate to a page",
          parameters: {
            type: "OBJECT",
            properties: { destination: { type: "STRING" } }
          }
        }]
      }]
    }
  });
  for await (const chunk of result) {
    try {
      console.log("TEXT:", chunk.text);
    } catch(e) {
      console.log("TEXT ERROR");
    }
    console.log("FUNCS:", chunk.functionCalls);
  }
}
run();
