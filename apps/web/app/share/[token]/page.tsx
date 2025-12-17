"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { publicApi, Note as ApiNote } from "../../../lib/api";
import { NoteViewer } from "../../../components/notes/NoteViewer";
import { Logo } from "../../../components/Logo";
import { LockIcon } from "../../../components/Icons";

type SharedNote = ApiNote & {
  isPasswordProtected: boolean;
  author: {
    name: string;
    avatar?: string;
  };
};

export default function SharedNotePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        const data = await publicApi.getSharedNote(token);
        setNote(data);
        if (!data.isPasswordProtected) {
          setVerified(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [token]);

  async function handleVerifyPassword() {
    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    setVerifying(true);
    setPasswordError("");

    try {
      await publicApi.verifyPassword(token, password);
      setVerified(true);
    } catch (err: any) {
      setPasswordError(err.message || "Invalid password");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <LockIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Note Not Found
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            {error || "This note may have been removed or the link is invalid."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Password protection screen
  if (note.isPasswordProtected && !verified) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-4">
              <LockIcon className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              Protected Note
            </h1>
            <p className="text-[var(--color-text-muted)]">
              This note is password protected. Please enter the password to view it.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !verifying) {
                    handleVerifyPassword();
                  }
                }}
                className={`w-full px-4 py-2.5 bg-[var(--color-bg)] border rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 transition-all ${
                  passwordError
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
                }`}
                placeholder="Enter password"
                autoFocus
              />
              {passwordError && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              onClick={handleVerifyPassword}
              disabled={verifying || !password.trim()}
              className="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
            >
              {verifying ? "Verifying..." : "View Note"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Note view
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Shared by</p>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {note.author.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
            >
              Create your own →
            </button>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <NoteViewer
          note={{
            ...note,
            isFavorite: false, // Shared notes can't be favorited
          }}
        />
      </div>
    </div>
  );
}

