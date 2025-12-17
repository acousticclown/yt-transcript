"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useNote } from "../../../../lib/hooks";
import { NoteSection } from "../../../../lib/api";
import {
  PlayIcon,
  ClockIcon,
  ArrowLeftIcon,
  PenIcon,
} from "../../../../components/Icons";

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Extract video ID from YouTube URL
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

  useEffect(() => {
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
          <h3 className="font-semibold text-[var(--color-text)] mb-1">
            {section.title}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2">
            {section.summary}
          </p>
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
      <div
        className="absolute inset-y-0 left-0 bg-[var(--color-primary)]/30"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />
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

export default function YouTubeViewerPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const { data: note, isLoading, error } = useNote(noteId);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);

  const videoId = note?.youtubeUrl ? extractVideoId(note.youtubeUrl) : null;

  const activeSection = note?.sections.findIndex((section, i, arr) => {
    const start = section.startTime ?? 0;
    const end = arr[i + 1]?.startTime ?? Infinity;
    return currentTime >= start && currentTime < end;
  });

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
  }, [note]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo?.();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[var(--color-text-muted)]">Note not found</p>
        <Link href="/notes" className="text-[var(--color-primary)]">
          ← Back to Notes
        </Link>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[var(--color-text-muted)]">No YouTube video associated with this note</p>
        <Link href={`/notes/${noteId}`} className="text-[var(--color-primary)]">
          ← Back to Note
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[var(--color-text)] truncate">
                {note.title}
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Interactive Video Mode
              </p>
            </div>
          </div>

          <Link
            href={`/notes/${noteId}`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
          >
            <PenIcon className="w-4 h-4" />
            View Note
          </Link>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
          {/* Video Panel */}
          <div className="lg:w-1/2 xl:w-3/5 flex-shrink-0 p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
            <YouTubePlayer
              videoId={videoId}
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
                sections={note.sections}
                currentTime={currentTime}
                duration={duration}
                onSeek={seekTo}
              />
            </div>

            {/* Video info & summary */}
            <div className="hidden lg:block space-y-2">
              <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <ClockIcon className="w-4 h-4" />
                {note.sections.length} sections •{" "}
                {note.sections.reduce((acc, s) => acc + s.bullets.length, 0)} key points
              </p>
              {/* Overall video summary */}
              {note.content && (
                <p className="text-xs text-[var(--color-text-subtle)] line-clamp-2">
                  {note.content}
                </p>
              )}
            </div>
          </div>

          {/* Sections Panel */}
          <div className="lg:w-1/2 xl:w-2/5 min-h-0 flex-1 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[var(--color-border)] p-4 sm:p-6">
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Sections ({note.sections.length})
              </h2>

              <div className="space-y-2">
                {note.sections.map((section, index) => (
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

