import { exec } from "yt-dlp-exec";
import { unlink, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

/**
 * Extract audio from YouTube video and save as temporary file
 * Returns path to the audio file
 * 
 * Note: Requires yt-dlp to be installed on the system
 * Install with: brew install yt-dlp (macOS) or pip install yt-dlp
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

  // Create temporary file path (yt-dlp will add extension)
  const tempDir = tmpdir();
  const tempFileName = `yt-audio-${videoId}-${Date.now()}`;
  const tempFilePath = join(tempDir, `${tempFileName}.%(ext)s`);

  try {
    // Use yt-dlp to extract audio
    // Format: bestaudio/best - gets best audio quality
    await exec(videoUrl, {
      output: tempFilePath,
      format: "bestaudio/best",
      extractAudio: true,
      audioFormat: "mp3",
      noPlaylist: true,
      quiet: true,
    });

    // yt-dlp replaces %(ext)s with actual extension
    // Try to find the actual file (could be mp3, m4a, webm, opus, etc.)
    const extensions = ["mp3", "m4a", "webm", "opus", "ogg"];
    for (const ext of extensions) {
      const possiblePath = tempFilePath.replace("%(ext)s", ext);
      try {
        await access(possiblePath);
        return possiblePath;
      } catch {
        // File doesn't exist with this extension, try next
        continue;
      }
    }

    throw new Error("Could not find extracted audio file");
  } catch (error: any) {
    // Check if yt-dlp is installed
    if (
      error.message?.includes("yt-dlp") ||
      error.message?.includes("not found") ||
      error.code === "ENOENT"
    ) {
      throw new Error(
        "yt-dlp is not installed. Please install it: brew install yt-dlp (macOS) or pip install yt-dlp"
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
