/**
 * AI Streaming Utilities
 * SSE-based streaming for AI responses with thinking states
 */

import type { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model chain for fallback
const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
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
 * Get working Gemini model with fallback
 */
async function getWorkingModel() {
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Quick test
      await model.generateContent("test");
      return model;
    } catch (error: any) {
      console.log(`Model ${modelName} failed, trying next...`);
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
  steps: { id: string; message: string }[]
): Promise<void> {
  try {
    // Step 1: Analyzing
    sendSSE(res, { type: "thinking", step: "analyzing", message: steps[0]?.message || "Analyzing..." });
    await delay(300);

    // Get model
    const model = await getWorkingModel();

    // Step 2: Structuring
    sendSSE(res, { type: "thinking", step: "structuring", message: steps[1]?.message || "Structuring..." });
    await delay(200);

    // Generate with streaming
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Step 3: Generating
    sendSSE(res, { type: "thinking", step: "generating", message: steps[2]?.message || "Generating..." });
    
    const result = await model.generateContentStream(fullPrompt);
    
    let fullText = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      sendSSE(res, { type: "chunk", content: text });
    }

    // Step 4: Finalizing
    sendSSE(res, { type: "thinking", step: "finalizing", message: steps[3]?.message || "Finalizing..." });
    await delay(200);

    // Parse and validate JSON
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const data = JSON.parse(sanitizeJson(jsonMatch[0]));
    sendSSE(res, { type: "complete", data });

  } catch (error: any) {
    console.error("Stream error:", error);
    sendSSE(res, { type: "error", message: error.message || "Generation failed" });
  } finally {
    res.end();
  }
}

/**
 * Non-streaming AI generation (for simpler use cases)
 */
export async function generateAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const model = await getWorkingModel();
  const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
  return result.response.text();
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

