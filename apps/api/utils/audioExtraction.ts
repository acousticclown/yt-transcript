import ytdl from "@distube/ytdl-core";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

/**
 * Extract audio from YouTube video and save as temporary file
 * Returns path to the audio file
 */
export async function extractAudio(videoUrl: string): Promise<string> {
  // Extract video ID from URL
  const videoIdMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : videoUrl;

  if (!videoId) {
    throw new Error("Could not extract video ID from URL");
  }

  // Create temporary file path
  const tempFilePath = join(tmpdir(), `yt-audio-${videoId}-${Date.now()}.mp3`);

  return new Promise((resolve, reject) => {
    try {
      // Get audio stream
      const stream = ytdl(videoUrl, {
        quality: "lowestaudio",
        filter: "audioonly",
      });

      const chunks: Buffer[] = [];

      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          await writeFile(tempFilePath, buffer);
          resolve(tempFilePath);
        } catch (error: any) {
          reject(new Error(`Failed to save audio file: ${error.message}`));
        }
      });

      stream.on("error", (error: Error) => {
        reject(new Error(`Failed to extract audio: ${error.message}`));
      });
    } catch (error: any) {
      reject(new Error(`Failed to create stream: ${error.message}`));
    }
  });
}

/**
 * Clean up temporary audio file
 */
export async function cleanupAudioFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    // Ignore cleanup errors
    console.warn(`Failed to cleanup audio file: ${filePath}`);
  }
}

