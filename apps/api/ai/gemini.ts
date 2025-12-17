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
        const errMsg = err?.message || JSON.stringify(err);
        // If rate limited (429) or overloaded (503), try next model
        if (errMsg.includes("429") || errMsg.includes("503") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("UNAVAILABLE") || errMsg.includes("overloaded")) {
          console.log(`Model ${model} unavailable, trying next...`);
          continue;
        }
        // For other errors, throw immediately
        throw err;
      }
    }
    
    throw lastError || new Error("All models exhausted");
  },
};
