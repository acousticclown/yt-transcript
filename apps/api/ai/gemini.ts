import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

export const geminiModel = {
  async generateContent(prompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        return response.text || "";
      } catch (err: any) {
        lastError = err;
        // If rate limited (429), try next model
        if (err?.message?.includes("429") || err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED")) {
          console.log(`Model ${model} rate limited, trying next...`);
          continue;
        }
        // For other errors, throw immediately
        throw err;
      }
    }
    
    throw lastError || new Error("All models exhausted");
  },
};
