// Environment & Core
import "dotenv/config";
import http from "http";
import { randomUUID } from "crypto";

// YouTube & Transcript
import { getSubtitles } from "youtube-caption-extractor";
import { extractAudio, cleanupAudioFile } from "./utils/audioExtraction";
import { transcribeAudio } from "./utils/whisperTranscription";
import { cleanTranscript } from "./utils/cleanTranscript";

// AI
import { geminiModel } from "./ai/gemini";
import { basicSummaryPrompt } from "../../packages/prompts/basicSummary.ts";
import { sectionDetectionPrompt } from "../../packages/prompts/sectionDetection.ts";
import { inlineActionPrompt } from "../../packages/prompts/inlineActions.ts";

// Storage & Export
import { saveNote } from "./storage/saveNote";
import { toMarkdown } from "./utils/toMarkdown";

const PORT = 3001;

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // ============================================
  // POST /transcript - Extract transcript from YouTube
  // ============================================
  // Step 1: Try YouTube captions (fast, free)
  // Step 2: Fallback to audio extraction + Whisper (if captions unavailable)
  // ============================================
  if (req.method === "POST" && pathname === "/transcript") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }
      const parsedBody = JSON.parse(body) as { url?: string };
      const { url } = parsedBody;

      if (!url) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "YouTube URL is required" }));
        return;
      }

      // Basic URL validation
      const isValidYouTubeUrl =
        url.includes("youtube.com/watch") || url.includes("youtu.be/");

      if (!isValidYouTubeUrl) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid YouTube URL" }));
        return;
      }

      // Extract video ID
      const videoIdMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      );
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Could not extract video ID from URL" })
        );
        return;
      }

      // Try YouTube captions first (fast path)
      let transcript: Array<{ text: string; start: number; duration: number }> =
        [];
      let transcriptSource = "youtube_captions";

      try {
        // Try to fetch transcript with youtube-caption-extractor (works better!)
        const subtitles = await getSubtitles({
          videoID: videoId,
          lang: "en", // Try English first
        });

        // Convert format: { start: '1.36', dur: '1.68', text: '...' }
        // to { text: '...', start: 1.36, duration: 1.68 }
        transcript = subtitles.map((sub: any) => ({
          text: sub.text || "",
          start: parseFloat(sub.start) || 0,
          duration: parseFloat(sub.dur) || 0,
        }));

      } catch (error: any) {
        // Try without language specification (auto-detect)
        try {
          const subtitles = await getSubtitles({
            videoID: videoId,
          });
          transcript = subtitles.map((sub: any) => ({
            text: sub.text || "",
            start: parseFloat(sub.start) || 0,
            duration: parseFloat(sub.dur) || 0,
          }));
        } catch (err2: any) {
          // Captions not available - will fall back to audio extraction
        }
      }

      // Step 2: Fallback to audio extraction + Whisper (if captions unavailable)
      // Note: YouTube often blocks audio extraction (403), so this may fail
      if (transcript.length === 0) {
        let audioFilePath: string | null = null;

        try {
          // Extract audio from YouTube video
          audioFilePath = await extractAudio(url);

          // Transcribe with OpenAI Whisper API
          transcript = await transcribeAudio(audioFilePath);
          transcriptSource = "whisper";
        } catch (error: any) {

          // Clean up audio file if it exists
          if (audioFilePath) {
            await cleanupAudioFile(audioFilePath);
          }

          // Check if it's a YouTube blocking issue
          const isYouTubeBlocked =
            error.message.includes("403") ||
            error.message.includes("Status code: 403") ||
            error.message.includes("decipher function") ||
            error.message.includes("blocking audio extraction");

          // Return user-friendly error message
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: isYouTubeBlocked
                ? "This video doesn't have captions, and YouTube is blocking audio extraction. Try a video with captions enabled."
                : "Transcript not available for this video. This video may not have captions enabled.",
              transcript: [],
              language: "unknown",
            })
          );
          return;
        } finally {
          // Always clean up audio file
          if (audioFilePath) {
            await cleanupAudioFile(audioFilePath);
          }
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          transcript,
          language: "unknown",
          source: transcriptSource,
        })
      );
    } catch (error: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to fetch transcript. Please try again.",
        })
      );
    }
    return;
  }

  // ============================================
  // POST /summary - Generate AI summary
  // ============================================
  // Step 1: Clean transcript (non-AI, deterministic)
  // Step 2: Run AI for summarization
  // ============================================
  if (req.method === "POST" && pathname === "/summary") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }
      const parsedBody = JSON.parse(body) as { transcript?: unknown };
      const { transcript } = parsedBody;

      if (!transcript || !Array.isArray(transcript)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Transcript array required" }));
        return;
      }

      // Clean transcript (deterministic, no AI)
      const cleanedText = cleanTranscript(transcript);

      // Generate summary using AI
      const prompt = basicSummaryPrompt(cleanedText);
      const summary = await geminiModel.generateContent(prompt);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          summary,
        })
      );
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to generate summary. Please try again.",
        })
      );
    }
    return;
  }

  // ============================================
  // POST /sections - Generate structured sections
  // ============================================
  // Step 1: Clean transcript (non-AI, deterministic)
  // Step 2: Run AI for section detection and structuring
  // ============================================
  if (req.method === "POST" && pathname === "/sections") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }
      const parsedBody = JSON.parse(body) as { transcript?: unknown };
      const { transcript } = parsedBody;

      if (!transcript || !Array.isArray(transcript)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Transcript array required" }));
        return;
      }

      // Clean transcript (deterministic, no AI)
      const cleanedText = cleanTranscript(transcript);

      // Generate structured sections using AI
      const prompt = sectionDetectionPrompt(cleanedText);
      const result = await geminiModel.generateContent(prompt);

      // Gemini sometimes wraps JSON in markdown code blocks - strip safely
      const jsonText = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const sections = JSON.parse(jsonText);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(sections));
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to generate sections. Please try again.",
        })
      );
    }
    return;
  }

  // ============================================
  // POST /save - Save notes to local storage
  // ============================================
  if (req.method === "POST" && pathname === "/save") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }

      let parsedBody: {
        url?: string;
        sections?: Array<{
          title: string;
          summary: string;
          bullets: string[];
        }>;
      };

      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON in request body" }));
        return;
      }

      const { url, sections } = parsedBody;

      if (!url || typeof url !== "string" || url.trim() === "") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Valid URL is required" }));
        return;
      }

      if (!sections || !Array.isArray(sections) || sections.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Sections array is required and cannot be empty" }));
        return;
      }

      // Validate sections structure
      for (const section of sections) {
        if (!section || typeof section !== "object") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid section structure" }));
          return;
        }
        if (!Array.isArray(section.bullets)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Section bullets must be an array" }));
          return;
        }
      }

      const note = {
        id: randomUUID(),
        url: url.trim(),
        createdAt: new Date().toISOString(),
        sections,
      };

      await saveNote(note);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id: note.id }));
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to save note. Please try again.",
        })
      );
    }
    return;
  }

  // ============================================
  // POST /export/markdown - Export notes as Markdown
  // ============================================
  if (req.method === "POST" && pathname === "/export/markdown") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }

      let parsedBody: {
        sections?: Array<{
          title: string;
          summary: string;
          bullets: string[];
        }>;
      };

      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON in request body" }));
        return;
      }

      const { sections } = parsedBody;

      if (!sections || !Array.isArray(sections)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Sections array is required" }));
        return;
      }

      const markdown = toMarkdown(sections);

      res.writeHead(200, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": 'attachment; filename="notes.md"',
      });
      res.end(markdown);
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to export markdown. Please try again.",
        })
      );
    }
    return;
  }

  // ============================================
  // POST /ai/inline - Inline AI actions (simplify, expand, example)
  // ============================================
  if (req.method === "POST" && pathname === "/ai/inline") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }

      let parsedBody: {
        action?: "simplify" | "expand" | "example";
        text?: string;
      };

      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON in request body" }));
        return;
      }

      const { action, text } = parsedBody;

      if (!action || !text) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Action and text are required" })
        );
        return;
      }

      if (!["simplify", "expand", "example"].includes(action)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid action" }));
        return;
      }

      // Generate AI response
      const prompt = inlineActionPrompt(action, text);
      const result = await geminiModel.generateContent(prompt);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text: result.trim() }));
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to process inline AI action",
        })
      );
    }
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`🚀 Transcript API server running on http://localhost:${PORT}`);
});
