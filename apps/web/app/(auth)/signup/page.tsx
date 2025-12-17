"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "../../../components/Logo";
import { useUser } from "../../../lib/UserContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(emailValue: string) {
    if (!emailValue) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }

  function validatePassword(passwordValue: string) {
    if (!passwordValue) {
      setPasswordError("");
      return;
    }
    if (passwordValue.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password, name);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="mt-2 text-[var(--color-text-muted)]">Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              required
              className={`w-full px-4 py-2.5 bg-[var(--color-bg)] border rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 transition-all ${
                emailError
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
              }`}
              placeholder="you@example.com"
            />
            {emailError && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              required
              minLength={6}
              className={`w-full px-4 py-2.5 bg-[var(--color-bg)] border rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
              }`}
              placeholder="••••••••"
            />
            {passwordError ? (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">At least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
