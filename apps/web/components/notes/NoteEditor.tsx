"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type NoteEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  onSave?: (data: { title: string; content: string; tags: string[] }) => void;
  onAIAction?: (action: string, selection?: string) => Promise<string>;
};

export function NoteEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  onSave,
  onAIAction,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [selection, setSelection] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    onSave?.({ title, content, tags });
  };

  const handleAIAction = useCallback(
    async (action: string) => {
      if (!onAIAction) return;
      setAiLoading(action);
      try {
        const result = await onAIAction(action, selection || content);
        if (selection) {
          // Replace selection
          setContent(content.replace(selection, result));
        } else {
          // Append or replace based on action
          if (action === "expand" || action === "continue") {
            setContent(content + "\n\n" + result);
          } else {
            setContent(result);
          }
        }
      } catch (error) {
        console.error("AI action failed:", error);
      } finally {
        setAiLoading(null);
        setSelection("");
      }
    },
    [content, selection, onAIAction]
  );

  const handleTextSelect = () => {
    const selected = window.getSelection()?.toString() || "";
    setSelection(selected);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 overflow-x-auto">
        <ToolbarButton onClick={() => insertFormat("**", "**")} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("*", "*")} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("\n- ", "")} title="List">
          •
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("\n## ", "")} title="Heading">
          H
        </ToolbarButton>
        <ToolbarButton onClick={() => insertFormat("`", "`")} title="Code">
          {"</>"}
        </ToolbarButton>
        
        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
        
        {/* AI Actions */}
        <AIButton
          onClick={() => handleAIAction("summarize")}
          loading={aiLoading === "summarize"}
          disabled={!content}
        >
          ✨ Summarize
        </AIButton>
        <AIButton
          onClick={() => handleAIAction("expand")}
          loading={aiLoading === "expand"}
          disabled={!content}
        >
          📝 Expand
        </AIButton>
        <AIButton
          onClick={() => handleAIAction("simplify")}
          loading={aiLoading === "simplify"}
          disabled={!content && !selection}
        >
          🎯 Simplify
        </AIButton>
      </div>

      {/* Editor */}
      <div className="p-6">
        {/* Title */}
        <input
          type="text"
          placeholder="Untitled Note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
        />

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)] group"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              >
                ×
              </button>
            </span>
          ))}
          {showTagInput ? (
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={handleAddTag}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="tag name"
              autoFocus
              className="text-xs px-2 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-24"
            />
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-xs px-2 py-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-full transition-colors"
            >
              + Add tag
            </button>
          )}
        </div>

        {/* Content */}
        <textarea
          placeholder="Start writing... (Select text for AI actions)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSelect={handleTextSelect}
          className="w-full mt-6 min-h-[400px] text-[var(--color-text)] bg-transparent border-none focus:outline-none resize-none placeholder:text-[var(--color-text-subtle)] leading-relaxed"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/30">
        <div className="text-xs text-[var(--color-text-subtle)]">
          {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );

  function insertFormat(before: string, after: string) {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
  }
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 min-w-[32px] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

function AIButton({
  children,
  onClick,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
        "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20",
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-1">
          <span className="animate-spin">⏳</span> Working...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

