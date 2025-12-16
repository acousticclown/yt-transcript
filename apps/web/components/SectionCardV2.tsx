"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { Stack } from "./layout";
import { InlineAIButton } from "./InlineAIButton";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "../lib/utils";

type LanguageVariant = {
  title: string;
  summary: string;
  bullets: string[];
};

type Section = {
  id: string;
  source: LanguageVariant;
  variants: {
    english: LanguageVariant;
    hindi?: LanguageVariant;
    hinglish?: {
      neutral?: LanguageVariant;
      casual?: LanguageVariant;
      interview?: LanguageVariant;
    };
  };
  current: LanguageVariant;
  language: "english" | "hindi" | "hinglish";
  hinglishTone?: "neutral" | "casual" | "interview";
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

export function SectionCardV2({
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
  const [switchingLanguage, setSwitchingLanguage] = useState(false);

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
        alert(`⚠️ Couldn't ${action} this right now. ${errorData.error || "Please try again."}`);
        return;
      }

      const data = await res.json();
      onUpdate(data.text);
    } catch {
      alert("⚠️ Couldn't process this right now. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard
      variant={isFocused ? "elevated" : "default"}
      interactive
      className={cn(
        "p-0 overflow-hidden",
        isFocused && "ring-2 ring-indigo-500/50"
      )}
      whileHover={{ scale: 1.002 }}
      transition={{ duration: 0.2 }}
    >
      <Stack gap={0} className="h-full">
        {/* Card Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10 dark:border-white/5">
          <Stack direction="row" gap={3} align="center" justify="between" className="flex-wrap">
            {/* Title */}
            <input
              className="flex-1 min-w-0 text-xl font-semibold outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Section title..."
              value={section.current.title}
              onChange={(e) =>
                onChange({
                  ...section,
                  current: { ...section.current, title: e.target.value },
                })
              }
            />
            
            {/* Header Actions */}
            <Stack direction="row" gap={2} align="center">
              <LanguageToggle
                value={section.language}
                onChange={async (target) => {
                  if (target === section.language) return;

                  if (target === "english") {
                    onChange({
                      ...section,
                      current: section.variants.english,
                      language: "english",
                      hinglishTone: undefined,
                    });
                    return;
                  }

                  if (target === "hindi") {
                    if (section.variants.hindi) {
                      onChange({
                        ...section,
                        current: section.variants.hindi,
                        language: "hindi",
                        hinglishTone: undefined,
                      });
                      return;
                    }

                    setSwitchingLanguage(true);
                    try {
                      const res = await fetch("http://localhost:3001/ai/transform-language", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          target: "hindi",
                          section: section.source,
                        }),
                      });

                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                        alert(`⚠️ Couldn't convert language right now. ${errorData.error || "Please try again."}`);
                        return;
                      }

                      const transformed = await res.json();
                      onChange({
                        ...section,
                        variants: {
                          ...section.variants,
                          hindi: transformed,
                        },
                        current: transformed,
                        language: "hindi",
                        hinglishTone: undefined,
                      });
                    } catch {
                      alert("⚠️ Couldn't convert language right now. Make sure the API server is running.");
                    } finally {
                      setSwitchingLanguage(false);
                    }
                    return;
                  }

                  if (target === "hinglish") {
                    const tone = section.hinglishTone || "neutral";
                    const cached = section.variants.hinglish?.[tone];

                    if (cached) {
                      onChange({
                        ...section,
                        current: cached,
                        language: "hinglish",
                        hinglishTone: tone,
                      });
                      return;
                    }

                    setSwitchingLanguage(true);
                    try {
                      const res = await fetch("http://localhost:3001/ai/transform-language", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          target: "hinglish",
                          tone,
                          section: section.source,
                        }),
                      });

                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                        alert(`⚠️ Couldn't convert language right now. ${errorData.error || "Please try again."}`);
                        return;
                      }

                      const transformed = await res.json();
                      onChange({
                        ...section,
                        variants: {
                          ...section.variants,
                          hinglish: {
                            ...(section.variants.hinglish || {}),
                            [tone]: transformed,
                          },
                        },
                        current: transformed,
                        language: "hinglish",
                        hinglishTone: tone,
                      });
                    } catch {
                      alert("⚠️ Couldn't convert language right now. Make sure the API server is running.");
                    } finally {
                      setSwitchingLanguage(false);
                    }
                  }
                }}
                disabled={switchingLanguage}
              />
              
              {/* Focus/Regenerate buttons */}
              <Stack direction="row" gap={1}>
                {onFocus && !isFocused && (
                  <button
                    onClick={onFocus}
                    className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors rounded"
                  >
                    🎯
                  </button>
                )}
                {onBlurFocus && isFocused && (
                  <button
                    onClick={onBlurFocus}
                    className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors rounded"
                  >
                    ✕
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
                          section: section.source,
                          transcript: cleanedTranscript,
                        }),
                      });

                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                        alert(`⚠️ Couldn't regenerate this section right now. ${errorData.error || "Please try again."}`);
                        return;
                      }

                      const data = await res.json();
                      onChange({
                        ...section,
                        source: data,
                        variants: {
                          ...section.variants,
                          english: data,
                        },
                        current: data,
                        language: "english",
                        hinglishTone: undefined,
                      });
                    } catch {
                      alert("⚠️ Couldn't regenerate this section right now. Make sure the API server is running.");
                    } finally {
                      setRegenerating(false);
                    }
                  }}
                  disabled={regenerating || transcript.length === 0}
                  className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors rounded"
                >
                  {regenerating ? "..." : "🔁"}
                </button>
              </Stack>
            </Stack>
          </Stack>

          {/* Tone selector - Only when Hinglish is active */}
          {section.language === "hinglish" && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Tone:</span>
              <select
                value={section.hinglishTone || "neutral"}
                onChange={async (e) => {
                  const tone = e.target.value as "neutral" | "casual" | "interview";
                  const cached = section.variants.hinglish?.[tone];
                  if (cached) {
                    onChange({
                      ...section,
                      current: cached,
                      hinglishTone: tone,
                    });
                    return;
                  }

                  setSwitchingLanguage(true);
                  try {
                    const res = await fetch("http://localhost:3001/ai/transform-language", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        target: "hinglish",
                        tone,
                        section: section.source,
                      }),
                    });

                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
                      alert(`⚠️ Couldn't change tone right now. ${errorData.error || "Please try again."}`);
                      return;
                    }

                    const transformed = await res.json();
                    onChange({
                      ...section,
                      variants: {
                        ...section.variants,
                        hinglish: {
                          ...(section.variants.hinglish || {}),
                          [tone]: transformed,
                        },
                      },
                      current: transformed,
                      hinglishTone: tone,
                    });
                  } catch {
                    alert("⚠️ Couldn't change tone right now. Make sure the API server is running.");
                  } finally {
                    setSwitchingLanguage(false);
                  }
                }}
                disabled={switchingLanguage}
                className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="neutral">Neutral</option>
                <option value="casual">Casual</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          )}
        </div>

        {/* Split Layout: Summary (Left) + Bullets (Right) */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left: Summary Panel (Scrollable) */}
          <div className="flex-1 md:w-1/2 border-r-0 md:border-r border-white/10 dark:border-white/5 p-5 overflow-y-auto">
            <div className="relative group">
              {section.language !== "english" && (
                <div className="mb-2 text-xs text-gray-400 dark:text-gray-500">
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
                  className="w-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 resize-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 min-h-[120px] max-h-[400px]"
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
              {/* Inline actions - Appear on hover */}
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
          </div>

          {/* Right: Bullets Panel */}
          <div className="flex-1 md:w-1/2 p-5 overflow-y-auto">
            <motion.ul
              key={section.language}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {section.current.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 group/bullet">
                  <span className="mt-1 text-indigo-500 dark:text-indigo-400 text-lg">•</span>
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
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-5 py-3 border-t border-white/10 dark:border-white/5 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm">
          <Stack direction="row" gap={2} align="center" justify="between" className="text-xs text-gray-500 dark:text-gray-400">
            <div>
              {section.language !== "english" && (
                <span className="mr-2">🌐 {section.language === "hinglish" ? "Hinglish" : "Hindi"}</span>
              )}
              <span>{section.current.bullets.length} points</span>
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              {/* Placeholder for future metadata */}
            </div>
          </Stack>
        </div>
      </Stack>
    </GlassCard>
  );
}

