"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Stack } from "../../../components/layout";
import { ActionButton } from "../../../components/ActionButton";
import { SaveIndicator } from "../../../components/ui";
import { ApiKeyPrompt } from "../../../components/ApiKeyPrompt";
import { useCreateNote, useNotes } from "../../../lib/hooks";
import { youtubeApi, aiApi, NoteSection, Note } from "../../../lib/api";
import {
  SparklesIcon,
  YouTubeIcon,
  CheckIcon,
  PlayIcon,
  ClockIcon,
  NotesIcon,
  ExternalLinkIcon,
  PenIcon,
} from "../../../components/Icons";

type SaveState = "idle" | "saving" | "saved" | "error";

const loadingMessages = [
  "Listening to the video…",
  "Playing through the content…",
  "Transcribing the audio…",
  "Organizing your notes…",
];

type GeneratedNote = {
  id?: string; // Set after auto-save
  title: string;
  tags: string[];
  language: "english" | "hindi" | "hinglish";
  sections: NoteSection[];
  content?: string; // Overall summary
  source: "youtube";
  youtubeUrl: string;
  videoId: string;
};

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// YouTube IFrame Player Component
function YouTubePlayer({
  videoId,
  onTimeUpdate,
  playerRef,
}: {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  playerRef: React.MutableRefObject<any>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setIsReady(true);
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              startTimeTracking();
            } else {
              stopTimeTracking();
            }
          },
        },
      });
    };

    const startTimeTracking = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          onTimeUpdate?.(playerRef.current.getCurrentTime());
        }
      }, 500);
    };

    const stopTimeTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Wait for API to load
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

