import { GoogleGenAI } from "@google/genai";

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

// Default AI instance using server's API key
const serverApiKey = process.env.GEMINI_API_KEY;
const defaultAi = serverApiKey ? new GoogleGenAI({ apiKey: serverApiKey }) : null;

// Create AI instance with specific API key
function createAiInstance(apiKey?: string): GoogleGenAI | null {
  const key = apiKey || serverApiKey;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

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
  // Generate content using server's API key (default)
  async generateContent(prompt: string): Promise<string> {
    if (!defaultAi) {
      throw new Error("No Gemini API key configured");
    }
    return generateWithFallback(defaultAi, prompt);
  },

  // Generate content using user's API key (with fallback to server's)
  async generateContentWithUserKey(prompt: string, userApiKey?: string): Promise<string> {
    const ai = createAiInstance(userApiKey);
    if (!ai) {
      throw new Error("No Gemini API key available. Please add your API key in Settings.");
    }
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
