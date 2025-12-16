"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InlineAIButton } from "./InlineAIButton";
import { LanguageToggle } from "./LanguageToggle";

type Section = {
  id: string;
  source: {
    title: string;
    summary: string;
    bullets: string[];
  };
  current: {
    title: string;
    summary: string;
    bullets: string[];
  };
  language: "english" | "hindi" | "hinglish";
};

function cleanTranscript(
  chunks: Array<{ text: string; start: number; duration: number }>
): string {
  return chunks
    .map((c) => c.text.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function SectionCard({
  section,
  transcript,
  isFocused,
  onChange,
  onFocus,
  onBlurFocus,
}: {
  section: Section;
  transcript: Array<{ text: string; start: number; duration: number }>;
  isFocused?: boolean;
  onChange: (section: Section) => void;
  onFocus?: () => void;
  onBlurFocus?: () => void;
}) {
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [loadingBullets, setLoadingBullets] = useState<Record<number, string>>({});
  const [regenerating, setRegenerating] = useState(false);

  async function runInlineAI(
    action: "simplify" | "expand" | "example",
    text: string,
    onUpdate: (newText: string) => void,
    setLoading: (loading: boolean) => void
  ) {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/ai/inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(`⚠️ ${errorData.error || "Failed to process AI action"}`);
        return;
      }

      const data = await res.json();
      onUpdate(data.text);
    } catch {
      alert("⚠️ Failed to process AI action. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Title - Bigger, bolder, calm */}
      <div className="flex items-center gap-2">
        {/* 3. Section title - Clear hierarchy */}
        <input
          className="flex-1 text-xl font-semibold outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Section title..."
          value={section.current.title}
          onChange={(e) =>
            onChange({
              ...section,
              current: { ...section.current, title: e.target.value },
            })
          }
        />
        {/* Language toggle - Segmented control (better UX) */}
        <LanguageToggle
          value={section.language}
          onChange={async (target) => {
            // If already on this language, do nothing
            if (target === section.language) return;

            // If switching to English, restore from source instantly
            if (target === "english") {
              onChange({
                ...section,
                current: section.source,
                language: "english",
              });
              return;
            }

            // Transform to target language
            setSwitchingLanguage(true);
            try {
              const res = await fetch(
                "http://localhost:3001/ai/transform-language",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    target,
                    section: section.source, // Always use source for transformation
                  }),
                }
              );

              if (!res.ok) {
                const errorData = await res
                  .json()
                  .catch(() => ({ error: "Unknown error" }));
                // Keep previous language, show toast
                alert(
                  `⚠️ Couldn't convert language. ${errorData.error || "Try again."}`
                );
                return;
              }

              const transformed = await res.json();
              onChange({
                ...section,
                current: transformed,
                language: target,
              });
            } catch {
              // Keep previous language, show toast
              alert(
                "⚠️ Couldn't convert language. Make sure the API server is running."
              );
            } finally {
              setSwitchingLanguage(false);
            }
          }}
          disabled={switchingLanguage}
        />
        {/* 5. Secondary actions - Regenerate, Focus (smaller, lighter) */}
        <div className="flex gap-2">
          {onFocus && !isFocused && (
            <button
              onClick={onFocus}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
            >
              🎯 Focus
            </button>
          )}
          {onBlurFocus && isFocused && (
            <button
              onClick={onBlurFocus}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Exit Focus
            </button>
          )}
          <button
            onClick={async () => {
              if (transcript.length === 0) {
                alert("⚠️ Transcript not available for regeneration.");
                return;
              }
              setRegenerating(true);
              try {
                const cleanedTranscript = cleanTranscript(transcript);
                const res = await fetch("http://localhost:3001/ai/regenerate-section", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    section: section.source, // Regenerate from source
                    transcript: cleanedTranscript,
                  }),
                });

                if (!res.ok) {
                  const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                  alert(`⚠️ ${errorData.error || "Failed to regenerate section"}`);
                  return;
                }

                const data = await res.json();
                // Regeneration updates both source and current
                onChange({
                  ...section,
                  source: data,
                  current: data,
                  language: "english", // Reset to English after regeneration
                });
              } catch {
                alert("⚠️ Failed to regenerate section. Make sure the API server is running.");
              } finally {
                setRegenerating(false);
              }
            }}
            disabled={regenerating || transcript.length === 0}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {regenerating ? "..." : "🔁 Regenerate"}
          </button>
        </div>
      </div>

      {/* Summary - Subtle background, looks like a note */}
      <div className="relative group">
        {/* Visual indicator: "Viewing in ..." */}
        {section.language !== "english" && (
          <div className="mb-1 text-xs text-gray-400 dark:text-gray-500">
            Viewing in {section.language === "hinglish" ? "Hinglish" : "Hindi"}
            {section.current.summary !== section.source.summary &&
              section.current.summary.trim() !== "" && (
                <span className="ml-2">✏️ Editing {section.language} version</span>
              )}
          </div>
        )}
        <motion.div
          key={section.language}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <textarea
            className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-3 resize-none outline-none text-base text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 min-h-[60px]"
            placeholder="Summary..."
            value={section.current.summary}
            onChange={(e) =>
              onChange({
                ...section,
                current: { ...section.current, summary: e.target.value },
              })
            }
          />
        </motion.div>
              {/* 4. Inline actions - Appear on hover, contextual */}
              <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
          <InlineAIButton
            label="✨ Simplify"
            loading={loadingSummary === "simplify"}
            onClick={() =>
              runInlineAI(
                "simplify",
                section.current.summary,
                (newText) =>
                  onChange({
                    ...section,
                    current: { ...section.current, summary: newText },
                  }),
                (loading) => setLoadingSummary(loading ? "simplify" : null)
              )
            }
          />
          <InlineAIButton
            label="➕ Expand"
            loading={loadingSummary === "expand"}
            onClick={() =>
              runInlineAI(
                "expand",
                section.current.summary,
                (newText) =>
                  onChange({
                    ...section,
                    current: { ...section.current, summary: newText },
                  }),
                (loading) => setLoadingSummary(loading ? "expand" : null)
              )
            }
          />
          <InlineAIButton
            label="💡 Example"
            loading={loadingSummary === "example"}
            onClick={() =>
              runInlineAI(
                "example",
                section.current.summary,
                (newText) =>
                  onChange({
                    ...section,
                    current: { ...section.current, summary: newText },
                  }),
                (loading) => setLoadingSummary(loading ? "example" : null)
              )
            }
          />
        </div>
      </div>

      {/* Bullets - Soft rows, feels like writing notes */}
      <motion.ul
        key={section.language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="space-y-2"
      >
        {section.current.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 group/bullet">
            <span className="mt-1 text-gray-400 dark:text-gray-500">•</span>
            <div className="flex-1 relative">
              <input
                className="w-full outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Bullet point..."
                value={bullet}
                onChange={(e) => {
                  const bullets = [...section.current.bullets];
                  bullets[i] = e.target.value;
                  onChange({
                    ...section,
                    current: { ...section.current, bullets },
                  });
                }}
              />
              <div className="absolute top-0 right-0 hidden group-hover/bullet:flex gap-1">
                <InlineAIButton
                  label="✨ Simplify"
                  loading={loadingBullets[i] === "simplify"}
                  onClick={() =>
                    runInlineAI(
                      "simplify",
                      bullet,
                      (newText) => {
                        const bullets = [...section.current.bullets];
                        bullets[i] = newText;
                        onChange({
                          ...section,
                          current: { ...section.current, bullets },
                        });
                      },
                      (loading) => {
                        if (loading) {
                          setLoadingBullets((prev) => ({ ...prev, [i]: "simplify" }));
                        } else {
                          setLoadingBullets((prev) => {
                            const next = { ...prev };
                            delete next[i];
                            return next;
                          });
                        }
                      }
                    )
                  }
                />
                <InlineAIButton
                  label="➕ Expand"
                  loading={loadingBullets[i] === "expand"}
                  onClick={() =>
                    runInlineAI(
                      "expand",
                      bullet,
                      (newText) => {
                        const bullets = [...section.current.bullets];
                        bullets[i] = newText;
                        onChange({
                          ...section,
                          current: { ...section.current, bullets },
                        });
                      },
                      (loading) => {
                        if (loading) {
                          setLoadingBullets((prev) => ({ ...prev, [i]: "expand" }));
                        } else {
                          setLoadingBullets((prev) => {
                            const next = { ...prev };
                            delete next[i];
                            return next;
                          });
                        }
                      }
                    )
                  }
                />
                <InlineAIButton
                  label="💡 Example"
                  loading={loadingBullets[i] === "example"}
                  onClick={() =>
                    runInlineAI(
                      "example",
                      bullet,
                      (newText) => {
                        const bullets = [...section.current.bullets];
                        bullets[i] = newText;
                        onChange({
                          ...section,
                          current: { ...section.current, bullets },
                        });
                      },
                      (loading) => {
                        if (loading) {
                          setLoadingBullets((prev) => ({ ...prev, [i]: "example" }));
                        } else {
                          setLoadingBullets((prev) => {
                            const next = { ...prev };
                            delete next[i];
                            return next;
                          });
                        }
                      }
                    )
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

