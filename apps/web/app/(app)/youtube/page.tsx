"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Stack } from "../../../components/layout";
import { ActionButton } from "../../../components/ActionButton";
import { SaveIndicator } from "../../../components/ui";
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
} from "../../../components/Icons";

type SaveState = "idle" | "saving" | "saved" | "error";

const loadingMessages = [
  "Listening to the video…",
  "Writing clean notes…",
  "Organizing thoughts…",
  "Making it readable…",
];

type GeneratedNote = {
  title: string;
  tags: string[];
  language: "english" | "hindi" | "hinglish";
  sections: NoteSection[];
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

export default function YouTubePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<any>(null);
  const createNote = useCreateNote();
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

  async function generateNotes() {
    if (!url.trim()) return;

    setLoading(true);
    setGeneratedNote(null);
    setLoadingMessage(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    );

    try {
      const result = await youtubeApi.generate(url);

      if (result.error) {
        const errorMsg =
          result.error.includes("captions") ||
          result.error.includes("Transcript not available")
            ? "This video doesn't have captions yet. Try another video with captions enabled."
            : result.error;
        alert(`⚠️ ${errorMsg}`);
        setLoading(false);
        return;
      }

      // Convert to unified note format with timestamps
      const sections: NoteSection[] = (result.sections || []).map(
        (section: any) => ({
          id: crypto.randomUUID(),
          title: section.title,
          summary: section.summary,
          bullets: section.bullets,
          language: "english" as const,
          startTime: section.startTime,
          endTime: section.endTime,
        })
      );

      const videoTitle = sections[0]?.title || "YouTube Notes";

      setGeneratedNote({
        title: videoTitle,
        tags: ["youtube"],
        language: "english",
        sections,
        source: "youtube",
        youtubeUrl: url,
        videoId: result.videoId || extractVideoId(url) || "",
      });
    } catch (error) {
      alert(
        "⚠️ Couldn't generate notes right now. Make sure the API server is running on port 3001."
      );
    } finally {
      setLoading(false);
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
        content: "",
        tags: generatedNote.tags || ["youtube"],
        language: generatedNote.language || "english",
        source: "youtube",
        youtubeUrl: generatedNote.youtubeUrl,
        sections: generatedNote.sections,
      });
      setSaveState("saved");
      setTimeout(() => router.push(`/notes/${result.id}?edit=true`), 500);
    } catch (err) {
      console.error("Failed to save note:", err);
      setSaveState("error");
    }
  };

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
              <ActionButton
                onClick={handleSave}
                variant="primary"
                size="sm"
                icon={<CheckIcon className="w-4 h-4" />}
              >
                Save Note
              </ActionButton>
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

              {/* Video info */}
              <div className="hidden lg:block text-sm text-[var(--color-text-muted)]">
                <p className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  {generatedNote.sections.length} sections •{" "}
                  {generatedNote.sections.reduce(
                    (acc, s) => acc + s.bullets.length,
                    0
                  )}{" "}
                  key points
                </p>
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
        <Stack direction="row" gap={3} className="flex-col sm:flex-row">
          <input
            className="flex-1 border border-[var(--color-border)] rounded-xl px-4 py-3 text-base text-[var(--color-text)] bg-[var(--color-surface)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            placeholder="Paste YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                generateNotes();
              }
            }}
          />
          <ActionButton
            onClick={generateNotes}
            disabled={loading || !url.trim()}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<SparklesIcon className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Generate Notes
          </ActionButton>
        </Stack>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="w-8 h-8 text-[var(--color-primary)]" />
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
  
  if (youtubeNotes.length === 0) {
    return null;
  }
  
  return (
    <div className="pt-8 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          Previous Transcripts
        </h2>
        <Link
          href="/notes?filter=youtube"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          View all →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {youtubeNotes.slice(0, 6).map((note) => (
          <YouTubeNoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

// YouTube Note Card Component
function YouTubeNoteCard({ note }: { note: Note }) {
  const videoId = note.youtubeUrl ? extractVideoIdFromUrl(note.youtubeUrl) : null;
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all"
    >
      {/* Thumbnail */}
      {thumbnail && (
        <div className="relative aspect-video bg-black">
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
          {/* Section count badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
            {note.sections.length} sections
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-[var(--color-text)] line-clamp-2 mb-2">
          {note.title}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {formatDate(note.createdAt)}
          </span>
          <span>•</span>
          <span>{note.sections.reduce((acc, s) => acc + s.bullets.length, 0)} points</span>
        </div>
        
        {/* Actions */}
        <div className="mt-3 flex gap-2">
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
