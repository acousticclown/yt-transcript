/**
 * Language Transformation Prompt
 * 
 * Transforms a section from one language to another while preserving:
 * - Exact meaning
 * - Structure (title, summary, bullets)
 * - No new information added
 * - No information removed
 * 
 * Critical for Hinglish: Must sound natural, conversational, Indian.
 * NOT word-by-word translation.
 */

export function languageTransformPrompt(
  target: "english" | "hindi" | "hinglish",
  section: {
    title: string;
    summary: string;
    bullets: string[];
  }
): string {
  const instruction = {
    english: "Rewrite this in clear, simple English. Make it natural and readable.",
    hindi: "Rewrite this in clear, natural Hindi. Use conversational tone, avoid overly formal language. Write in Devanagari script.",
    hinglish:
      "Rewrite this in natural Indian Hinglish. Mix Hindi and English words naturally as spoken in India. Do NOT translate word by word. Keep technical terms in English when appropriate. Sound conversational, like an Indian speaker explaining to a friend. Example: 'Is section me hum dekhte hain ki load balancer kyu zaroori hota hai.'",
  };

  return `
${instruction[target]}

Rules:
- Keep meaning exactly the same
- Keep structure (title, summary, bullets)
- Do not add new points
- Do not remove information
- Return ONLY valid JSON
- No emojis
- No explanations outside JSON

Output format:
{
  "title": string,
  "summary": string,
  "bullets": string[]
}

Input section:
${JSON.stringify(section, null, 2)}
`;
}

