/**
 * AI Streaming Utilities
 * SSE-based streaming for AI responses with thinking states
 * Using new @google/genai SDK
 */

import type { Response, Request } from "express";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import { getUserApiKey } from "../../ai/gemini";

const JWT_SECRET = process.env.JWT_SECRET || "notely-secret-key-change-in-production";

// Model chain for fallback
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

export type StreamEvent = 
  | { type: "thinking"; step: string; message: string }
  | { type: "chunk"; content: string }
  | { type: "complete"; data: any }
  | { type: "error"; message: string };

/**
 * Send SSE event to client
 */
export function sendSSE(res: Response, event: StreamEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * Setup SSE headers
 */
export function setupSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();
}

/**
 * Extract user ID from request
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Get working model with fallback using user's API key
 */
async function tryGenerateWithFallback(prompt: string, apiKey: string): Promise<string> {
  console.log("🔄 [AI Fallback] Trying models:", MODELS.join(", "));
  console.log("🔑 [AI Fallback] API Key present:", !!apiKey);
  
  const ai = new GoogleGenAI({ apiKey });
  
  for (const modelName of MODELS) {
    try {
      console.log(`🔄 [AI Fallback] Trying model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      console.log(`✅ [AI Fallback] ${modelName} succeeded`);
      return response.text || "";
    } catch (error: any) {
      console.log(`❌ [AI Fallback] ${modelName} failed:`, error.message);
      continue;
    }
  }
  throw new Error("All AI models exhausted");
}

/**
 * Stream AI generation with thinking states
 */
export async function streamAIGeneration(
  res: Response,
  systemPrompt: string,
  userPrompt: string,
  steps: { id: string; message: string }[],
  apiKey: string
): Promise<void> {
  console.log("🚀 [AI Stream] Starting generation...");
  
  if (!apiKey) {
    sendSSE(res, { type: "error", message: "API_KEY_REQUIRED" });
    res.end();
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Step 1: Analyzing
    console.log("📍 [AI Stream] Step 1: Analyzing");
    sendSSE(res, { type: "thinking", step: "analyzing", message: steps[0]?.message || "Analyzing..." });
    await delay(300);

    // Step 2: Structuring
    console.log("📍 [AI Stream] Step 2: Structuring");
    sendSSE(res, { type: "thinking", step: "structuring", message: steps[1]?.message || "Structuring..." });
    await delay(200);

    // Step 3: Generating
    console.log("📍 [AI Stream] Step 3: Generating content");
    sendSSE(res, { type: "thinking", step: "generating", message: steps[2]?.message || "Generating..." });
    
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    console.log("📝 [AI Stream] Prompt length:", fullPrompt.length);
    
    // Try streaming first, fallback to non-streaming
    let fullText = "";
    
    try {
      console.log("🔄 [AI Stream] Attempting streaming with model:", MODELS[0]);
      
      const response = await ai.models.generateContentStream({
        model: MODELS[0],
        contents: fullPrompt,
      });
      
      console.log("✅ [AI Stream] Got stream response, reading chunks...");
      let chunkCount = 0;
      
      for await (const chunk of response) {
        chunkCount++;
        const text = chunk.text || "";
        fullText += text;
        console.log(`📦 [AI Stream] Chunk ${chunkCount}: ${text.length} chars`);
        if (text) {
          sendSSE(res, { type: "chunk", content: text });
        }
      }
      
      console.log(`✅ [AI Stream] Streaming complete. Total chunks: ${chunkCount}, Total length: ${fullText.length}`);
      
    } catch (streamError: any) {
      console.log("⚠️ [AI Stream] Streaming failed:", streamError.message);
      console.log("🔄 [AI Stream] Using non-streaming fallback...");
      fullText = await tryGenerateWithFallback(fullPrompt, apiKey);
      console.log("✅ [AI Stream] Fallback complete. Length:", fullText.length);
      sendSSE(res, { type: "chunk", content: fullText });
    }

    // Step 4: Finalizing
    console.log("📍 [AI Stream] Step 4: Finalizing");
    sendSSE(res, { type: "thinking", step: "finalizing", message: steps[3]?.message || "Finalizing..." });
    await delay(200);

    // Parse and validate JSON
    console.log("🔍 [AI Stream] Parsing JSON from response...");
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ [AI Stream] No JSON found in response:", fullText.substring(0, 200));
      throw new Error("Invalid response format - no JSON found");
    }

    console.log("✅ [AI Stream] JSON found, parsing...");
    const data = JSON.parse(sanitizeJson(jsonMatch[0]));
    console.log("✅ [AI Stream] Parsed successfully. Title:", data.title);
    
    sendSSE(res, { type: "complete", data });
    console.log("🎉 [AI Stream] Generation complete!");

  } catch (error: any) {
    console.error("❌ [AI Stream] Error:", error.message);
    console.error("❌ [AI Stream] Stack:", error.stack);
    sendSSE(res, { type: "error", message: error.message || "Generation failed" });
  } finally {
    console.log("🔚 [AI Stream] Ending response");
    res.end();
  }
}

/**
 * Non-streaming AI generation (for simpler use cases)
 */
export async function generateAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("API_KEY_REQUIRED");
  }
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  return await tryGenerateWithFallback(fullPrompt, apiKey);
}

/**
 * Sanitize JSON from AI response
 */
export function sanitizeJson(text: string): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\\n/g, "\\n")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\\\/g, "\\\\")
    .trim();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