// Section Card with timestamp
function SectionCard({
  section,
  index,
  isActive,
  onSeek,
}: {
  section: NoteSection;
  index: number;
  isActive: boolean;
  onSeek: (time: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-md"
          : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
      }`}
      onClick={() => section.startTime !== undefined && onSeek(section.startTime)}
    >
      <div className="flex items-start gap-3">
        {/* Timestamp */}
        {section.startTime !== undefined && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSeek(section.startTime!);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
              isActive
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/20 hover:text-[var(--color-primary)]"
            }`}
          >
            <PlayIcon className="w-3 h-3" />
            {formatTime(section.startTime)}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-[var(--color-text)] mb-1">
            {section.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2">
            {section.summary}
          </p>

          {/* Bullets preview */}
          {section.bullets.length > 0 && (
            <ul className="text-xs text-[var(--color-text-subtle)] space-y-0.5">
              {section.bullets.slice(0, 2).map((bullet, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-[var(--color-primary)]">•</span>
                  <span className="line-clamp-1">{bullet}</span>
                </li>
              ))}
              {section.bullets.length > 2 && (
                <li className="text-[var(--color-text-subtle)]">
                  +{section.bullets.length - 2} more
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Timeline component
function Timeline({
  sections,
  currentTime,
  duration,
  onSeek,
}: {
  sections: NoteSection[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  if (!duration || sections.length === 0) return null;

  return (
    <div className="relative h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
      {/* Progress */}
      <div
        className="absolute inset-y-0 left-0 bg-[var(--color-primary)]/30"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />

      {/* Section markers */}
      {sections.map((section, i) => {
        if (section.startTime === undefined) return null;
        const position = (section.startTime / duration) * 100;
        return (
          <button
            key={i}
            onClick={() => onSeek(section.startTime!)}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white shadow-sm hover:scale-125 transition-transform"
            style={{ left: `${position}%` }}
            title={`${section.title} (${formatTime(section.startTime)})`}
          />
        );
      })}
    </div>
  );
}

type RawTranscript = {
  transcript: string;
  videoId: string;
  subtitles: { text: string; start: number; dur: number }[];
};

export default function YouTubePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [rawTranscript, setRawTranscript] = useState<RawTranscript | null>(null);
  const [savedRawNoteId, setSavedRawNoteId] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);

  const playerRef = useRef<any>(null);
  const createNote = useCreateNote();
  
  // Fetch all notes for cache checking
  const { data: allNotes } = useNotes();
  const youtubeNotes = allNotes?.filter((note) => note.source === "youtube") || [];
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Find active section based on current time
  const activeSection = generatedNote?.sections.findIndex((section, i, arr) => {
    const start = section.startTime ?? 0;
    const end = arr[i + 1]?.startTime ?? Infinity;
    return currentTime >= start && currentTime < end;
  });

  // Auto-hide saved state
  useEffect(() => {
    if (saveState === "saved") {
      const timer = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  // Get video duration when player is ready
  useEffect(() => {
    if (playerRef.current?.getDuration) {
      const checkDuration = setInterval(() => {
        const d = playerRef.current?.getDuration?.();
        if (d > 0) {
          setDuration(d);
          clearInterval(checkDuration);
        }
      }, 500);
      return () => clearInterval(checkDuration);
    }
  }, [generatedNote]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo?.();
    }
  }, []);

  // Validate URL in real-time
  function validateUrl(inputUrl: string): { isValid: boolean; error: string | null } {
    if (!inputUrl.trim()) {
      return { isValid: false, error: null };
    }
    const videoId = extractVideoId(inputUrl);
    if (!videoId) {
      return {
        isValid: false,
        error: "Invalid YouTube URL. Use: youtube.com/watch?v=... or youtu.be/...",
      };
    }
    return { isValid: true, error: null };
  }

  function handleUrlChange(newUrl: string) {
    setUrl(newUrl);
    const validation = validateUrl(newUrl);
    setUrlError(validation.error);
  }

  async function generateNotes() {
    if (!url.trim()) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setUrlError("Invalid YouTube URL. Use: youtube.com/watch?v=... or youtu.be/...");
      return;
    }

    setUrlError(null);

    // Check if we already have a note for this video (cache check)
    const existingNote = youtubeNotes.find(
      (note) => note.videoId === videoId || note.youtubeUrl?.includes(videoId)
    );

    if (existingNote) {
      // Check if it's a raw transcript (no sections) or AI-enhanced (has sections)
      if (existingNote.sections && existingNote.sections.length > 0) {
        // AI-enhanced note - show in generated view
        setGeneratedNote({
          id: existingNote.id,
          title: existingNote.title,
          tags: existingNote.tags || ["youtube"],
          language: (existingNote.language as "english" | "hindi" | "hinglish") || "english",
          sections: existingNote.sections,
          content: existingNote.content || "",
          source: "youtube",
          youtubeUrl: existingNote.youtubeUrl || url,
          videoId: existingNote.videoId || videoId,
        });
        setSaveState("saved");
      } else {
        // Raw transcript - parse content back to subtitles format
        const subtitles = (existingNote.content || "").split("\n")
          .map((line) => {
            const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)/);
            if (match) {
              const mins = parseInt(match[1]);
              const secs = parseInt(match[2]);
              return {
                text: match[3],
                start: mins * 60 + secs,
                dur: 0,
              };
            }
            return null;
          })
          .filter(Boolean) as { text: string; start: number; dur: number }[];

        setRawTranscript({
          transcript: existingNote.content || "",
          videoId: existingNote.videoId || videoId,
          subtitles,
        });
        setSavedRawNoteId(existingNote.id);
        setSaveState("saved");
      }
      return;
    }

    // Step 1: Fetch transcript (no AI needed)
    await fetchTranscript(videoId);
  }

  // Step 1: Fetch raw transcript (no AI, no API key needed)
  async function fetchTranscript(videoId: string) {
    setLoading(true);
    setRawTranscript(null);
    setSavedRawNoteId(null);
    setGeneratedNote(null);
    setLoadingMessage("Fetching transcript...");

    try {
      const res = await fetch("http://localhost:3001/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.error) {
        let errorMsg = data.error;
        if (data.error.includes("captions") || data.error.includes("No captions")) {
          errorMsg = "This video doesn't have captions available.\n\nTry:\n• A different video with captions enabled\n• Check if the video has subtitles in YouTube";
        } else if (data.error.includes("private") || data.error.includes("Private")) {
          errorMsg = "This video is private or unavailable.\n\nMake sure the video is public and accessible.";
        } else if (data.error.includes("not found") || data.error.includes("404")) {
          errorMsg = "Video not found.\n\nPlease check the URL and try again.";
        }
        alert(`⚠️ ${errorMsg}`);
        setLoading(false);
        return;
      }

      const transcriptData = {
        transcript: data.transcript,
        videoId: data.videoId || videoId,
        subtitles: data.subtitles || [],
      };
      setRawTranscript(transcriptData);

      // Auto-save raw transcript
      try {
        const formattedContent = transcriptData.subtitles
          .map((s: { text: string; start: number; dur: number }) => `[${formatTime(s.start)}] ${s.text}`)
          .join("\n");

        const savedNote = await createNote.mutateAsync({
          title: "YouTube Transcript",
          content: formattedContent,
          tags: ["youtube", "transcript"],
          language: "english",
          source: "youtube",
          isAIGenerated: false,
          youtubeUrl: url,
          videoId: transcriptData.videoId,
          sections: [],
        });

        setSavedRawNoteId(savedNote.id);
        setSaveState("saved");
      } catch (err) {
        console.error("Auto-save error:", err);
        // Continue even if auto-save fails
      }
    } catch (error) {
      console.error("Transcript fetch error:", error);
      alert("⚠️ Failed to fetch transcript.\n\nPlease check:\n• API server is running (localhost:3001)\n• Your internet connection\n• The video URL is correct\n\nTry again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Refine with AI (requires API key)
  async function refineWithAI() {
    if (!rawTranscript) return;

    setRefining(true);
    setLoadingMessage("AI is analyzing...");

    try {
      const token = localStorage.getItem("notely-token");
      const res = await fetch("http://localhost:3001/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          transcript: rawTranscript.transcript,
          subtitles: rawTranscript.subtitles,
        }),
      });
      const data = await res.json();

      if (data.error === "API_KEY_REQUIRED") {
        setShowApiKeyPrompt(true);
        setRefining(false);
        return;
      }

      if (data.error) {
        let errorMsg = data.error;
        if (data.error.includes("rate limit") || data.error.includes("quota")) {
          errorMsg = "AI service is temporarily unavailable due to rate limits.\n\nPlease try again in a few minutes.";
        } else if (data.error.includes("invalid") || data.error.includes("Invalid")) {
          errorMsg = "Invalid API key or configuration.\n\nPlease check your Gemini API key in Settings.";
        }
        alert(`⚠️ ${errorMsg}`);
        setRefining(false);
        return;
      }

      // Convert to note format
      const sections: NoteSection[] = (data.sections || []).map((s: any) => ({
        id: crypto.randomUUID(),
        title: s.title,
        summary: s.summary,
        bullets: s.bullets,
        language: "english" as const,
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      const noteData = {
        title: sections[0]?.title || "YouTube Notes",
        tags: data.tags || ["youtube"],
        language: "english" as const,
        sections,
        content: data.summary || "",
        source: "youtube" as const,
        youtubeUrl: url,
        videoId: rawTranscript.videoId,
      };

      // Auto-save
      try {
        const savedNote = await createNote.mutateAsync({
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags,
          language: noteData.language,
          source: "youtube",
          isAIGenerated: true,
          youtubeUrl: noteData.youtubeUrl,
          sections: noteData.sections,
        });
        setGeneratedNote({ ...noteData, id: savedNote.id });
        setSaveState("saved");
      } catch {
        setGeneratedNote(noteData);
      }

      setRawTranscript(null); // Clear raw transcript view
      setSavedRawNoteId(null);
    } catch (error) {
      console.error("AI refinement error:", error);
      alert("⚠️ AI refinement failed.\n\nPossible causes:\n• Network connection issue\n• API server not responding\n• Invalid API key\n\nPlease check your connection and try again.");
    } finally {
      setRefining(false);
    }
  }


  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  const handleSave = async () => {
    if (!generatedNote) return;

    setSaveState("saving");
    try {
      const result = await createNote.mutateAsync({
        title: generatedNote.title || "YouTube Notes",
        content: generatedNote.content || "",
        tags: generatedNote.tags || ["youtube"],
        language: generatedNote.language || "english",
        source: "youtube",
        isAIGenerated: generatedNote.sections.length > 0,
        youtubeUrl: generatedNote.youtubeUrl,
        sections: generatedNote.sections,
      });
      // Update state with saved id
      setGeneratedNote({ ...generatedNote, id: result.id });
      setSaveState("saved");
    } catch (err) {
      console.error("Failed to save note:", err);
      setSaveState("error");
    }
  };

  // Raw transcript state - show transcript with options
  if (rawTranscript) {
    const videoId = rawTranscript.videoId;
    return (
      <div className="h-[calc(100vh-5rem)] lg:h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => {
                  setRawTranscript(null);
                  setSavedRawNoteId(null);
                }}
                className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors"
              >
                ←
              </button>
              <div className="min-w-0">
                <h1 className="font-semibold text-[var(--color-text)] truncate">
                  Transcript Ready
                </h1>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {rawTranscript.subtitles.length} segments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedRawNoteId && (
                <Link
                  href={`/notes/${savedRawNoteId}`}
                  className="px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
                >
                  <NotesIcon className="w-4 h-4" />
                  View Note
                </Link>
              )}
              <button
                onClick={refineWithAI}
                disabled={refining}
                className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-dark)] disabled:opacity-50 flex items-center gap-2"
              >
                {refining ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Refine with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
            {/* Video Panel - fixed, no scroll */}
            <div className="lg:w-1/2 xl:w-3/5 flex-shrink-0 p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
              <YouTubePlayer
                videoId={videoId}
                onTimeUpdate={setCurrentTime}
                playerRef={playerRef}
              />

              {/* Info Banner */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-[var(--color-text)]">
                  <strong>Transcript ready!</strong> Save as text or refine with AI for structured notes.
                </p>
              </div>
            </div>

            {/* Transcript Panel - scrollable */}
            <div className="lg:w-1/2 xl:w-2/5 flex-1 min-h-0 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[var(--color-border)]">
              <div className="p-4 sm:p-6 space-y-1">
                {rawTranscript.subtitles.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (playerRef.current?.seekTo) {
                        playerRef.current.seekTo(sub.start, true);
                        playerRef.current.playVideo?.();
                      }
                    }}
                    className="w-full flex gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] text-left transition-colors"
                  >
                    <span className="text-xs text-[var(--color-primary)] font-mono w-12 flex-shrink-0">
                      {formatTime(sub.start)}
                    </span>
                    <span className="text-sm text-[var(--color-text)]">
                      {sub.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Key Prompt */}
        <ApiKeyPrompt
          isOpen={showApiKeyPrompt}
          onClose={() => setShowApiKeyPrompt(false)}
          onSuccess={() => {
            setShowApiKeyPrompt(false);
            refineWithAI();
          }}
          context="youtube"
        />
      </div>
    );
  }

  // Generated state - Split view with video
  if (generatedNote) {
    return (
      <div className="h-[calc(100vh-5rem)] lg:h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => {
                  setGeneratedNote(null);
                  setUrl("");
                }}
                className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
              >
                ← Back
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-[var(--color-text)] truncate">
                  {generatedNote.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SaveIndicator state={saveState} />
              {generatedNote.id ? (
                <ActionButton
                  onClick={() => router.push(`/notes/${generatedNote.id}`)}
                  variant="primary"
                  size="sm"
                  icon={<NotesIcon className="w-4 h-4" />}
                >
                  View Note
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={handleSave}
                  variant="primary"
                  size="sm"
                  icon={<CheckIcon className="w-4 h-4" />}
                >
                  Save Note
                </ActionButton>
              )}
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
            {/* Video Panel - fixed, no scroll */}
            <div className="lg:w-1/2 xl:w-3/5 flex-shrink-0 p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
              <YouTubePlayer
                videoId={generatedNote.videoId}
                onTimeUpdate={setCurrentTime}
                playerRef={playerRef}
              />

              {/* Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Timeline
                  sections={generatedNote.sections}
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={seekTo}
                />
              </div>

              {/* Video info & summary */}
              <div className="hidden lg:block space-y-2">
                <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <ClockIcon className="w-4 h-4" />
                  {generatedNote.sections.length} sections •{" "}
                  {generatedNote.sections.reduce(
                    (acc, s) => acc + s.bullets.length,
                    0
                  )}{" "}
                  key points
                </p>
                {/* Overall video summary - truncated */}
                {generatedNote.content && (
                  <p className="text-xs text-[var(--color-text-subtle)] line-clamp-2">
                    {generatedNote.content}
                  </p>
                )}
              </div>
            </div>

            {/* Sections Panel - scrollable independently */}
            <div className="lg:w-1/2 xl:w-2/5 min-h-0 flex-1 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[var(--color-border)] p-4 sm:p-6">
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Sections ({generatedNote.sections.length})
                </h2>

                <div className="space-y-2">
                  {generatedNote.sections.map((section, index) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      index={index}
                      isActive={activeSection === index}
                      onSeek={seekTo}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - URL input
  return (
    <Container size="lg" className="py-6 sm:py-8">
      <Stack gap={8}>
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            YouTube to Notes
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Transform any YouTube video into structured, timestamped notes
          </p>
        </div>

        {/* URL Input */}
        <Stack gap={2}>
          <Stack direction="row" gap={3} className="flex-col sm:flex-row">
            <div className="flex-1">
              <input
                className={`w-full border rounded-xl px-4 py-3 text-base text-[var(--color-text)] bg-[var(--color-surface)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:ring-2 transition-all ${
                  urlError
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-transparent"
                }`}
                placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && !urlError) {
                    generateNotes();
                  }
                }}
              />
              {urlError && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {urlError}
                </p>
              )}
            </div>
            <ActionButton
              onClick={generateNotes}
              disabled={loading || !url.trim() || !!urlError}
              loading={loading}
              variant="primary"
              size="lg"
              icon={<SparklesIcon className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Generate Notes
            </ActionButton>
          </Stack>
        </Stack>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            {/* Animated Record Player */}
            <div className="relative w-20 h-20 mb-4 mx-auto">
              {/* Record disc */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                {/* Grooves */}
                <div className="absolute inset-2 rounded-full border border-gray-700" />
                <div className="absolute inset-4 rounded-full border border-gray-700" />
                <div className="absolute inset-6 rounded-full border border-gray-700" />
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </motion.div>
              {/* Tonearm */}
              <motion.div
                className="absolute -right-1 top-1 w-10 h-1 bg-gray-400 rounded-full origin-right"
                style={{ transformOrigin: "right center" }}
                animate={{ rotate: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500" />
              </motion.div>
            </div>
            <p className="text-lg text-[var(--color-text)]">{loadingMessage}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              This may take a moment...
            </p>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !generatedNote && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
              <YouTubeIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Import from YouTube
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)] max-w-md mx-auto">
              Paste a YouTube URL above to automatically generate structured
              notes with timestamps, sections, and key points.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs text-[var(--color-text-subtle)]">
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full flex items-center gap-1">
                <CheckIcon className="w-3 h-3" /> Timestamps
              </span>
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full flex items-center gap-1">
                <CheckIcon className="w-3 h-3" /> Video sync
              </span>
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full flex items-center gap-1">
                <CheckIcon className="w-3 h-3" /> Key points
              </span>
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full flex items-center gap-1">
                <CheckIcon className="w-3 h-3" /> Editable
              </span>
            </div>
          </div>
        )}

        {/* Previous YouTube Notes */}
        <YouTubeNotesSection />
      </Stack>

      {/* API Key Prompt */}
      <ApiKeyPrompt
        isOpen={showApiKeyPrompt}
        onClose={() => setShowApiKeyPrompt(false)}
        onSuccess={() => {
          setShowApiKeyPrompt(false);
          // Retry generation after key is added
          generateNotes();
        }}
        context="youtube"
      />
    </Container>
  );
}

// Extract video ID from URL
function extractVideoIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// YouTube thumbnail URL
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// YouTube Notes Section Component
function YouTubeNotesSection() {
  const { data: notes, isLoading } = useNotes();
  
  // Filter YouTube notes
  const youtubeNotes = notes?.filter((note) => note.source === "youtube") || [];
  
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-72 h-48 bg-[var(--color-surface)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-8 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          Previous Transcripts
        </h2>
        {youtubeNotes.length > 0 && (
          <Link
            href="/youtube/transcripts"
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            View all →
          </Link>
        )}
      </div>
      
      {youtubeNotes.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-4">
            <YouTubeIcon className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
            No transcripts yet
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            Your YouTube transcripts will appear here once you generate notes from videos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {youtubeNotes.slice(0, 6).map((note) => (
            <YouTubeNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

// YouTube Note Card Component with consistent sizing
function YouTubeNoteCard({ note }: { note: Note }) {
  const videoId = note.youtubeUrl ? extractVideoIdFromUrl(note.youtubeUrl) : null;
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col h-full bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all"
    >
      {/* Thumbnail */}
      {thumbnail && (
        <div className="relative aspect-video bg-black flex-shrink-0">
          <img
            src={thumbnail}
            alt={note.title}
            className="w-full h-full object-cover"
          />
          {/* Play overlay */}
          <Link
            href={`/youtube/${note.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-red-600 ml-1" />
            </div>
          </Link>
          {/* AI badge - only for AI enhanced */}
          {note.sections.length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-medium flex items-center gap-1">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              AI
            </div>
          )}
          {/* Section count badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
            {note.sections.length > 0 ? `${note.sections.length} sections` : "Transcript"}
          </div>
        </div>
      )}

      {/* Content - flex-1 to fill remaining space */}
      <div className="flex-1 flex flex-col p-4">
        {/* Title - max 2 lines with fixed height */}
        <h3 className="font-medium text-[var(--color-text)] line-clamp-2 h-12 mb-2">
          {note.title}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-3">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {formatDate(note.createdAt)}
          </span>
          <span>•</span>
          <span>{note.sections.reduce((acc, s) => acc + s.bullets.length, 0)} points</span>
        </div>
        
        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />
        
        {/* Actions - always at bottom */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/youtube/${note.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            Watch
          </Link>
          <Link
            href={`/notes/${note.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-muted)] text-sm font-medium hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors"
          >
            <NotesIcon className="w-4 h-4" />
            Notes
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
