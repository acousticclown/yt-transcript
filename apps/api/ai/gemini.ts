import { GoogleGenAI } from "@google/genai";

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

// Generate content with fallback models
async function generateWithFallback(ai: GoogleGenAI, prompt: string): Promise<string> {
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
      if (
        errMsg.includes("429") ||
        errMsg.includes("503") ||
        errMsg.includes("quota") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("overloaded")
      ) {
        console.log(`Model ${model} unavailable, trying next...`);
        continue;
      }
      // For other errors, throw immediately
      throw err;
    }
  }

  throw lastError || new Error("All models exhausted");
}

export const geminiModel = {
  // Generate content - requires user's API key
  async generateContent(prompt: string, userApiKey: string): Promise<string> {
    if (!userApiKey) {
      throw new Error("API_KEY_REQUIRED");
    }
    const ai = new GoogleGenAI({ apiKey: userApiKey });
    return generateWithFallback(ai, prompt);
  },
};

// Helper to get user's API key from database
export async function getUserApiKey(userId: string): Promise<string | null> {
  const { prisma } = await import("../src/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { geminiApiKey: true },
  });
  return user?.geminiApiKey || null;
}
