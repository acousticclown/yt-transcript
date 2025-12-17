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
  // Calculate video duration from last subtitle
  const lastSub = subtitles[subtitles.length - 1];
  const videoDuration = Math.ceil(lastSub.start + lastSub.dur);
  
  // Format subtitles with raw seconds for AI
  const formattedTranscript = subtitles
    .map((s) => `[${Math.round(s.start)}s] ${s.text}`)
    .join("\n");

  return `You are given a YouTube video transcript with timestamps in seconds.

Video duration: ${videoDuration} seconds

Your task:
- Identify major topic changes
- Break the transcript into logical sections (3-6 sections typically)
- Each section must represent one clear idea
- Use the EXACT timestamps from the transcript for startTime
- endTime should be the startTime of the next section (or video duration for last section)

CRITICAL RULES:
- Return ONLY valid JSON, no explanations
- startTime and endTime must be integers IN SECONDS
- startTime values must come from the [Xs] timestamps in the transcript
- endTime must NOT exceed ${videoDuration} seconds (the video duration)
- Do NOT invent timestamps - use only what appears in the transcript

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
