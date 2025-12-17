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

// Decryption for stored API keys
import crypto from "crypto";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "notely-encryption-key-32chars!!";

function decrypt(text: string): string {
  try {
    const [ivHex, encrypted] = text.split(":");
    if (!ivHex || !encrypted || !ENCRYPTION_KEY) {
      throw new Error("Invalid encrypted data");
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // If decryption fails, assume it's stored in plain text (legacy)
    return text;
  }
}

// Helper to get user's API key from database
export async function getUserApiKey(userId: string): Promise<string | null> {
  const { prisma } = await import("../src/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { geminiApiKey: true },
  });
  if (!user?.geminiApiKey) return null;
  return decrypt(user.geminiApiKey);
}
