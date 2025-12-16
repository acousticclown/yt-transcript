"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionCardV2 } from "./SectionCardV2";

type LanguageVariant = {
  title: string;
  summary: string;
  bullets: string[];
};

type Section = {
  id: string;
  // Source of truth (always English)
  source: LanguageVariant;
  // Cached variants
  variants: {
    english: LanguageVariant;
    hindi?: LanguageVariant;
    hinglish?: {
      neutral?: LanguageVariant;
      casual?: LanguageVariant;
      interview?: LanguageVariant;
    };
  };
  // Current view state
  current: LanguageVariant;
  language: "english" | "hindi" | "hinglish";
  hinglishTone?: "neutral" | "casual" | "interview";
};

export function SortableSectionCard({
  section,
  transcript,
  isFocused,
  onChange,
  onFocus,
  onBlurFocus,
}: {
  section: Section;
  transcript: Array<{ text: string; start: number; duration: number }>;
  isFocused: boolean;
  onChange: (section: Section) => void;
  onFocus: () => void;
  onBlurFocus: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      <div
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-xs text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-2 py-1 rounded select-none hover:bg-white/70 dark:hover:bg-gray-900/70 transition-colors"
      >
        ⠿ Drag
      </div>
      <SectionCardV2
        section={section}
        transcript={transcript}
        isFocused={isFocused}
        onChange={onChange}
        onFocus={onFocus}
        onBlurFocus={onBlurFocus}
      />
    </div>
  );
}

