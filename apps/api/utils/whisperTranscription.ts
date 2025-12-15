import OpenAI from "openai";
import { createReadStream } from "fs";

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "OPENAI_API_KEY not set. Whisper transcription will not work."
  );
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

/**
 * Transcribe audio file using OpenAI Whisper API
 * Returns transcript in the same format as YouTube transcript
 */
export async function transcribeAudio(
  audioFilePath: string
): Promise<Array<{ text: string; start: number; duration: number }>> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    // Create a readable stream from the audio file
    const audioStream = createReadStream(audioFilePath) as any;

    // Transcribe using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      response_format: "verbose_json", // Get timestamps
      timestamp_granularities: ["segment"],
    });

    // Convert Whisper format to our transcript format
    const transcript: Array<{ text: string; start: number; duration: number }> =
      [];

    if (transcription.segments && transcription.segments.length > 0) {
      transcription.segments.forEach((segment: any) => {
        transcript.push({
          text: segment.text.trim(),
          start: segment.start,
          duration: segment.end - segment.start,
        });
      });
    } else {
      // Fallback: if no segments, create one entry with full text
      transcript.push({
        text: transcription.text || "",
        start: 0,
        duration: 0,
      });
    }

    return transcript;
  } catch (error: any) {
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}

