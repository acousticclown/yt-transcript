import "dotenv/config";
import express from "express";
import cors from "cors";

// Routes
import notesRouter from "./routes/notes";
import tagsRouter from "./routes/tags";
import authRouter from "./routes/auth";
import aiRouter from "./routes/ai";

// Legacy imports for YouTube features
import { getSubtitles } from "youtube-caption-extractor";
import { geminiModel } from "../ai/gemini";
import { sectionDetectionPrompt, sectionDetectionWithTimestampsPrompt } from "../../../packages/prompts/sectionDetection";
import { cleanTranscript } from "../utils/cleanTranscript";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/ai", aiRouter);

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
    console.log("[Transcript] Extracting from:", url);
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const videoId = extractVideoId(url);
    console.log("[Transcript] Video ID:", videoId);
    
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    console.log("[Transcript] Fetching subtitles...");
    const subtitles = await getSubtitles({ videoID: videoId, lang: "en" });
    console.log("[Transcript] Got subtitles:", subtitles?.length || 0);
    
    if (!subtitles || subtitles.length === 0) {
      return res.status(404).json({ error: "No captions found" });
    }

    // cleanTranscript expects array of {text} objects
    const cleanedTranscript = cleanTranscript(subtitles);

    // Return both cleaned transcript and raw subtitles with timestamps
    res.json({
      transcript: cleanedTranscript,
      videoId,
      subtitles: subtitles.map((s: any) => ({
        text: s.text,
        start: parseFloat(s.start) || 0,
        dur: parseFloat(s.dur) || 0,
      })),
    });
  } catch (error: any) {
    console.error("[Transcript] Error:", error?.message || error);
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
    const summary = await geminiModel.generateContent(prompt);

    res.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// POST /sections - Generate structured sections with timestamps
app.post("/sections", async (req, res) => {
  try {
    const { transcript, subtitles } = req.body;
    console.log("[Sections] Received - transcript:", !!transcript, "subtitles:", subtitles?.length || 0);
    
    if (!transcript && !subtitles) {
      return res.status(400).json({ error: "Transcript or subtitles required" });
    }

    // Use timestamps if available, otherwise estimate
    const prompt = subtitles && subtitles.length > 0
      ? sectionDetectionWithTimestampsPrompt(subtitles)
      : sectionDetectionPrompt(transcript);

    console.log("[Sections] Calling Gemini...");
    // geminiModel.generateContent returns string directly
    const text = await geminiModel.generateContent(prompt);
    console.log("[Sections] Got response, length:", text.length);

    // Parse JSON from response - handle both array and object formats
    let sections;
    let summary = "";
    let tags: string[] = [];
    const objectMatch = text.match(/\{[\s\S]*"sections"[\s\S]*\}/);
    const arrayMatch = text.match(/\[[\s\S]*\]/);

    if (objectMatch) {
      const parsed = JSON.parse(sanitizeJson(objectMatch[0]));
      sections = parsed.sections || parsed;
      summary = parsed.summary || "";
      tags = parsed.tags || [];
    } else if (arrayMatch) {
      sections = JSON.parse(sanitizeJson(arrayMatch[0]));
    } else {
      console.error("[Sections] No JSON found in:", text.substring(0, 500));
      throw new Error("No valid JSON found in response");
    }

    // Always include "youtube" tag
    if (!tags.includes("youtube")) {
      tags = ["youtube", ...tags];
    }

    console.log("[Sections] Parsed sections:", sections.length, "summary:", summary ? summary.substring(0, 50) : "(none)", "tags:", tags);
    res.json({ sections, summary, tags });
  } catch (error: any) {
    console.error("[Sections] Error:", error?.message || error);
    res.status(500).json({ error: "Failed to generate sections" });
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

