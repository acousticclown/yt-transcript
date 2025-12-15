export function sectionDetectionPrompt(transcript: string): string {
  return `You are given a cleaned transcript of a YouTube video.

Your task:
- Identify major topic changes
- Break the transcript into logical sections
- Each section must represent one clear idea

Rules:
- Return ONLY valid JSON
- Do NOT include explanations
- Do NOT add information not present in the transcript
- Be concise and factual

JSON format:
{
  "sections": [
    {
      "title": string,
      "summary": string,
      "bullets": string[]
    }
  ]
}

Transcript:
"""
${transcript}
"""
`;
}
