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
  
  // Format subtitles with raw seconds for AI - include actual second values
  const formattedTranscript = subtitles
    .map((s) => {
      const sec = Math.round(s.start);
      return `[${sec}] ${s.text}`;
    })
    .join("\n");

  return `Analyze this YouTube video transcript.

VIDEO DURATION: ${videoDuration} seconds

TRANSCRIPT (format: [second] text):
${formattedTranscript}

INSTRUCTIONS:
1. Group the transcript into 3-6 logical sections based on topic changes
2. For each section, use the [second] value from the FIRST line of that section as startTime
3. endTime = startTime of next section (or ${videoDuration} for last section)
4. IMPORTANT: Include a "summary" field at the root level with 2-3 sentences summarizing the entire video

EXAMPLE: If section starts at "[32] docker containers..." then startTime = 32

Return ONLY this exact JSON structure (no other text):
{
  "summary": "A 2-3 sentence summary of the entire video content goes here.",
  "sections": [
    {
      "title": "Section Title",
      "summary": "Brief summary of this section",
      "bullets": ["key point 1", "key point 2"],
      "startTime": 0,
      "endTime": 32
    }
  ]
}

CRITICAL: The response MUST be a JSON object with both "summary" and "sections" keys. Do NOT return just an array.`;
}
