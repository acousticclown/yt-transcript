"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { Stack } from "./layout";
import { InlineAIButton } from "./InlineAIButton";
import { LanguageToggle } from "./LanguageToggle";
import { CategoryBadge } from "./CategoryBadge";
import { SectionTypeBadge } from "./SectionTypeBadge";
import { SectionMetadata } from "./SectionMetadata";
import { TagInput } from "./TagInput";
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
  category?: {
    type: string;
    tags: string[];
    confidence: number;
  };
  personalTags?: string[];
  sectionType?: {
    type: string;
    confidence: number;
  };
  createdAt?: string; // ISO timestamp
  lastEditedAt?: string; // ISO timestamp
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
        "p-0 overflow-hidden transition-all duration-300",
        isFocused && "ring-2 ring-indigo-500/50 shadow-xl",
        !isFocused && "hover:shadow-lg hover:scale-[1.01]"
      )}
      whileHover={!isFocused ? { scale: 1.01, y: -2 } : {}}
      whileTap={{ scale: 0.998 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Stack gap={0} className="h-full">
        {/* Card Header */}
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-white/10 dark:border-white/5 hover:bg-white/5 dark:hover:bg-gray-900/5 transition-colors">
          <Stack gap={2}>
            {/* Category and Type Badges */}
            {(section.category || section.sectionType) && (
              <div className="flex items-center gap-2 flex-wrap">
                {section.sectionType && (
                  <SectionTypeBadge type={section.sectionType.type} size="sm" />
                )}
                {section.category && (
                  <>
                    <CategoryBadge type={section.category.type} size="sm" />
                    {section.category.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {section.category.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <Stack direction="row" gap={2} align="center" justify="between" className="flex-wrap">
              {/* Title */}
              <input
                className="flex-1 min-w-0 text-lg sm:text-xl font-semibold outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-1"
                placeholder="Section title..."
                value={section.current.title}
                onChange={(e) =>
                  onChange({
                    ...section,
                    current: { ...section.current, title: e.target.value },
                    lastEditedAt: new Date().toISOString(),
                  })
                }
            />
            
            {/* Header Actions */}
            <Stack direction="row" gap={1.5} align="center" className="flex-shrink-0">
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
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tone:</span>
                <div className="inline-flex gap-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg p-1">
                  {(["neutral", "casual", "interview"] as const).map((tone) => {
                    const isSelected = (section.hinglishTone || "neutral") === tone;
                    return (
                      <motion.button
                        key={tone}
                        onClick={async () => {
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
                        className={cn(
                          "text-xs px-2.5 py-1.5 rounded-md transition-all min-h-[28px]",
                          isSelected
                            ? "bg-indigo-600 dark:bg-indigo-500 text-white font-medium shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                          switchingLanguage && "opacity-50 cursor-not-allowed"
                        )}
                        whileTap={!switchingLanguage ? { scale: 0.95 } : {}}
                        transition={{ duration: 0.15 }}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </Stack>
        </div>

        {/* Split Layout: Summary (Left) + Bullets (Right) */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left: Summary Panel (Scrollable) */}
          <div className="flex-1 md:w-1/2 border-r-0 md:border-r border-b md:border-b-0 border-white/10 dark:border-white/5 p-4 sm:p-5 overflow-y-auto max-h-[400px] sm:max-h-[500px] md:max-h-none">
            <div className="relative group h-full flex flex-col">
              {/* Summary Header */}
              <div className="flex items-center justify-between mb-2">
                {section.language !== "english" && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Viewing in {section.language === "hinglish" ? "Hinglish" : "Hindi"}
                    {section.current.summary !== section.source.summary &&
                      section.current.summary.trim() !== "" && (
                        <span className="ml-2">✏️ Editing {section.language} version</span>
                      )}
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {section.current.summary.length} chars
                </div>
              </div>
              
              {/* Summary Content - Scrollable */}
              <motion.div
                key={section.language}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex-1 relative"
              >
                <textarea
                  className="w-full h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 sm:p-3 resize-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 min-h-[140px] sm:min-h-[120px] focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all touch-manipulation"
                  placeholder="Summary..."
                  value={section.current.summary}
                  onChange={(e) =>
                  onChange({
                    ...section,
                    current: { ...section.current, summary: e.target.value },
                    lastEditedAt: new Date().toISOString(),
                  })
                  }
                />
              </motion.div>
              
              {/* Inline actions - Appear on hover */}
              <div className="absolute top-8 right-2 hidden group-hover:flex gap-1 z-10">
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
          <div className="flex-1 md:w-1/2 p-4 sm:p-5 overflow-y-auto max-h-[400px] sm:max-h-[500px] md:max-h-none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Key Points
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {section.current.bullets.length} points
              </span>
            </div>
            <motion.ul
              key={section.language}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {section.current.bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="group/bullet"
                >
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-white/20 dark:hover:bg-gray-900/20 active:bg-white/30 dark:active:bg-gray-900/30 transition-colors touch-manipulation">
                    {/* Bullet Indicator - Visual Bar */}
                    <div className="flex-shrink-0 mt-1.5 sm:mt-1">
                      <div className="w-1 sm:w-1 h-full min-h-[24px] sm:min-h-[20px] bg-indigo-500 dark:bg-indigo-400 rounded-full opacity-60 group-hover/bullet:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 relative min-w-0">
                      <input
                        className="w-full outline-none bg-transparent text-sm sm:text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 rounded px-2 py-2 sm:py-1 -mx-2 -my-2 sm:-my-1 transition-all min-h-[44px] sm:min-h-0"
                        placeholder="Bullet point..."
                        value={bullet}
                        onChange={(e) => {
                          const bullets = [...section.current.bullets];
                          bullets[i] = e.target.value;
                          onChange({
                            ...section,
                            current: { ...section.current, bullets },
                            lastEditedAt: new Date().toISOString(),
                          });
                        }}
                      />
                      <div className="absolute top-0 right-0 hidden group-hover/bullet:flex gap-1 z-10">
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
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-white/10 dark:border-white/5 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-900/30 transition-colors">
          <Stack gap={2}>
            {/* Personal Tags */}
            <TagInput
              tags={section.personalTags || []}
              suggestions={[
                ...(section.category?.tags || []),
                "important",
                "todo",
                "review",
                "favorite",
              ]}
              onChange={(newTags) =>
                onChange({
                  ...section,
                  personalTags: newTags,
                })
              }
              placeholder="Add personal tags..."
            />
            <Stack direction="row" gap={2} align="center" justify="between" className="text-xs text-gray-500 dark:text-gray-400">
              <div>
                {section.language !== "english" && (
                  <span className="mr-2">🌐 {section.language === "hinglish" ? "Hinglish" : "Hindi"}</span>
                )}
                <span>{section.current.bullets.length} points</span>
              </div>
              <SectionMetadata
                createdAt={section.createdAt}
                lastEditedAt={section.lastEditedAt}
              />
            </Stack>
          </Stack>
        </div>
      </Stack>
    </GlassCard>
  );
}

