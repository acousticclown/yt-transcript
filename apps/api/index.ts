import { serve } from "bun";
import { YoutubeTranscript } from "youtube-transcript";
import { cleanTranscript } from "./utils/cleanTranscript";
import { geminiModel } from "./ai/gemini";
import { basicSummaryPrompt } from "../../packages/prompts/basicSummary";
import { sectionDetectionPrompt } from "../../packages/prompts/sectionDetection";

serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "POST" && pathname === "/transcript") {
      try {
        const body = (await req.json()) as { url?: string };
        const { url } = body;

        if (!url) {
          return new Response(
            JSON.stringify({ error: "YouTube URL is required" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // Basic URL validation
        const isValidYouTubeUrl =
          url.includes("youtube.com/watch") || url.includes("youtu.be/");

        if (!isValidYouTubeUrl) {
          return new Response(
            JSON.stringify({ error: "Invalid YouTube URL" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        const transcript = await YoutubeTranscript.fetchTranscript(url);

        // Log transcript length for debugging
        console.log(`Fetched transcript: ${transcript.length} segments`);

        // If transcript is empty, the video likely doesn't have captions
        if (transcript.length === 0) {
          return new Response(
            JSON.stringify({
              error: "Transcript not available yet",
              transcript: [],
              language: "unknown",
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        return new Response(
          JSON.stringify({
            transcript,
            language: "unknown",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            error: "Failed to fetch transcript",
            details: error.message,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    if (req.method === "POST" && pathname === "/summary") {
      try {
        const body = (await req.json()) as { transcript?: unknown };
        const { transcript } = body;

        if (!transcript || !Array.isArray(transcript)) {
          return new Response(
            JSON.stringify({ error: "Transcript array required" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        const cleanedText = cleanTranscript(transcript);

        const prompt = basicSummaryPrompt(cleanedText);
        const summary = await geminiModel.generateContent(prompt);

        return new Response(
          JSON.stringify({
            summary,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            error: "Failed to generate summary",
            details: err.message,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    if (req.method === "POST" && pathname === "/sections") {
      try {
        const body = (await req.json()) as { transcript?: unknown };
        const { transcript } = body;

        if (!transcript || !Array.isArray(transcript)) {
          return new Response(
            JSON.stringify({ error: "Transcript array required" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
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

        return new Response(JSON.stringify(sections), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            error: "Failed to generate sections",
            details: err.message,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  },
});

console.log("🚀 Transcript API server running on http://localhost:3001");
