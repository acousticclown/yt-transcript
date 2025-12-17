import "dotenv/config";
import express from "express";
import cors from "cors";

// Routes
import notesRouter from "./routes/notes";
import tagsRouter from "./routes/tags";

// Legacy imports for YouTube/AI features
import { getSubtitles } from "youtube-caption-extractor";
import { geminiModel } from "../ai/gemini";
import { basicSummaryPrompt } from "../../../packages/prompts/basicSummary";
import { sectionDetectionPrompt } from "../../../packages/prompts/sectionDetection";
import { inlineActionPrompt } from "../../../packages/prompts/inlineActions";
import { languageTransformPrompt } from "../../../packages/prompts/languageTransform";
import { cleanTranscript } from "../utils/cleanTranscript";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/notes", notesRouter);
app.use("/api/tags", tagsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.3.0" });
});

// ============================================
// Legacy YouTube/AI endpoints (keeping for compatibility)
// ============================================

// POST /transcript - Extract YouTube transcript
app.post("/transcript", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const subtitles = await getSubtitles({ videoID: videoId, lang: "en" });
    if (!subtitles || subtitles.length === 0) {
      return res.status(404).json({ error: "No captions found" });
    }

    const transcript = subtitles.map((s: any) => s.text).join(" ");
    const cleanedTranscript = cleanTranscript(transcript);

    res.json({ transcript: cleanedTranscript, videoId });
  } catch (error) {
    console.error("Transcript error:", error);
    res.status(500).json({ error: "Failed to extract transcript" });
  }
});

// POST /summary - Generate AI summary
app.post("/summary", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const prompt = basicSummaryPrompt(transcript);
    const result = await geminiModel.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// POST /sections - Generate structured sections
app.post("/sections", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const prompt = sectionDetectionPrompt(transcript);
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const sections = JSON.parse(sanitizeJson(jsonMatch[0]));
    res.json({ sections });
  } catch (error) {
    console.error("Sections error:", error);
    res.status(500).json({ error: "Failed to generate sections" });
  }
});

// POST /ai/inline - Inline AI actions
app.post("/ai/inline", async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || !action) {
      return res.status(400).json({ error: "Text and action are required" });
    }

    const prompt = inlineActionPrompt(text, action);
    const result = await geminiModel.generateContent(prompt);
    const output = result.response.text();

    res.json({ result: output.trim() });
  } catch (error) {
    console.error("Inline AI error:", error);
    res.status(500).json({ error: "Failed to process AI action" });
  }
});

// POST /ai/transform-language - Transform to different language
app.post("/ai/transform-language", async (req, res) => {
  try {
    const { text, targetLanguage, tone } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and targetLanguage are required" });
    }

    const prompt = languageTransformPrompt(text, targetLanguage, tone);
    const result = await geminiModel.generateContent(prompt);
    const output = result.response.text();

    res.json({ result: output.trim() });
  } catch (error) {
    console.error("Language transform error:", error);
    res.status(500).json({ error: "Failed to transform language" });
  }
});

// Helper functions
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function sanitizeJson(text: string): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === "\n" || char === "\t") return char;
      return "";
    })
    .replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notely API running on http://localhost:${PORT}`);
  console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
  console.log(`🏷️  Tags API: http://localhost:${PORT}/api/tags`);
});

