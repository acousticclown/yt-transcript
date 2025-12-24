/**
 * Regenerate a single section from transcript
 * This is surgical - only affects one section, preserves user edits elsewhere
 */

export function regenerateSectionPrompt(
  section: {
    title: string;
    summary: string;
    bullets: string[];
  },
  transcript: string
): string {
  return `
You are regenerating ONE section of notes from a YouTube video.

Rules:
- Focus ONLY on this section's topic
- Do NOT introduce new topics
- Improve clarity and structure
- Keep it concise
- Return ONLY valid JSON
- Do NOT include explanations

Output format:
{
  "title": string,
  "summary": string,
  "bullets": string[]
}

Current section:
${JSON.stringify(section, null, 2)}

Full transcript (for context):
"""
${transcript}
"""
`;
}

