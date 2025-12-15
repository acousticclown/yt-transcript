import { pipeline } from "@xenova/transformers";
import { readFile } from "fs/promises";

// Initialize Whisper pipeline (lazy load on first use)
let whisperPipeline: any = null;

async function getWhisperPipeline() {
  if (!whisperPipeline) {
    console.log("Loading Whisper model (first time only, this may take a moment)...");
    whisperPipeline = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en", // Start with tiny English model (fastest)
      {
        // Use CPU for now (can optimize later)
        device: "cpu",
      }
    );
    console.log("Whisper model loaded successfully");
  }
  return whisperPipeline;
}

/**
 * Transcribe audio file using local Whisper model
 * Returns transcript in the same format as YouTube transcript
 */
export async function transcribeAudio(
  audioFilePath: string
): Promise<Array<{ text: string; start: number; duration: number }>> {
  try {
    // Load Whisper pipeline
    const transcriber = await getWhisperPipeline();

    // Read audio file
    const audioData = await readFile(audioFilePath);

    // Transcribe audio
    console.log("Transcribing audio with Whisper...");
    const result = await transcriber(audioData, {
      return_timestamps: true,
      chunk_length_s: 30, // Process in 30-second chunks
    });

    // Convert Whisper format to our transcript format
    const transcript: Array<{ text: string; start: number; duration: number }> =
      [];

    if (result.chunks && result.chunks.length > 0) {
      result.chunks.forEach((chunk: any) => {
        const start = chunk.timestamp[0] || 0;
        const end = chunk.timestamp[1] || start;
        transcript.push({
          text: chunk.text.trim(),
          start: start,
          duration: end - start,
        });
      });
    } else if (result.text) {
      // Fallback: if no chunks, create one entry with full text
      transcript.push({
        text: result.text.trim(),
        start: 0,
        duration: 0,
      });
    }

    console.log(`Transcription complete: ${transcript.length} segments`);
    return transcript;
  } catch (error: any) {
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}
