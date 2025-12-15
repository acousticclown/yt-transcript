import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const geminiModel = {
  async generateContent(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Free tier model
      contents: prompt,
    });
    // response.text is a property, not a method
    return response.text;
  },
};

