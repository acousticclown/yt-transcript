/**
 * AI Note Generation Prompts
 * Optimized for structured, accurate output with streaming support
 */

export type NoteGenerationStep = 
  | "analyzing"
  | "structuring" 
  | "generating_title"
  | "generating_content"
  | "generating_sections"
  | "generating_tags"
  | "finalizing";

export const STEP_MESSAGES: Record<NoteGenerationStep, string> = {
  analyzing: "Understanding your request...",
  structuring: "Planning note structure...",
  generating_title: "Creating title...",
  generating_content: "Writing main content...",
  generating_sections: "Organizing into sections...",
  generating_tags: "Adding relevant tags...",
  finalizing: "Polishing your note...",
};

/**
 * System prompt for note generation - sets the AI's role and capabilities
 */
export const NOTE_GENERATION_SYSTEM_PROMPT = `You are Notely AI, an expert note-taking assistant. You create well-structured, comprehensive notes that are:
- Clear and scannable
- Actionable with specific details
- Organized logically
- Professional yet approachable

You always respond with valid JSON only, no markdown code blocks or extra text.`;

/**
 * Main prompt for generating a complete note from user input
 */
export function noteGenerationPrompt(userPrompt: string): string {
  return `Create a comprehensive note based on this request:

"${userPrompt}"

Respond with this exact JSON structure:
{
  "title": "Clear, specific title (max 60 chars)",
  "content": "Overview paragraph summarizing the topic (2-4 sentences)",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": [
    {
      "title": "Section Title",
      "summary": "Detailed explanation (2-4 sentences)",
      "bullets": ["Specific point 1", "Specific point 2", "Specific point 3"]
    }
  ]
}

Requirements:
1. Title: Descriptive, not generic (e.g., "React Hooks Best Practices" not "Notes")
2. Content: Provide context and overview
3. Sections: 2-4 sections, each with clear focus
4. Bullets: 3-5 actionable, specific points per section
5. Tags: 2-4 lowercase keywords
6. Be comprehensive but concise

Return ONLY valid JSON.`;
}

/**
 * Prompt for refining/improving an existing note
 */
export function refineNotePrompt(
  currentNote: { title: string; content: string; sections: any[] },
  userFeedback: string
): string {
  return `Improve this note based on user feedback.

Current note:
${JSON.stringify(currentNote, null, 2)}

User feedback: "${userFeedback}"

Return the improved note in the same JSON structure. Only modify what's necessary based on feedback.`;
}

/**
 * Prompt for expanding a specific section
 */
export function expandSectionPrompt(
  sectionTitle: string,
  sectionContent: string,
  context: string
): string {
  return `Expand this section with more detail:

Section: "${sectionTitle}"
Current content: "${sectionContent}"
Context: "${context}"

Return JSON:
{
  "summary": "Expanded summary (3-5 sentences)",
  "bullets": ["Detailed point 1", "Detailed point 2", "Detailed point 3", "Detailed point 4", "Detailed point 5"]
}`;
}

/**
 * Quick note prompt for simpler requests
 */
export function quickNotePrompt(userPrompt: string): string {
  return `Create a quick note for: "${userPrompt}"

Return JSON:
{
  "title": "Brief title",
  "content": "Main content (1-2 paragraphs)",
  "tags": ["tag1", "tag2"]
}`;
}
