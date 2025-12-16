"use client";

import { useState, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type TagInputProps = {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
};

/**
 * TagInput - Component for adding and managing tags
 * Supports suggestions and keyboard navigation
 */
export function TagInput({
  tags,
  suggestions = [],
  onChange,
  placeholder = "Add tags...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue("");
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag on backspace
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const addSuggestion = (suggestion: string) => {
    if (!tags.includes(suggestion)) {
      onChange([...tags, suggestion]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap gap-1.5 items-center min-h-[40px] p-2 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
        {/* Existing Tags */}
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </motion.span>
        ))}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg"
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

