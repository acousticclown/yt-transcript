"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useNotes } from "../../../../lib/hooks";
import { Note } from "../../../../lib/api";
import {
  PlayIcon,
  ClockIcon,
  ArrowLeftIcon,
  NotesIcon,
} from "../../../../components/Icons";

// Format date
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Get YouTube thumbnail
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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
          {/* AI badge */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-medium flex items-center gap-1">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {note.sections.length > 0 ? "AI Enhanced" : "Transcript"}
          </div>
          {/* Section count badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
            {note.sections.length > 0 ? `${note.sections.length} sections` : "Raw"}
          </div>
        </div>
      )}

      {/* Content - flex-1 to fill remaining space */}
      <div className="flex-1 flex flex-col p-4">
        {/* Title - max 2 lines */}
        <h3 className="font-medium text-[var(--color-text)] line-clamp-2 h-12 mb-2">
          {note.title}
        </h3>

        {/* Meta info */}
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

export default function TranscriptsPage() {
  const { data: notes, isLoading } = useNotes();
  const youtubeNotes = notes?.filter((note) => note.source === "youtube") || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[var(--color-surface)] rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-[var(--color-surface)] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/youtube"
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            All Transcripts
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {youtubeNotes.length} YouTube video{youtubeNotes.length !== 1 ? "s" : ""} transcribed
          </p>
        </div>
      </div>

      {/* Grid */}
      {youtubeNotes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)]">No transcripts yet</p>
          <Link
            href="/youtube"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Transcribe a video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {youtubeNotes.map((note) => (
            <YouTubeNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

