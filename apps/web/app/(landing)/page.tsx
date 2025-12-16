"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "../../components/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo size="md" href="/" />
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight">
              Your ideas,{" "}
              <span className="text-[var(--color-primary)]">powered by AI</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Transform YouTube videos into smart notes. Organize your thoughts with AI assistance. 
              A beautiful, personal notes app built for the way you think.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/20"
              >
                Start for free
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-[var(--color-surface)] text-[var(--color-text)] rounded-xl font-semibold text-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
              >
                View Demo
              </Link>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon="🎬"
              title="YouTube to Notes"
              description="Paste any YouTube link and get structured, editable notes in seconds."
            />
            <FeatureCard
              icon="✨"
              title="AI-Powered"
              description="Summarize, expand, simplify, or translate your notes with one click."
            />
            <FeatureCard
              icon="🏷️"
              title="Smart Organization"
              description="Auto-categorize and tag your notes. Find anything instantly."
            />
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24"
          >
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-8 bg-[var(--color-bg-alt)] min-h-[300px] flex items-center justify-center text-[var(--color-text-muted)]">
                <p>App preview coming soon...</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-[var(--color-text-muted)]">
          Built with ❤️ for note-takers everywhere
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
      <span className="text-3xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}

