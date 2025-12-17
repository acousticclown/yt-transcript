/**
 * AI Routes - Streaming and non-streaming AI endpoints
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { 
  setupSSE, 
  sendSSE, 
  streamAIGeneration,
  generateAI,
  sanitizeJson 
} from "../lib/aiStream";
import { 
  NOTE_GENERATION_SYSTEM_PROMPT,
  noteGenerationPrompt,
  STEP_MESSAGES 
} from "../../../../packages/prompts/noteGeneration";

const router = Router();

/**
 * POST /ai/generate-note/stream
 * SSE streaming endpoint for note generation with thinking states
 */
router.post("/generate-note/stream", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log("🤖 [Stream] Generating note:", prompt.substring(0, 50) + "...");

  setupSSE(res);

  const steps = [
    { id: "analyzing", message: STEP_MESSAGES.analyzing },
    { id: "structuring", message: STEP_MESSAGES.structuring },
    { id: "generating", message: STEP_MESSAGES.generating_content },
    { id: "finalizing", message: STEP_MESSAGES.finalizing },
  ];

  await streamAIGeneration(
    res,
    NOTE_GENERATION_SYSTEM_PROMPT,
    noteGenerationPrompt(prompt),
    steps
  );
});

/**
 * POST /ai/generate-note
 * Non-streaming note generation (fallback/simple)
 */
router.post("/generate-note", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("🤖 Generating note:", prompt.substring(0, 50) + "...");

    const text = await generateAI(
      NOTE_GENERATION_SYSTEM_PROMPT,
      noteGenerationPrompt(prompt)
    );

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const note = JSON.parse(sanitizeJson(jsonMatch[0]));
    
    // Validate and normalize
    const normalizedNote = normalizeNote(note);
    
    console.log("✅ Note generated:", normalizedNote.title);
    res.json({ note: normalizedNote });

  } catch (error: any) {
    console.error("Note generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate note" });
  }
});

/**
 * POST /ai/inline
 * Inline text actions (simplify, expand, example)
 */
router.post("/inline", async (req: Request, res: Response) => {
  try {
    const { text, action } = req.body;
    
    if (!text || !action) {
      return res.status(400).json({ error: "Text and action are required" });
    }

    const prompts: Record<string, string> = {
      simplify: `Simplify this text, making it clearer and more concise:\n\n"${text}"\n\nReturn only the simplified text.`,
      expand: `Expand this text with more detail and examples:\n\n"${text}"\n\nReturn only the expanded text.`,
      example: `Add a practical example to illustrate this:\n\n"${text}"\n\nReturn the original text followed by a clear example.`,
    };

    const prompt = prompts[action];
    if (!prompt) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const result = await generateAI("You are a helpful writing assistant.", prompt);
    res.json({ result: result.trim() });

  } catch (error: any) {
    console.error("Inline AI error:", error);
    res.status(500).json({ error: "Failed to process AI action" });
  }
});

/**
 * POST /ai/transform-language
 * Transform text to different language/style
 */
router.post("/transform-language", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, tone } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and targetLanguage are required" });
    }

    const prompt = `Transform this text to ${targetLanguage}${tone ? ` with a ${tone} tone` : ""}:\n\n"${text}"\n\nReturn only the transformed text.`;
    
    const result = await generateAI("You are a multilingual translator.", prompt);
    res.json({ result: result.trim() });

  } catch (error: any) {
    console.error("Language transform error:", error);
    res.status(500).json({ error: "Failed to transform language" });
  }
});

/**
 * POST /ai/chat
 * Conversational AI for refining notes
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Build conversation history
    const conversationPrompt = messages
      .map((m: { role: string; content: string }) => 
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n\n");

    const systemPrompt = context 
      ? `You are Notely AI. Context: ${context}`
      : "You are Notely AI, a helpful note-taking assistant.";

    const result = await generateAI(systemPrompt, conversationPrompt);
    
    res.json({ 
      message: result.trim(),
      role: "assistant" 
    });

  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

/**
 * Normalize note structure
 */
function normalizeNote(note: any) {
  return {
    title: note.title || "Generated Note",
    content: note.content || "",
    tags: Array.isArray(note.tags) ? note.tags : [],
    sections: Array.isArray(note.sections) 
      ? note.sections.map((s: any, i: number) => ({
          id: `section-${i}-${Date.now()}`,
          title: s.title || `Section ${i + 1}`,
          summary: s.summary || "",
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
          language: "english",
        }))
      : [],
  };
}

export default router;

