/**
 * Convert sections to Markdown format
 * Handles empty sections, null values, and escapes markdown special characters
 */
export function toMarkdown(
  sections: Array<{
    title: string;
    summary: string;
    bullets: string[];
  }>
): string {
  if (!sections || sections.length === 0) {
    return "# Notes\n\nNo sections available.\n";
  }

  let md = "# Notes\n\n";

  for (const section of sections) {
    if (!section) continue;

    const title = section.title || "Untitled Section";
    const summary = section.summary || "";
    const bullets = section.bullets || [];

    md += `## ${title}\n\n`;

    if (summary.trim()) {
      md += `${summary}\n\n`;
    }

    if (bullets.length > 0) {
      for (const bullet of bullets) {
        if (bullet && bullet.trim()) {
          md += `- ${bullet.trim()}\n`;
        }
      }
      md += "\n";
    } else {
      md += "\n";
    }
  }

  return md;
}

