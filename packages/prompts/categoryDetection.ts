/**
 * Category Detection Prompt
 * 
 * Analyzes video content to determine:
 * - Primary category/type (Tutorial, Interview, Lecture, etc.)
 * - Relevant tags (topics, themes, keywords)
 * - Confidence score
 */

export const categoryDetectionPrompt = (sections: Array<{ title: string; summary: string; bullets: string[] }>) => {
  const sectionsText = sections
    .map((s, i) => `Section ${i + 1}: ${s.title}\nSummary: ${s.summary}\nPoints: ${s.bullets.join(", ")}`)
    .join("\n\n");

  return `You are analyzing video content to categorize it intelligently.

Video Content:
${sectionsText}

Analyze this content and determine:

1. **Primary Category** - The main type of content (choose ONE):
   - Tutorial (how-to, step-by-step guides)
   - Interview (conversations, Q&A)
   - Lecture (educational, academic)
   - Review (product/service reviews)
   - Documentary (informational, factual)
   - Podcast (discussions, conversations)
   - News (current events, reporting)
   - Entertainment (comedy, gaming, vlogs)
   - Technical (coding, engineering, technical deep-dives)
   - Business (entrepreneurship, finance, strategy)
   - Other (specify)

2. **Tags** - Extract 3-8 relevant tags that describe:
   - Main topics covered
   - Key themes
   - Subject areas
   - Technical domains
   - Use lowercase, hyphenated format (e.g., "machine-learning", "product-management")

3. **Confidence** - How confident are you in this categorization? (0.0 to 1.0)

Return ONLY valid JSON in this exact format:
{
  "type": "Tutorial",
  "tags": ["react", "web-development", "tutorial"],
  "confidence": 0.95
}

Do not include any explanation or markdown formatting, only the JSON object.`;
};

