/**
 * Section Type Detection Prompt
 * 
 * Analyzes individual sections to determine their type:
 * - Tutorial (step-by-step instructions)
 * - Interview (Q&A, conversations)
 * - Lecture (educational content)
 * - Review (product/service evaluation)
 * - Explanation (concepts, definitions)
 * - Story (narrative, personal accounts)
 * - Discussion (debate, analysis)
 * - Other
 */

export const sectionTypeDetectionPrompt = (section: { title: string; summary: string; bullets: string[] }) => {
  return `You are analyzing a section of video content to determine its type.

Section Content:
Title: ${section.title}
Summary: ${section.summary}
Key Points: ${section.bullets.join(", ")}

Determine the section type (choose ONE that best fits):

- Tutorial: Step-by-step instructions, how-to guides, walkthroughs
- Interview: Q&A format, conversations, questions and answers
- Lecture: Educational content, teaching, explanations of concepts
- Review: Product/service evaluation, pros/cons, recommendations
- Explanation: Concept definitions, theory, background information
- Story: Narrative content, personal accounts, anecdotes
- Discussion: Analysis, debate, multiple perspectives
- Other: Doesn't fit any category above

Return ONLY valid JSON in this exact format:
{
  "type": "Tutorial",
  "confidence": 0.9
}

Do not include any explanation or markdown formatting, only the JSON object.`;
};

