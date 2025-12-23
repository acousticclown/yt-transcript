// Load environment variables - prefer .env.production for production testing
import { config } from "dotenv";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory where this file is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up from src/ to apps/api/
const apiDir = join(__dirname, "..");
const prodEnvPath = join(apiDir, ".env.production");
const devEnvPath = join(apiDir, ".env");

if (existsSync(prodEnvPath)) {
  config({ path: prodEnvPath, override: true });
} else if (existsSync(devEnvPath)) {
  config({ path: devEnvPath });
} else {
  config(); // Use default .env or system env vars
}

import express from "express";
import cors from "cors";

// Routes
import notesRouter from "./routes/notes.js";
import tagsRouter from "./routes/tags.js";
import authRouter from "./routes/auth.js";
import aiRouter from "./routes/ai.js";
import publicRouter from "./routes/public.js";
import syncRouter from "./routes/sync.js";
import { prisma } from "./lib/prisma.js";

// Legacy imports for YouTube features
import { getSubtitles } from "youtube-caption-extractor";
import { geminiModel, getUserApiKey } from "../ai/gemini.js";
import {
  sectionDetectionPrompt,
  sectionDetectionWithTimestampsPrompt,
} from "../../../packages/prompts/sectionDetection.js";
import { basicSummaryPrompt } from "../../../packages/prompts/basicSummary.js";
import { cleanTranscript } from "../utils/cleanTranscript.js";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "notely-secret-key-change-in-production";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "10mb" }));

// Request logging middleware (for debugging)
if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/auth")) {
      console.log(`📥 ${req.method} ${req.path}`, {
        body: req.method !== "GET" ? req.body : undefined,
        headers: {
          "content-type": req.headers["content-type"],
          "authorization": req.headers["authorization"] ? "***" : undefined,
        },
      });
    }
    next();
  });
}

// Health check endpoint (before auth) - test database connection
app.get("/health", async (req: express.Request, res: express.Response) => {
  try {
    // Test database connection using a simple query that doesn't create prepared statements
    // Using findFirst is safer in serverless environments than $queryRaw
    await prisma.user.findFirst({ take: 1 });
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ Health check failed:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
    res.status(503).json({ 
      status: "error", 
      database: "disconnected",
      error: error?.message || "Database connection failed",
      code: error?.code,
      timestamp: new Date().toISOString()
    });
  }
});

// Public Routes (no auth required)
app.use("/api/public", publicRouter);

// API Routes (auth required)
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/sync", syncRouter);

// Health check
app.get("/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok", version: "1.3.0" });
});

// ============================================
// Legacy YouTube/AI endpoints (keeping for compatibility)
// ============================================

// POST /transcript - Extract YouTube transcript
app.post("/transcript", async (req: express.Request, res: express.Response) => {
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
app.post("/summary", async (req: express.Request, res: express.Response) => {
  try {
    // Require authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let userId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user's API key
    const userApiKey = await getUserApiKey(userId);
    if (!userApiKey) {
      return res.status(400).json({ error: "API_KEY_REQUIRED" });
    }

    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const prompt = basicSummaryPrompt(transcript);
    const summary = await geminiModel.generateContent(prompt, userApiKey);

    res.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// POST /sections - Generate structured sections with timestamps
app.post("/sections", async (req: express.Request, res: express.Response) => {
  try {
    // Require authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let userId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user's API key
    const userApiKey = await getUserApiKey(userId);
    if (!userApiKey) {
      return res.status(400).json({ error: "API_KEY_REQUIRED" });
    }

    const { transcript, subtitles } = req.body;
    console.log(
      "[Sections] Received - transcript:",
      !!transcript,
      "subtitles:",
      subtitles?.length || 0
    );

    if (!transcript && !subtitles) {
      return res
        .status(400)
        .json({ error: "Transcript or subtitles required" });
    }

    // Use timestamps if available, otherwise estimate
    const prompt =
      subtitles && subtitles.length > 0
        ? sectionDetectionWithTimestampsPrompt(subtitles)
        : sectionDetectionPrompt(transcript);

    console.log("[Sections] Calling Gemini with user's API key...");
    const text = await geminiModel.generateContent(prompt, userApiKey);
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

    console.log(
      "[Sections] Parsed sections:",
      sections.length,
      "summary:",
      summary ? summary.substring(0, 50) : "(none)",
      "tags:",
      tags
    );
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
    if (match && match[1]) return match[1];
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

// Global error handler (must be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Unhandled error:", {
    message: err?.message,
    stack: err?.stack,
    name: err?.name,
    code: err?.code,
    path: req.path,
    method: req.method,
  });
  
  res.status(err?.status || 500).json({
    error: err?.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  });
});

// Export for Vercel serverless functions
export default app;

// Start server (only in non-Vercel environments)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Notely API running on http://localhost:${PORT}`);
    console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
    console.log(`🏷️  Tags API: http://localhost:${PORT}/api/tags`);
  });
}
