"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NoteList } from "../../../components/notes";
import { EmptyStateIllustration } from "../../../components/illustrations";
import { AISpotlight } from "../../../components/AISpotlight";
import { notesApi, Note as ApiNote } from "../../../lib/api";

// Transform API note to card format
function toCardNote(note: ApiNote) {
  return {
    id: note.id,
    title: note.title,
    preview: note.content || note.sections[0]?.summary || "No content",
    color: note.color || "#F5A623",
    tags: note.tags,
    date: formatDate(note.updatedAt),
    isFavorite: note.isFavorite,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSpotlightOpen, setAiSpotlightOpen] = useState(false);

  // Fetch recent notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        const data = await notesApi.list();
        setNotes(data.slice(0, 6)); // Show only 6 recent notes
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await notesApi.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const { isFavorite } = await notesApi.toggleFavorite(id);
      setNotes(notes.map((n) => (n.id === id ? { ...n, isFavorite } : n)));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const cardNotes = notes.map(toCardNote);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Hero Section with Wave Art */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 p-6 sm:p-8 rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)" }}
      >
        {/* Layered waves background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg 
            viewBox="0 0 1200 300" 
            className="absolute bottom-0 left-0 w-full h-auto"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                <stop offset="50%" stopColor="var(--color-secondary)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" />
                <stop offset="50%" stopColor="var(--color-secondary)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.06" />
              </linearGradient>
            </defs>
            {/* Back wave - subtle */}
            <path 
              d="M0,180 C200,120 400,200 600,150 C800,100 1000,180 1200,140 L1200,300 L0,300 Z" 
              fill="url(#wave3)"
            />
            {/* Middle wave */}
            <path 
              d="M0,200 C150,160 350,220 550,180 C750,140 950,200 1200,170 L1200,300 L0,300 Z" 
              fill="url(#wave2)"
            />
            {/* Front wave - most visible */}
            <path 
              d="M0,230 C200,190 400,250 600,210 C800,170 1000,230 1200,200 L1200,300 L0,300 Z" 
              fill="url(#wave1)"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            {getGreeting()}! 👋
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-md">
            Capture ideas, transform videos into notes, and let AI help you organize your thoughts.
          </p>
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
        <ActionCardButton
          onClick={() => setAiSpotlightOpen(true)}
          icon={<SparkleIcon />}
          title="AI Generate"
          description="Create with AI"
          color="purple"
        />
        <ActionCard
          href="/notes"
          icon={<FolderIcon />}
          title="Browse All"
          description={loading ? "Loading..." : `${notes.length} notes`}
          color="green"
        />
      </motion.div>

      {/* AI Spotlight */}
      <AISpotlight
        isOpen={aiSpotlightOpen}
        onClose={() => setAiSpotlightOpen(false)}
        onSubmit={(prompt) => {
          // Navigate to new note with AI prompt
          router.push(`/notes/new?prompt=${encodeURIComponent(prompt)}`);
        }}
      />

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

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
          </div>
        ) : cardNotes.length > 0 ? (
          <NoteList
            notes={cardNotes}
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

// Button variant for actions that don't navigate
function ActionCardButton({
  onClick,
  icon,
  title,
  description,
  color,
}: {
  onClick: () => void;
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
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-5 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm transition-all cursor-pointer group overflow-hidden text-left w-full`}
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
    </motion.button>
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
