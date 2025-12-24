export function basicSummaryPrompt(transcript: string): string {
  return `You are given a transcript of a YouTube video.

Task:
- Summarize the content in clear, simple English
- Keep it concise
- Do not add extra knowledge
- Do not invent details

Transcript:
"""
${transcript}
"""
`;
}

