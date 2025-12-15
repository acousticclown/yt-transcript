import { serve } from "bun";
import { YoutubeTranscript } from "youtube-transcript";

serve({
  port: 3001,
  async fetch(req) {
    if (req.method === "POST" && new URL(req.url).pathname === "/transcript") {
      try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
          return new Response(
            JSON.stringify({ error: "YouTube URL is required" }),
            { 
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        // Basic URL validation
        const isValidYouTubeUrl = 
          url.includes("youtube.com/watch") || 
          url.includes("youtu.be/");

        if (!isValidYouTubeUrl) {
          return new Response(
            JSON.stringify({ error: "Invalid YouTube URL" }),
            { 
              status: 400,
              headers: { "Content-Type": "application/json" }
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
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        return new Response(
          JSON.stringify({
            transcript,
            language: "unknown",
          }),
          { 
            headers: { "Content-Type": "application/json" }
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
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("🚀 Transcript API server running on http://localhost:3001");
