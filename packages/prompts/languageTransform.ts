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
  },
  tone: "neutral" | "casual" | "interview" = "neutral"
): string {
  const instruction = {
    english: "Rewrite this in clear, simple English. Make it natural and readable.",
    hindi: "Rewrite this in clear, natural Hindi. Use conversational tone, avoid overly formal language. Write in Devanagari script.",
    hinglish: "",
  };

  // Hinglish tone presets
  const hinglishToneMap = {
    neutral:
      "Use balanced, clean Hinglish suitable for study notes. Mix Hindi and English naturally. Keep technical terms in English when appropriate. Example: 'Is section mein hum dekhte hain ki load balancer ka role kya hota hai aur kaise traffic distribute hota hai.'",
    casual:
      "Use casual, conversational Hinglish as spoken informally. Friendly tone, slightly relaxed. Good for quick understanding. Example: 'Yahan pe basically load balancer ka role samajhte hain aur yeh traffic kaise handle karta hai.'",
    interview:
      "Use professional Hinglish suitable for interview preparation. Emphasize key English technical terms. Clear Hindi connectors. Optimized for recall. Example: 'Is section mein load balancer ke core concepts explain kiye gaye hain jaise traffic distribution, availability, aur scalability.'",
  };

  // Build Hinglish instruction with tone
  if (target === "hinglish") {
    instruction.hinglish = `Rewrite this in natural Indian Hinglish. Do NOT translate word by word. Sound like an Indian speaker explaining to a friend.

Tone:
${hinglishToneMap[tone]}`;
  } else {
    // Fallback for backward compatibility
    instruction.hinglish =
      "Rewrite this in natural Indian Hinglish. Mix Hindi and English words naturally as spoken in India. Do NOT translate word by word. Keep technical terms in English when appropriate. Sound conversational, like an Indian speaker explaining to a friend.";
  }

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

