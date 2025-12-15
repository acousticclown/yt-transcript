"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionCard } from "./SectionCard";

type Section = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
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
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-xs text-gray-400 dark:text-gray-500 mb-1 select-none"
      >
        ⠿ Drag
      </div>
      <SectionCard
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

