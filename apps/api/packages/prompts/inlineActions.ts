/**
 * Inline AI action prompts
 * These are contextual, reversible actions applied to specific text
 */

export function inlineActionPrompt(
  action: "simplify" | "expand" | "example",
  text: string
): string {
  const instructionMap = {
    simplify: "Rewrite this in simpler, clearer language.",
    expand: "Expand this with more detail, without adding new topics.",
    example: "Add a short real-world example to explain this.",
  };

  return `
${instructionMap[action]}

Rules:
- Keep tone neutral
- Do not add emojis
- Do not change meaning
- Output only the rewritten text
- No markdown formatting
- No headings

Text:
"""
${text}
"""
`;
}

