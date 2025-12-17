"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemePicker } from "../../../components/ThemePicker";
import { useUser } from "../../../lib/UserContext";
import { CheckIcon, SparklesIcon } from "../../../components/Icons";

export default function SettingsPage() {
  const { user } = useUser();
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Check if user has a key
    if (user?.hasGeminiKey) {
      setHasKey(true);
    }
  }, [user]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/auth/gemini-key", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save API key" });
      } else {
        setMessage({ type: "success", text: "API key connected successfully!" });
        setHasKey(true);
        setApiKey("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to connect. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/auth/gemini-key", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMessage({ type: "success", text: "API key removed" });
        setHasKey(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to remove key" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Gemini API Connection */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">Gemini AI</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {hasKey ? "Connected" : "Connect your own API key"}
                </p>
              </div>
              {hasKey && (
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Connected
                </div>
              )}
            </div>

            {hasKey ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Your Gemini API key is connected. AI features will use your key for requests.
                </p>
                <button
                  onClick={handleRemoveKey}
                  disabled={saving}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  {saving ? "Removing..." : "Disconnect API key"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Connect your own Gemini API key for unlimited AI features. 
                  Get a free key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Google AI Studio
                  </a>
                  .
                </p>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your API key here"
                    className="flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={saving || !apiKey.trim()}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Connecting..." : "Connect"}
                  </button>
                </div>

                <p className="text-xs text-[var(--color-text-subtle)]">
                  Your API key is stored securely and only used for your requests.
                </p>
              </div>
            )}

            {message && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 text-sm ${
                  message.type === "success" ? "text-green-600" : "text-red-500"
                }`}
              >
                {message.text}
              </motion.p>
            )}
          </div>

          {/* Theme */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text)]">Theme</p>
                <p className="text-xs text-[var(--color-text-muted)]">Choose from 8 beautiful themes</p>
              </div>
              <ThemePicker />
            </div>
          </div>

          {/* Account */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || "User"}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || "user@example.com"}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-red-200 dark:border-red-900/30 p-5">
            <h2 className="font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
            <button className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
