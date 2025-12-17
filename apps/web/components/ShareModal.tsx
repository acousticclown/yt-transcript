"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notesApi } from "../lib/api";
import { LockIcon, CopyIcon, CheckIcon } from "./Icons";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  note?: { isPublic?: boolean; shareToken?: string; shareExpiresAt?: string };
};

export function ShareModal({ isOpen, onClose, noteId, note }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if note is already shared
      if (note?.isPublic && note?.shareToken) {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        setShareUrl(`${baseUrl}/share/${note.shareToken}`);
        setIsPasswordProtected(false); // We don't store password in frontend, so assume not protected for existing shares
      } else {
        // Reset state when opening
        setShareUrl(null);
        setError("");
        setPassword("");
        setExpiresInDays(null);
        setIsPasswordProtected(false);
      }
      setCopied(false);
    }
  }, [isOpen, note]);

  async function handleShare() {
    setLoading(true);
    setError("");

    try {
      const result = await notesApi.share(noteId, {
        password: password.trim() || undefined,
        expiresInDays: expiresInDays || undefined,
      });

      setShareUrl(result.shareUrl);
      setIsPasswordProtected(result.isPasswordProtected);
    } catch (err: any) {
      setError(err.message || "Failed to share note");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnshare() {
    setLoading(true);
    try {
      await notesApi.unshare(noteId);
      setShareUrl(null);
      setIsPasswordProtected(false);
    } catch (err: any) {
      setError(err.message || "Failed to unshare note");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl max-w-md w-full p-6"
        >
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
            Share Note
          </h2>

          {!shareUrl ? (
            <div className="space-y-4">
              {/* Password Protection */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Password Protection (Optional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Leave empty for public access"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Expires In (Optional)
                </label>
                <select
                  value={expiresInDays || ""}
                  onChange={(e) =>
                    setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Never</option>
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Sharing..." : "Generate Link"}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isPasswordProtected && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  This note is password protected
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUnshare}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Unsharing..." : "Stop Sharing"}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

