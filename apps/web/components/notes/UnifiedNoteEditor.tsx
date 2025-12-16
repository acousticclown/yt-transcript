"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// Custom hook for undo/redo
function useHistory<T>(initialState: T, maxHistory = 50) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = history[currentIndex];

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const actualNewState = typeof newState === "function" 
        ? (newState as (prev: T) => T)(prev[currentIndex])
        : newState;
      
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(actualNewState);
      
      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { current, set, undo, redo, canUndo, canRedo };
}

// Types
type NoteSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  language: "english" | "hindi" | "hinglish";
};

type UnifiedNote = {
  id?: string;
  title: string;
  content: string; // Main content (for simple notes without sections)
  tags: string[];
  language: "english" | "hindi" | "hinglish";
  sections: NoteSection[];
  source?: "manual" | "youtube";
  youtubeUrl?: string;
};

type UnifiedNoteEditorProps = {
  initialNote?: Partial<UnifiedNote>;
  onSave?: (note: UnifiedNote) => void;
  onAIAction?: (action: string, text: string) => Promise<string>;
};

// Helper components (defined before main component)

// AI Actions Menu - Notion/Linear style collapsed menu
function AIActionsMenu({
  onAction,
  loading,
  targetLabel,
}: {
  onAction: (action: "simplify" | "expand" | "regenerate") => void;
  loading: string | null;
  targetLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const actions = [
    { id: "simplify" as const, icon: "✨", label: "Simplify", desc: "Make it clearer and shorter" },
    { id: "expand" as const, icon: "📝", label: "Expand", desc: "Add more detail and depth" },
    { id: "regenerate" as const, icon: "🔄", label: "Regenerate", desc: "Rewrite from scratch" },
  ];

  const handleAction = (actionId: "simplify" | "expand" | "regenerate") => {
    onAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          "bg-gradient-to-r from-violet-500/10 to-purple-500/10",
          "border border-violet-500/20 hover:border-violet-500/40",
          "text-violet-600 dark:text-violet-400",
          "hover:shadow-md hover:shadow-violet-500/10",
          loading && "opacity-70"
        )}
      >
        <span className="text-base">🪄</span>
        <span>AI Assist</span>
        {loading && (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <svg className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--color-border)] bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪄</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">AI Actions</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Apply to: <span className="font-medium text-violet-600 dark:text-violet-400">{targetLabel}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    disabled={!!loading}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left",
                      "hover:bg-[var(--color-bg)]",
                      loading === action.id && "bg-violet-500/10"
                    )}
                  >
                    <span className="text-xl mt-0.5">{action.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text)] flex items-center gap-2">
                        {action.label}
                        {loading === action.id && (
                          <svg className="w-3.5 h-3.5 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer tip */}
              <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50">
                <p className="text-xs text-[var(--color-text-subtle)]">
                  💡 Select text first for precise editing
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormatButton({
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
      className="p-1.5 min-w-[28px] text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-md transition-colors"
    >
      {children}
    </button>
  );
}

export function UnifiedNoteEditor({
  initialNote,
  onSave,
  onAIAction,
}: UnifiedNoteEditorProps) {
  const initialNoteState: UnifiedNote = {
    title: initialNote?.title || "",
    content: initialNote?.content || "",
    tags: initialNote?.tags || [],
    language: initialNote?.language || "english",
    sections: initialNote?.sections || [],
    source: initialNote?.source || "manual",
    youtubeUrl: initialNote?.youtubeUrl,
  };

  const { current: note, set: setNote, undo, redo, canUndo, canRedo } = useHistory(initialNoteState);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [focusedBulletKey, setFocusedBulletKey] = useState<string | null>(null); // "sectionId-bulletIndex"
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  
  // Selection tracking
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    field: "summary" | "bullet";
    sectionId: string;
    bulletIndex?: number;
    start: number;
    end: number;
  } | null>(null);

  // Refs for text inputs
  const summaryRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const bulletRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Stats
  const totalChars = note.sections.reduce(
    (acc, s) => acc + s.summary.length + s.bullets.join("").length,
    0
  );
  const totalPoints = note.sections.reduce((acc, s) => acc + s.bullets.length, 0);

  // Get current target for AI action
  const getAITarget = () => {
    // 1. Selected text with field info
    if (selectionInfo && selectionInfo.text) {
      return { 
        text: selectionInfo.text, 
        type: "selection" as const,
        ...selectionInfo
      };
    }
    // 2. Focused bullet
    if (focusedBulletKey) {
      const [sectionId, bulletIdx] = focusedBulletKey.split("-");
      const section = note.sections.find(s => s.id === sectionId);
      const bullet = section?.bullets[parseInt(bulletIdx)];
      if (bullet) {
        return { text: bullet, type: "bullet" as const, sectionId, bulletIndex: parseInt(bulletIdx) };
      }
    }
    // 3. Focused section
    if (focusedSectionId) {
      const section = note.sections.find(s => s.id === focusedSectionId);
      if (section) {
        return { text: section.summary, type: "section" as const, sectionId: focusedSectionId };
      }
    }
    // 4. Main content if available
    if (note.content) {
      return { text: note.content, type: "content" as const };
    }
    // 5. All sections
    const allText = note.sections.map(s => s.summary).join("\n\n");
    return { text: allText || "No content", type: "all" as const };
  };

  // AI Action handler
  const handleAI = async (action: "simplify" | "expand" | "regenerate") => {
    if (!onAIAction) return;
    
    const target = getAITarget();
    if (!target.text.trim()) return;

    setAiLoading(action);
    try {
      const result = await onAIAction(action, target.text);
      
      // Apply result based on target type
      if (target.type === "selection" && "field" in target) {
        // Replace selected text in the correct field
        if (target.field === "content" || target.sectionId === "main") {
          const newContent = 
            note.content.slice(0, target.start) + 
            result + 
            note.content.slice(target.end);
          setNote({ ...note, content: newContent });
        } else if (target.field === "summary" && target.sectionId) {
          const section = note.sections.find(s => s.id === target.sectionId);
          if (section) {
            const newSummary = 
              section.summary.slice(0, target.start) + 
              result + 
              section.summary.slice(target.end);
            updateSection(target.sectionId, { summary: newSummary });
          }
        } else if (target.field === "bullet" && target.sectionId && target.bulletIndex !== undefined) {
          const section = note.sections.find(s => s.id === target.sectionId);
          if (section) {
            const bullet = section.bullets[target.bulletIndex];
            const newBullet = 
              bullet.slice(0, target.start) + 
              result + 
              bullet.slice(target.end);
            updateBullet(target.sectionId, target.bulletIndex, newBullet);
          }
        }
      } else if (target.type === "content") {
        setNote({ ...note, content: result });
      } else if (target.type === "bullet" && target.sectionId !== undefined && target.bulletIndex !== undefined) {
        updateBullet(target.sectionId, target.bulletIndex, result);
      } else if (target.type === "section" && target.sectionId) {
        updateSection(target.sectionId, { summary: result });
      }
      // For "all", we don't auto-replace
    } finally {
      setAiLoading(null);
      setSelectionInfo(null);
    }
  };

  // Get label for current AI target
  const getTargetLabel = () => {
    if (selectionInfo?.text) return `Selected: "${selectionInfo.text.slice(0, 20)}${selectionInfo.text.length > 20 ? '...' : ''}"`;
    if (focusedBulletKey) return "Focused key point";
    if (focusedSectionId) {
      const section = note.sections.find(s => s.id === focusedSectionId);
      return `Section: ${section?.title || "Untitled"}`;
    }
    if (note.content) return "Main content";
    return "All content";
  };

  // Tag handlers
  const handleAddTag = () => {
    if (newTag.trim() && !note.tags.includes(newTag.trim())) {
      setNote({ ...note, tags: [...note.tags, newTag.trim()] });
      setNewTag("");
    }
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    setNote({ ...note, tags: note.tags.filter((t) => t !== tag) });
  };

  // Section handlers
  const addSection = () => {
    const newSection: NoteSection = {
      id: crypto.randomUUID(),
      title: "",
      summary: "",
      bullets: [""],
      language: note.language,
    };
    setNote({ ...note, sections: [...note.sections, newSection] });
  };

  const updateSection = (sectionId: string, updates: Partial<NoteSection>) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteSection = (sectionId: string) => {
    setNote({
      ...note,
      sections: note.sections.filter((s) => s.id !== sectionId),
    });
    if (focusedSectionId === sectionId) setFocusedSectionId(null);
  };

  const addBullet = (sectionId: string) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId ? { ...s, bullets: [...s.bullets, ""] } : s
      ),
    });
  };

  const updateBullet = (sectionId: string, index: number, value: string) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId
          ? { ...s, bullets: s.bullets.map((b, i) => (i === index ? value : b)) }
          : s
      ),
    });
  };

  const deleteBullet = (sectionId: string, index: number) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId
          ? { ...s, bullets: s.bullets.filter((_, i) => i !== index) }
          : s
      ),
    });
  };

  // Language change
  const handleLanguageChange = (lang: "english" | "hindi" | "hinglish") => {
    setNote({ ...note, language: lang });
  };

  // Insert formatting in content
  const insertFormat = (before: string, after: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = note.content.slice(start, end);
    const newContent = note.content.slice(0, start) + before + selected + after + note.content.slice(end);
    setNote({ ...note, content: newContent });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Text selection handler for main content
  const handleContentSelect = () => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = note.content.slice(start, end);
    
    if (text) {
      setSelectionInfo({
        text,
        field: "content" as any,
        sectionId: "main",
        start,
        end,
      });
    } else {
      setSelectionInfo(null);
    }
  };

  // Text selection handler for summary
  const handleSummarySelect = (sectionId: string) => {
    const textarea = summaryRefs.current[sectionId];
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.slice(start, end);
    
    if (text) {
      setSelectionInfo({
        text,
        field: "summary",
        sectionId,
        start,
        end,
      });
    } else {
      setSelectionInfo(null);
    }
  };

  // Text selection handler for bullet
  const handleBulletSelect = (sectionId: string, bulletIndex: number) => {
    const bulletKey = `${sectionId}-${bulletIndex}`;
    const input = bulletRefs.current[bulletKey];
    if (!input) return;
    
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = input.value.slice(start, end);
    
    if (text) {
      setSelectionInfo({
        text,
        field: "bullet",
        sectionId,
        bulletIndex,
        start,
        end,
      });
    } else {
      setSelectionInfo(null);
    }
  };

  const handleSave = () => {
    onSave?.({
      ...note,
      updatedAt: new Date().toISOString(),
    } as UnifiedNote & { updatedAt: string });
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      {/* Top Toolbar - Undo/Redo + AI Actions */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 overflow-x-auto">
        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            canUndo
              ? "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              : "text-[var(--color-text-subtle)] opacity-50 cursor-not-allowed"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            canRedo
              ? "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              : "text-[var(--color-text-subtle)] opacity-50 cursor-not-allowed"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        
        <div className="flex-1" />
        
        {/* AI Actions - Collapsed Menu */}
        <AIActionsMenu
          onAction={handleAI}
          loading={aiLoading}
          targetLabel={getTargetLabel()}
        />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)]">
        {/* Title */}
        <input
          type="text"
          placeholder="Untitled Note"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          className="w-full text-2xl font-bold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
        />

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)]"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 transition-colors ml-0.5"
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
              placeholder="tag"
              autoFocus
              className="text-xs px-2.5 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-20"
            />
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-xs px-2.5 py-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-full transition-colors"
            >
              + tag
            </button>
          )}
        </div>

        {/* Language Toggle */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)]">Language:</span>
          <div className="inline-flex gap-1 bg-[var(--color-bg)] rounded-lg p-1">
            {(["english", "hindi", "hinglish"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors capitalize",
                  note.language === lang
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (for simple notes) */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--color-text-muted)]">Content</label>
        </div>
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-[var(--color-bg)] rounded-t-xl border border-b-0 border-[var(--color-border)] overflow-x-auto">
          {/* Text formatting */}
          <FormatButton onClick={() => insertFormat("**", "**")} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("*", "*")} title="Italic (Ctrl+I)">
            <em>I</em>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("~~", "~~")} title="Strikethrough">
            <s>S</s>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("<u>", "</u>")} title="Underline">
            <u>U</u>
          </FormatButton>
          
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          
          {/* Headings */}
          <FormatButton onClick={() => insertFormat("\n# ", "")} title="Heading 1">H1</FormatButton>
          <FormatButton onClick={() => insertFormat("\n## ", "")} title="Heading 2">H2</FormatButton>
          <FormatButton onClick={() => insertFormat("\n### ", "")} title="Heading 3">H3</FormatButton>
          
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          
          {/* Lists */}
          <FormatButton onClick={() => insertFormat("\n- ", "")} title="Bullet List">
            <span className="text-base">•</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("\n1. ", "")} title="Numbered List">
            <span className="text-xs">1.</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("\n- [ ] ", "")} title="Task List">
            <span className="text-xs">☐</span>
          </FormatButton>
          
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          
          {/* Code & Quote */}
          <FormatButton onClick={() => insertFormat("`", "`")} title="Inline Code">
            <span className="font-mono text-xs">{`<>`}</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("\n```\n", "\n```")} title="Code Block">
            <span className="font-mono text-xs">{`{}`}</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("\n> ", "")} title="Quote">
            <span className="text-base">"</span>
          </FormatButton>
          
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          
          {/* Links & Media */}
          <FormatButton onClick={() => insertFormat("[", "](url)")} title="Link">
            <span className="text-xs">🔗</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("![alt](", ")")} title="Image">
            <span className="text-xs">🖼️</span>
          </FormatButton>
          
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          
          {/* Special */}
          <FormatButton onClick={() => insertFormat("\n---\n", "")} title="Horizontal Rule">
            <span className="text-xs">—</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("\n| Col 1 | Col 2 |\n|-------|-------|\n| ", " |")} title="Table">
            <span className="text-xs">⊞</span>
          </FormatButton>
          <FormatButton onClick={() => insertFormat("==", "==")} title="Highlight">
            <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-0.5">H</span>
          </FormatButton>
        </div>
        
        <textarea
          ref={contentRef}
          placeholder="Write your note here... (Markdown supported)"
          value={note.content}
          onChange={(e) => setNote({ ...note, content: e.target.value })}
          onSelect={handleContentSelect}
          onKeyDown={(e) => {
            // Keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
              if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
              if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
              if (e.key === 'y') { e.preventDefault(); redo(); }
              if (e.key === 'b') { e.preventDefault(); insertFormat("**", "**"); }
              if (e.key === 'i') { e.preventDefault(); insertFormat("*", "*"); }
              if (e.key === 'k') { e.preventDefault(); insertFormat("[", "](url)"); }
            }
          }}
          className="w-full min-h-[200px] p-4 text-[var(--color-text)] bg-[var(--color-surface)] rounded-b-xl border border-t-0 border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] resize-y leading-relaxed font-mono text-sm"
        />
        <div className="mt-2 flex justify-between text-xs text-[var(--color-text-subtle)]">
          <span className="flex items-center gap-3">
            <span>{note.content.split(/\s+/).filter(Boolean).length} words</span>
            <span>{note.content.length} chars</span>
            <span>{note.content.split('\n').length} lines</span>
          </span>
          <span className="text-[var(--color-text-muted)]">Markdown supported</span>
        </div>
      </div>

      {/* Sections (optional, for structured notes) */}
      {(note.sections.length > 0 || note.source === "youtube") && (
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-[var(--color-text-muted)]">Sections</span>
            <span className="text-xs text-[var(--color-text-subtle)]">(optional, from YouTube or structured notes)</span>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="px-6 pb-6 space-y-6">
        <AnimatePresence>
          {note.sections.map((section, sectionIndex) => {
            const isFocused = focusedSectionId === section.id;
            const dimmed = focusedSectionId !== null && !isFocused;

            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isFocused
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]/50"
                )}
              >
                {/* Section Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <input
                    type="text"
                    placeholder={`Section ${sectionIndex + 1}`}
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="flex-1 text-lg font-semibold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFocusedSectionId(isFocused ? null : section.id)}
                      className={cn(
                        "p-1.5 rounded-lg text-xs transition-colors",
                        isFocused
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
                      )}
                      title={isFocused ? "Unfocus" : "Focus for AI"}
                    >
                      {isFocused ? "◉" : "○"}
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <label className="text-xs text-[var(--color-text-muted)] mb-2 block">Summary</label>
                  <textarea
                    ref={(el) => { summaryRefs.current[section.id] = el; }}
                    placeholder="Write a summary..."
                    value={section.summary}
                    onChange={(e) => updateSection(section.id, { summary: e.target.value })}
                    onSelect={() => handleSummarySelect(section.id)}
                    onBlur={() => setTimeout(() => setSelectionInfo(null), 200)}
                    className="w-full min-h-[80px] p-3 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] resize-none"
                  />
                  <div className="mt-1 text-xs text-[var(--color-text-subtle)] text-right">
                    {section.summary.length} chars
                  </div>
                </div>

                {/* Key Points */}
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-2 block">
                    Key Points ({section.bullets.filter(Boolean).length})
                  </label>
                  <ul className="space-y-2">
                    {section.bullets.map((bullet, bulletIndex) => {
                      const bulletKey = `${section.id}-${bulletIndex}`;
                      const isBulletFocused = focusedBulletKey === bulletKey;
                      
                      return (
                        <li key={bulletIndex} className="flex items-start gap-2">
                          <button
                            onClick={() => setFocusedBulletKey(isBulletFocused ? null : bulletKey)}
                            className={cn(
                              "w-2 h-2 mt-2 rounded-full flex-shrink-0 transition-colors",
                              isBulletFocused
                                ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                                : "bg-[var(--color-text-subtle)]"
                            )}
                            title={isBulletFocused ? "Unfocus" : "Focus for AI"}
                          />
                          <input
                            ref={(el) => { bulletRefs.current[bulletKey] = el; }}
                            type="text"
                            placeholder="Add a key point..."
                            value={bullet}
                            onChange={(e) => updateBullet(section.id, bulletIndex, e.target.value)}
                            onFocus={() => setFocusedBulletKey(bulletKey)}
                            onSelect={() => handleBulletSelect(section.id, bulletIndex)}
                            onBlur={() => setTimeout(() => setSelectionInfo(null), 200)}
                            className={cn(
                              "flex-1 text-sm text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]",
                              isBulletFocused && "text-[var(--color-primary)]"
                            )}
                          />
                          <button
                            onClick={() => deleteBullet(section.id, bulletIndex)}
                            className="p-1 text-[var(--color-text-subtle)] hover:text-red-500 transition-colors text-xs opacity-60 hover:opacity-100"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    onClick={() => addBullet(section.id)}
                    className="mt-2 text-xs text-[var(--color-primary)] hover:underline"
                  >
                    + Add point
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Section */}
        <button
          onClick={addSection}
          className="w-full p-4 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          + Add Section
        </button>

        {note.sections.length === 0 && (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <p>No sections yet. Add a section to organize your notes.</p>
            <p className="text-sm mt-1">Sections are optional - great for YouTube imports or long notes.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/30">
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
          <span>{note.sections.length} sections</span>
          <span>{totalPoints} points</span>
          <span>{totalChars} chars</span>
          {note.source === "youtube" && <span className="text-red-500">📺 YouTube</span>}
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Save Note
        </button>
      </div>
    </div>
  );
}

function AIButton({
  children,
  onClick,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
        "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading ? "..." : children}
    </button>
  );
}
