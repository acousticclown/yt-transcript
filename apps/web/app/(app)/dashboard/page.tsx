"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { NoteList, Note } from "../../../components/notes";
import { EmptyStateIllustration } from "../../../components/illustrations";

// Mock data for demo
const initialNotes: Note[] = [
  { id: "1", title: "React Best Practices", preview: "Key patterns for building scalable React apps...", color: "#F5A623", tags: ["react", "development"], date: "2 hours ago", isFavorite: true },
  { id: "2", title: "Machine Learning Basics", preview: "Introduction to neural networks and deep learning...", color: "#4A7C59", tags: ["ml", "ai"], date: "Yesterday" },
  { id: "3", title: "Product Design Notes", preview: "User-centered design principles and methodologies...", color: "#6366f1", tags: ["design", "ux"], date: "3 days ago" },
];

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Hero Section with Abstract Wave Art */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 p-6 sm:p-8 bg-gradient-to-br from-[var(--color-primary)]/8 via-[var(--color-secondary)]/5 to-[var(--color-bg)] rounded-3xl overflow-hidden"
      >
        {/* Abstract wave background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 800 400" className="absolute -right-20 -top-20 w-[140%] h-[140%] opacity-[0.15]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="50%" stopColor="var(--color-secondary)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-secondary)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
            {/* Flowing wave 1 */}
            <path 
              d="M0,200 Q150,100 300,180 T600,160 T900,200 L900,400 L0,400 Z" 
              fill="url(#waveGrad1)" 
              opacity="0.6"
            />
            {/* Flowing wave 2 */}
            <path 
              d="M0,250 Q200,150 400,220 T800,180 L800,400 L0,400 Z" 
              fill="url(#waveGrad2)" 
              opacity="0.4"
            />
            {/* Accent circles */}
            <circle cx="650" cy="100" r="60" fill="var(--color-primary)" opacity="0.3" />
            <circle cx="720" cy="150" r="30" fill="var(--color-secondary)" opacity="0.4" />
            <circle cx="580" cy="80" r="20" fill="var(--color-primary)" opacity="0.2" />
          </svg>
          
          {/* Floating dots pattern */}
          <svg viewBox="0 0 100 100" className="absolute right-8 top-8 w-32 h-32 opacity-20">
            <circle cx="20" cy="20" r="3" fill="var(--color-primary)" />
            <circle cx="50" cy="15" r="2" fill="var(--color-secondary)" />
            <circle cx="80" cy="25" r="4" fill="var(--color-primary)" />
            <circle cx="30" cy="50" r="2" fill="var(--color-secondary)" />
            <circle cx="70" cy="55" r="3" fill="var(--color-primary)" />
            <circle cx="15" cy="80" r="2" fill="var(--color-primary)" />
            <circle cx="55" cy="75" r="3" fill="var(--color-secondary)" />
            <circle cx="85" cy="70" r="2" fill="var(--color-primary)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
              {getGreeting()}! 👋
            </h1>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Capture ideas, transform videos into notes, and let AI help you organize your thoughts.
            </p>
          </div>
          
          {/* Abstract shape accent */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon 
                  points="50,5 95,30 95,70 50,95 5,70 5,30" 
                  fill="none" 
                  stroke="var(--color-primary)" 
                  strokeWidth="2" 
                  opacity="0.5"
                />
                <polygon 
                  points="50,20 80,35 80,65 50,80 20,65 20,35" 
                  fill="var(--color-primary)" 
                  opacity="0.15"
                />
              </svg>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="var(--color-secondary)" opacity="0.2" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.4" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Primary Actions - Modern Card Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        <ActionCard
          href="/notes/new"
          icon={<PenIcon />}
          title="New Note"
          description="Start writing"
          color="primary"
        />
        <ActionCard
          href="/youtube"
          icon={<YouTubeIcon />}
          title="From YouTube"
          description="Import video"
          color="red"
        />
        <ActionCard
          href="/notes/new?ai=true"
          icon={<SparkleIcon />}
          title="AI Generate"
          description="Create with AI"
          color="purple"
        />
        <ActionCard
          href="/notes"
          icon={<FolderIcon />}
          title="Browse All"
          description={`${notes.length} notes`}
          color="green"
        />
      </motion.div>

      {/* Recent Notes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Notes</h2>
          <Link href="/notes" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {notes.length > 0 ? (
          <NoteList
            notes={notes}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </div>
  );
}

// Modern Action Card with icon and gradient
function ActionCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "red" | "purple" | "green";
}) {
  const colorClasses = {
    primary: "from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 hover:from-[var(--color-primary)]/30 border-[var(--color-primary)]/20",
    red: "from-red-500/20 to-red-500/5 hover:from-red-500/30 border-red-500/20",
    purple: "from-purple-500/20 to-purple-500/5 hover:from-purple-500/30 border-purple-500/20",
    green: "from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/5 hover:from-[var(--color-secondary)]/30 border-[var(--color-secondary)]/20",
  };

  const iconColors = {
    primary: "text-[var(--color-primary)]",
    red: "text-red-500",
    purple: "text-purple-500",
    green: "text-[var(--color-secondary)]",
  };

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative p-5 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm transition-all cursor-pointer group overflow-hidden`}
      >
        {/* Background glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${
            color === "primary" ? "bg-[var(--color-primary)]" :
            color === "red" ? "bg-red-500" :
            color === "purple" ? "bg-purple-500" :
            "bg-[var(--color-secondary)]"
          } opacity-20`} />
        </div>

        <div className="relative z-10">
          <div className={`w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center mb-3 ${iconColors[color]}`}>
            {icon}
          </div>
          <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

// SVG Icons
function PenIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)]">
      {/* Humaaans-style illustration */}
      <div className="flex justify-center mb-4">
        <EmptyStateIllustration className="w-48 h-48" />
      </div>
      
      <h3 className="text-xl font-semibold text-[var(--color-text)]">Start your journey</h3>
      <p className="mt-2 text-[var(--color-text-muted)] max-w-sm mx-auto">
        Create your first note or import from YouTube to get started
      </p>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/notes/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <PenIcon />
          Create Note
        </Link>
        <Link
          href="/youtube"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-medium border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          <YouTubeIcon />
          Import from YouTube
        </Link>
      </div>
    </div>
  );
}
