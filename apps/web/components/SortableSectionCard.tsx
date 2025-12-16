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
      {/* Mobile-optimized drag handle - larger touch target, better visibility */}
      <div
        {...listeners}
        className="absolute top-3 left-3 sm:top-2 sm:left-2 z-10 cursor-grab active:cursor-grabbing text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-2 sm:px-2 sm:py-1 rounded-lg sm:rounded select-none hover:bg-white dark:hover:bg-gray-800 transition-colors touch-none min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center shadow-sm"
        aria-label="Drag to reorder"
      >
        <span className="text-base sm:text-xs">⠿</span>
        <span className="ml-1 sm:hidden text-xs font-medium">Drag</span>
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

