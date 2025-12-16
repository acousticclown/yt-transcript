"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type SortOption = "relevance" | "title" | "date";

type SortOptionsProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
};

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: "relevance", label: "Relevance", icon: "⭐" },
  { value: "title", label: "Title", icon: "🔤" },
  { value: "date", label: "Date", icon: "📅" },
];

/**
 * SortOptions - Dropdown to sort sections
 */
export function SortOptions({
  value,
  onChange,
  className,
}: SortOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find((o) => o.value === value);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "hover:border-[var(--color-border-strong)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30",
          isOpen && "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
        )}
      >
        <span>{selectedOption?.icon}</span>
        <span className="text-[var(--color-text)]">{selectedOption?.label}</span>
        <svg
          className={cn(
            "w-4 h-4 text-[var(--color-text-muted)] transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-2 z-50 min-w-[140px]",
              "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl",
              "shadow-lg shadow-black/5 overflow-hidden"
            )}
          >
            <div className="py-1">
              {sortOptions.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                      isSelected
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                        : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                    )}
                  >
                    <span className="text-base">{option.icon}</span>
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

