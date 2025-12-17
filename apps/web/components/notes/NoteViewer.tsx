"use client";

import { motion } from "framer-motion";
import type { Note } from "../../lib/api";

// Simple inline markdown parser (bold, italic, code)
function parseInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/\*(.+?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-[var(--color-surface)] rounded text-sm">$1</code>'); // `code`
}

type NoteViewerProps = {
  note: Note;
};

export function NoteViewer({ note }: NoteViewerProps) {
  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-6 py-10 sm:px-8 sm:py-14"
    >
      {/* Header */}
      <header className="mb-10">
        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] leading-tight mb-4">
          {note.title || "Untitled"}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <time>{formattedDate}</time>
          {note.source === "youtube" && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <YouTubeIcon />
                YouTube Import
              </span>
            </>
          )}
          {note.isFavorite && (
            <>
              <span>•</span>
              <span>⭐ Favorite</span>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      {note.content && (
        <div className="mb-10">
          <p className="text-lg text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      )}

      {/* Sections */}
      {note.sections.length > 0 && (
        <div className="space-y-10">
          {note.sections.map((section, index) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Section number indicator */}
              <div className="absolute -left-4 sm:-left-8 top-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Section title */}
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-4 pl-4 sm:pl-0">
                {section.title}
              </h2>

              {/* Summary */}
              {section.summary && (
                <p 
                  className="text-[var(--color-text)] leading-relaxed mb-5 pl-4 sm:pl-0"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(section.summary) }}
                />
              )}

              {/* Bullets */}
                {section.bullets.length > 0 && (
                <ul className="space-y-3 pl-4 sm:pl-0">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={bulletIndex}
                      className="flex items-start gap-3 text-[var(--color-text)]"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2.5" />
                      <span 
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(bullet) }}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {/* Language badge */}
              {section.language !== "english" && (
                <span className="inline-block mt-4 px-2 py-0.5 text-xs rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                  {section.language}
                </span>
              )}
            </motion.section>
          ))}
        </div>
      )}

      {/* YouTube link */}
      {note.youtubeUrl && (
        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <a
            href={note.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <YouTubeIcon />
            Watch original video
            <ExternalLinkIcon />
          </a>
        </div>
      )}

      {/* Click hint */}
      <div className="mt-16 text-center">
        <p className="text-sm text-[var(--color-text-subtle)]">
          Click anywhere to edit
        </p>
      </div>
    </motion.article>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

