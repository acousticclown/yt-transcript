import "dotenv/config";
import http from "http";
import { getSubtitles } from "youtube-caption-extractor";
import { cleanTranscript } from "./utils/cleanTranscript";
import { geminiModel } from "./ai/gemini";
import { basicSummaryPrompt } from "../../packages/prompts/basicSummary.ts";
import { sectionDetectionPrompt } from "../../packages/prompts/sectionDetection.ts";
import { extractAudio, cleanupAudioFile } from "./utils/audioExtraction";
import { transcribeAudio } from "./utils/whisperTranscription";

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

        console.log(
          `Fetched transcript from YouTube: ${transcript.length} segments`
        );
      } catch (error: any) {
        console.log(`YouTube captions not available (en): ${error.message}`);
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
          console.log(
            `Fetched transcript (auto language): ${transcript.length} segments`
          );
        } catch (err2: any) {
          console.log(`YouTube captions not available: ${err2.message}`);
          // Will fall back to audio extraction
        }
      }

      // Fallback: If no captions, try audio extraction + Whisper
      if (transcript.length === 0) {
        console.log("Attempting audio extraction + Whisper fallback...");
        let audioFilePath: string | null = null;

        try {
          // Extract audio (using service-based approach)
          audioFilePath = await extractAudio(url);
          console.log(`Audio extracted to: ${audioFilePath}`);

          // Transcribe with Whisper API
          transcript = await transcribeAudio(audioFilePath);
          transcriptSource = "whisper";
          console.log(
            `Whisper transcription complete: ${transcript.length} segments`
          );
        } catch (error: any) {
          console.error(
            `Audio extraction/transcription failed: ${error.message}`
          );

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

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error:
                "Transcript not available. This video doesn't have captions, and audio transcription failed.",
              details: error.message,
              transcript: [],
              language: "unknown",
              note: isYouTubeBlocked
                ? "YouTube is blocking audio extraction (403). Your OpenAI API key is configured correctly, but we can't get the audio file to transcribe. This is a YouTube limitation, not an API issue. Try a video with captions enabled - those work perfectly!"
                : error.message.includes("OPENAI_API_KEY") ||
                  error.message.includes("API key")
                ? "OpenAI API key issue: " + error.message
                : "Audio extraction failed: " + error.message,
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
          error: "Failed to fetch transcript",
          details: error.message,
        })
      );
    }
    return;
  }

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

      const cleanedText = cleanTranscript(transcript);

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
          error: "Failed to generate summary",
          details: err.message,
        })
      );
    }
    return;
  }

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

      const cleanedText = cleanTranscript(transcript);

      const prompt = sectionDetectionPrompt(cleanedText);
      const result = await geminiModel.generateContent(prompt);

      // Gemini sometimes wraps JSON in ``` — strip safely
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
          error: "Failed to generate sections",
          details: err.message,
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
