"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InlineAIButton } from "./InlineAIButton";

type Section = {
  title: string;
  summary: string;
  bullets: string[];
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
  onChange,
}: {
  section: Section;
  transcript: Array<{ text: string; start: number; duration: number }>;
  onChange: (section: Section) => void;
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
      className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Title - Bigger, bolder, calm */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 text-xl font-semibold outline-none bg-transparent text-gray-900 placeholder-gray-400"
          placeholder="Section title..."
          value={section.title}
          onChange={(e) =>
            onChange({ ...section, title: e.target.value })
          }
        />
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
                  section,
                  transcript: cleanedTranscript,
                }),
              });

              if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                alert(`⚠️ ${errorData.error || "Failed to regenerate section"}`);
                return;
              }

              const data = await res.json();
              onChange(data);
            } catch {
              alert("⚠️ Failed to regenerate section. Make sure the API server is running.");
            } finally {
              setRegenerating(false);
            }
          }}
          disabled={regenerating || transcript.length === 0}
          className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {regenerating ? "..." : "🔁 Regenerate"}
        </button>
      </div>

      {/* Summary - Subtle background, looks like a note */}
      <div className="relative group">
        <textarea
          className="w-full bg-gray-50 rounded-lg p-3 resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[60px]"
          placeholder="Summary..."
          value={section.summary}
          onChange={(e) =>
            onChange({ ...section, summary: e.target.value })
          }
        />
        <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
          <InlineAIButton
            label="✨ Simplify"
            loading={loadingSummary === "simplify"}
            onClick={() =>
              runInlineAI(
                "simplify",
                section.summary,
                (newText) => onChange({ ...section, summary: newText }),
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
                section.summary,
                (newText) => onChange({ ...section, summary: newText }),
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
                section.summary,
                (newText) => onChange({ ...section, summary: newText }),
                (loading) => setLoadingSummary(loading ? "example" : null)
              )
            }
          />
        </div>
      </div>

      {/* Bullets - Soft rows, feels like writing notes */}
      <ul className="space-y-2">
        {section.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 group/bullet">
            <span className="mt-1 text-gray-400">•</span>
            <div className="flex-1 relative">
              <input
                className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                placeholder="Bullet point..."
                value={bullet}
                onChange={(e) => {
                  const bullets = [...section.bullets];
                  bullets[i] = e.target.value;
                  onChange({ ...section, bullets });
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
                        const bullets = [...section.bullets];
                        bullets[i] = newText;
                        onChange({ ...section, bullets });
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
                        const bullets = [...section.bullets];
                        bullets[i] = newText;
                        onChange({ ...section, bullets });
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
                        const bullets = [...section.bullets];
                        bullets[i] = newText;
                        onChange({ ...section, bullets });
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
      </ul>
    </motion.div>
  );
}

