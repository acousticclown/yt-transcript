/**
 * Prompt for generating a complete note from a text prompt
 * Creates structured, well-organized notes with title, content, sections, and tags
 */

export function noteGenerationPrompt(userPrompt: string): string {
  return `You are an expert note-taking assistant. Generate a comprehensive, well-structured note based on the user's request.

USER REQUEST: "${userPrompt}"

Generate a note with the following JSON structure:
{
  "title": "Clear, concise title (max 60 chars)",
  "content": "Main summary or introduction paragraph (2-4 sentences)",
  "tags": ["tag1", "tag2", "tag3"], // 2-5 relevant lowercase tags
  "sections": [
    {
      "title": "Section Title",
      "summary": "Detailed explanation for this section (2-4 sentences)",
      "bullets": ["Key point 1", "Key point 2", "Key point 3"] // 3-5 actionable bullet points
    }
  ]
}

RULES:
1. Title should be clear and descriptive, not generic
2. Content should provide context and overview
3. Create 2-4 sections that logically organize the information
4. Each section should have a clear focus
5. Bullets should be actionable, specific, and valuable
6. Tags should be relevant keywords for categorization
7. Be comprehensive but concise - quality over quantity
8. Use professional, clear language
9. If the request is vague, interpret it reasonably and create useful content

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or extra text.`;
}

export function quickNotePrompt(userPrompt: string): string {
  return `Generate a quick note for: "${userPrompt}"

Return JSON:
{
  "title": "Brief title",
  "content": "Main content (1-2 paragraphs)",
  "tags": ["tag1", "tag2"]
}

Return ONLY valid JSON.`;
}

