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

  return `Analyze this YouTube video transcript and create sections with an overall summary.

VIDEO DURATION: ${videoDuration} seconds

TRANSCRIPT (format: [second] text):
${formattedTranscript}

INSTRUCTIONS:
1. Write a concise overall summary of the entire video (2-3 sentences)
2. Group the transcript into 3-6 logical sections based on topic changes
3. For each section, use the [second] value from the FIRST line of that section as startTime
4. endTime = startTime of next section (or ${videoDuration} for last section)

EXAMPLE: If section starts at "[32] docker containers..." then startTime = 32

Return ONLY this JSON (no other text):
{
  "summary": "Overall video summary in 2-3 sentences",
  "sections": [
    {
      "title": "Section Title",
      "summary": "Brief summary",
      "bullets": ["point 1", "point 2"],
      "startTime": 0,
      "endTime": 32
    }
  ]
}`;
}
