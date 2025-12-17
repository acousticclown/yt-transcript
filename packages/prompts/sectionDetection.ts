export function sectionDetectionPrompt(transcript: string): string {
  return `You are given a cleaned transcript of a YouTube video.

Your task:
- Identify major topic changes
- Break the transcript into logical sections
- Each section must represent one clear idea
- Estimate timestamps for each section based on content flow

Rules:
- Return ONLY valid JSON
- Do NOT include explanations
- Do NOT add information not present in the transcript
- Be concise and factual
- Timestamps should be in seconds (integers)
- Estimate timestamps based on typical speech pace (~150 words/min)

JSON format:
{
  "sections": [
    {
      "title": string,
      "summary": string,
      "bullets": string[],
      "startTime": number,
      "endTime": number
    }
  ]
}

Transcript:
"""
${transcript}
"""
`;
}

export function sectionDetectionWithTimestampsPrompt(
  subtitles: { text: string; start: number; dur: number }[]
): string {
  // Format subtitles with timestamps for AI
  const formattedTranscript = subtitles
    .map((s) => `[${formatTime(s.start)}] ${s.text}`)
    .join("\n");

  return `You are given a YouTube video transcript with timestamps.

Your task:
- Identify major topic changes
- Break the transcript into logical sections
- Each section must represent one clear idea
- Use the actual timestamps from the transcript

Rules:
- Return ONLY valid JSON
- Do NOT include explanations
- Do NOT add information not present in the transcript
- Be concise and factual
- Use actual timestamps from the transcript (in seconds)

JSON format:
{
  "sections": [
    {
      "title": string,
      "summary": string,
      "bullets": string[],
      "startTime": number,
      "endTime": number
    }
  ]
}

Transcript with timestamps:
"""
${formattedTranscript}
"""`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
