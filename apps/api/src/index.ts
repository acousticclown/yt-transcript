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
import { logger } from "./lib/logger.js";

// Legacy imports for YouTube features
import { getSubtitles } from "youtube-caption-extractor";
import { geminiModel, getUserApiKey } from "../ai/gemini.js";
import {
  sectionDetectionPrompt,
  sectionDetectionWithTimestampsPrompt,
} from "../../packages/prompts/sectionDetection.js";
import { basicSummaryPrompt } from "../../packages/prompts/basicSummary.js";
import { cleanTranscript } from "../utils/cleanTranscript.js";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "notely-secret-key-change-in-production";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      return callback(null, true);
    }

    // If not running on Vercel, allow localhost origins (local development)
    // This works even if NODE_ENV is set to production for testing
    if (process.env.VERCEL !== "1") {
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
    }

    // Check against allowed origins from environment variable
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : ["http://localhost:3000"];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Default: allow localhost:3000 if no CORS_ORIGIN is set
    if (!process.env.CORS_ORIGIN && origin === "http://localhost:3000") {
      return callback(null, true);
    }

    // Log rejected origin for debugging
    if (process.env.DEBUG === "true" || process.env.NODE_ENV === "development") {
      logger.debug(`CORS rejected origin: ${origin}`);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "10mb" }));

