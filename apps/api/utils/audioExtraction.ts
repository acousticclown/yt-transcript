import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import ytdl from "@distube/ytdl-core";

/**
 * Extract audio from YouTube video using @distube/ytdl-core
 * This is a pure JavaScript solution that works on web servers
 */
export async function extractAudio(videoUrl: string): Promise<string> {
  // Extract video ID
  const videoIdMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    throw new Error("Could not extract video ID from URL");
  }

  // Create temporary file path
  const tempFilePath = join(tmpdir(), `yt-audio-${videoId}-${Date.now()}.mp3`);

  try {
    // Get video info with request options to avoid blocking
    const info = await ytdl.getInfo(videoUrl, {
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    });

    // Find the best audio-only format
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!audioFormat) {
      throw new Error("No audio format found for this video");
    }

    // Download audio stream with request options
    const audioStream = ytdl(videoUrl, {
      format: audioFormat,
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    });

    // Collect chunks
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }

    // Write to file
    const audioBuffer = Buffer.concat(chunks);
    await writeFile(tempFilePath, audioBuffer);

    return tempFilePath;
  } catch (error: any) {
    // Clean up on error
    try {
      await unlink(tempFilePath);
    } catch {
      // Ignore cleanup errors
    }
    
    // Provide more specific error messages
    if (error.message.includes("403") || error.statusCode === 403) {
      throw new Error(
        "YouTube is blocking audio extraction (403). This is a known limitation. Try a video with captions enabled."
      );
    }
    
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
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
