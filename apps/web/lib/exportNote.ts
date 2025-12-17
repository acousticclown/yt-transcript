import { Note } from "./api";

export function noteToMarkdown(note: Note): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${note.title}`);
  lines.push("");

  // Metadata
  if (note.tags.length > 0) {
    lines.push(`**Tags:** ${note.tags.map((t) => `#${t}`).join(" ")}`);
    lines.push("");
  }

  if (note.source === "youtube" && note.youtubeUrl) {
    lines.push(`**Source:** [YouTube](${note.youtubeUrl})`);
    lines.push("");
  }

  // Content
  if (note.content) {
    lines.push(note.content);
    lines.push("");
  }

  // Sections
  if (note.sections.length > 0) {
    lines.push("---");
    lines.push("");

    for (const section of note.sections) {
      lines.push(`## ${section.title}`);
      lines.push("");

      if (section.summary) {
        lines.push(section.summary);
        lines.push("");
      }

      if (section.bullets.length > 0) {
        for (const bullet of section.bullets) {
          lines.push(`- ${bullet}`);
        }
        lines.push("");
      }
    }
  }

  // Footer
  lines.push("---");
  lines.push(`*Exported from Notely on ${new Date().toLocaleDateString()}*`);

  return lines.join("\n");
}

export function downloadMarkdown(note: Note) {
  const markdown = noteToMarkdown(note);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyMarkdownToClipboard(note: Note): Promise<void> {
  const markdown = noteToMarkdown(note);
  return navigator.clipboard.writeText(markdown);
}

