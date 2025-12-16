"use client";

import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text)]">Theme</p>
                <p className="text-xs text-[var(--color-text-muted)]">Choose your preferred theme</p>
              </div>
              <select className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
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
                  defaultValue="User"
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text)] mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]"
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