// Request logging middleware (for debugging)
if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/auth")) {
      logger.debug(`📥 ${req.method} ${req.path}`, {
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
    // Test database connection using $executeRawUnsafe which doesn't create prepared statements
    // This works better with PgBouncer transaction pooling mode
    await prisma.$executeRawUnsafe("SELECT 1");
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    // Check if it's a prepared statement error (PgBouncer issue)
    const isPreparedStatementError = 
      error?.message?.includes("prepared statement") || 
      error?.code === "P2010" ||
      error?.message?.includes("42P05");
    
    if (isPreparedStatementError) {
      // This means database is reachable but connection pooling needs configuration
      logger.warn("⚠️  Health check: Prepared statement error (PgBouncer). Database is reachable but connection string needs ?pgbouncer=true");
      res.json({ 
        status: "warning", 
        database: "connected",
        message: "Database connection works but connection pooling needs configuration. Add ?pgbouncer=true to DATABASE_URL.",
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    logger.error("❌ Health check failed:", {
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
    logger.debug("[Transcript] Extracting from:", url);

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const videoId = extractVideoId(url);
    logger.debug("[Transcript] Video ID:", videoId);

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    logger.debug("[Transcript] Fetching subtitles...", { videoId, environment: process.env.VERCEL ? "production" : "local" });
    let subtitles: any[] | null = null;
    let lastError: any = null;
    let attemptResults: any[] = [];

    // Try multiple languages in order of preference
    // This helps with videos that might have captions in different languages
    const languagesToTry = ["en", "en-US", "en-GB"];
    
    for (const lang of languagesToTry) {
      try {
        logger.debug(`[Transcript] Attempting lang=${lang} for videoId=${videoId}`);
        // The library should handle serverless environments automatically in newer versions
        // It includes bot detection bypass and dual extraction methods
        subtitles = await getSubtitles({ videoID: videoId, lang });
        
        const result = {
          lang,
          success: true,
          subtitleCount: subtitles?.length || 0,
          hasSubtitles: !!(subtitles && subtitles.length > 0),
        };
        attemptResults.push(result);
        logger.debug(`[Transcript] Result for lang=${lang}:`, result);
        
        if (subtitles && subtitles.length > 0) {
          logger.debug(`[Transcript] Got subtitles with lang=${lang}:`, subtitles.length);
          break;
        } else {
          logger.warn(`[Transcript] Empty result for lang=${lang}, trying next language...`);
        }
      } catch (error: any) {
        // Log full error details for debugging
        const errorDetails = {
          message: error?.message,
          stack: error?.stack?.substring(0, 500), // Truncate stack for logging
          name: error?.name,
          code: error?.code,
          statusCode: error?.statusCode,
          response: error?.response?.status,
          responseData: error?.response?.data,
          lang,
          videoId,
        };
        attemptResults.push({
          lang,
          success: false,
          error: error?.message || String(error),
          errorType: error?.name,
          statusCode: error?.statusCode || error?.response?.status,
        });
        logger.error(`[Transcript] Failed with lang=${lang}:`, errorDetails);
        lastError = error;
        // Continue to next language
        continue;
      }
    }

    if (!subtitles || subtitles.length === 0) {
      // Provide more specific error message based on the error
      let errorMessage = "No captions found";
      let isProductionBlock = false;
      const isProduction = !!process.env.VERCEL;
      
      // Check if we're in production and got empty results (likely blocking)
      if (isProduction && !lastError && attemptResults.every(r => r.success && !r.hasSubtitles)) {
        isProductionBlock = true;
        errorMessage = "YouTube is blocking caption access from this server. This is a known limitation when using cloud hosting (like Vercel). The video may have captions, but YouTube blocks automated requests from cloud IP addresses.\n\nPossible solutions:\n• Try again later (rate limits may reset)\n• Use a different video\n• This feature works better when running the API server locally";
      } else if (lastError) {
        const errorMsg = lastError?.message || String(lastError);
        const errorString = JSON.stringify(lastError);
        
        // Check for various blocking patterns
        if (
          errorMsg.includes("403") || 
          errorMsg.includes("Forbidden") ||
          errorMsg.includes("blocked") ||
          errorString.includes("403") ||
          lastError?.statusCode === 403 ||
          lastError?.response?.status === 403
        ) {
          isProductionBlock = true;
          errorMessage = "YouTube is blocking caption access from this server. This is a known limitation when using cloud hosting (like Vercel). The video has captions, but YouTube blocks automated requests from cloud IP addresses.\n\nPossible solutions:\n• Try again later (rate limits may reset)\n• Use a different video\n• This feature works better when running the API server locally";
        } else if (errorMsg.includes("404") || errorMsg.includes("Not Found") || lastError?.statusCode === 404) {
          errorMessage = "Video not found or captions are not available for this video.";
        } else if (errorMsg.includes("private") || errorMsg.includes("Private")) {
          errorMessage = "This video is private or unavailable.";
        } else if (errorMsg.includes("timeout") || errorMsg.includes("ETIMEDOUT")) {
          errorMessage = "Request timed out. YouTube may be slow to respond or blocking the request.";
          isProductionBlock = true;
        } else {
          // Include the actual error message for debugging
          errorMessage = `Failed to fetch captions: ${errorMsg}`;
        }
      } else if (isProduction) {
        // Production environment, no error thrown, but no results - likely blocking
        isProductionBlock = true;
        errorMessage = "Unable to fetch captions. This may be due to YouTube blocking requests from cloud servers. Try again later or use a different video.";
      }
      
      // Enhanced logging for production debugging
      logger.error("[Transcript] No captions found:", {
        videoId,
        error: lastError?.message || lastError || "No error thrown, but no subtitles returned",
        errorType: lastError?.name,
        statusCode: lastError?.statusCode || lastError?.response?.status,
        isProductionBlock,
        environment: isProduction ? "production" : "local",
        attemptResults,
        allAttemptsFailed: attemptResults.every(r => !r.hasSubtitles),
      });
      
      return res.status(404).json({ 
        error: errorMessage,
        videoId,
        // Include debug info in development or if explicitly requested
        ...(process.env.NODE_ENV === "development" || process.env.DEBUG === "true" ? {
          debug: {
            errorType: lastError?.name,
            statusCode: lastError?.statusCode || lastError?.response?.status,
            attempts: attemptResults,
            isProductionBlock,
          }
        } : {})
      });
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
    logger.error("[Transcript] Error:", {
      message: error?.message || error,
      videoId: req.body?.url ? extractVideoId(req.body.url) : "unknown",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });
    
    // Provide more specific error messages
    const errorMsg = error?.message || String(error);
    let userMessage = "Failed to extract transcript";
    
    if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
      userMessage = "YouTube is blocking caption access. This may be due to regional restrictions, IP blocking, or rate limiting. Try again later or use a different video.";
    } else if (errorMsg.includes("network") || errorMsg.includes("ECONNREFUSED") || errorMsg.includes("ETIMEDOUT")) {
      userMessage = "Network error while fetching captions. Please check your connection and try again.";
    } else if (errorMsg.includes("timeout")) {
      userMessage = "Request timed out. The video might be too long or YouTube is slow to respond. Try again later.";
    }
    
    res.status(500).json({ error: userMessage });
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
    logger.error("Summary error:", error);
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

    logger.debug("[Sections] Calling Gemini with user's API key...");
    const text = await geminiModel.generateContent(prompt, userApiKey);
    logger.debug("[Sections] Got response, length:", text.length);

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
      logger.error("[Sections] No JSON found in:", text.substring(0, 500));
      throw new Error("No valid JSON found in response");
    }

    // Always include "youtube" tag
    if (!tags.includes("youtube")) {
      tags = ["youtube", ...tags];
    }

    logger.debug(
      "[Sections] Parsed sections:",
      sections.length,
      "summary:",
      summary ? summary.substring(0, 50) : "(none)",
      "tags:",
      tags
    );
    res.json({ sections, summary, tags });
  } catch (error: any) {
    logger.error("[Sections] Error:", error?.message || error);
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
  logger.error("❌ Unhandled error:", {
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
  logger.log(`🚀 Notely API running on http://localhost:${PORT}`);
  logger.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
  logger.log(`🏷️  Tags API: http://localhost:${PORT}/api/tags`);
  });
}
