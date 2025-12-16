"use client";

import { cn } from "../../lib/utils";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div
      className={cn(
        "rounded-full border-[var(--color-primary)] border-t-transparent animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-[var(--color-text-muted)] text-sm">{message}</p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-12 rounded-full bg-[var(--color-border)]" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-[var(--color-border)] rounded w-3/4" />
          <div className="h-4 bg-[var(--color-border)] rounded w-full" />
          <div className="h-4 bg-[var(--color-border)] rounded w-2/3" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 bg-[var(--color-border)] rounded-full" />
        <div className="h-5 w-12 bg-[var(--color-border)] rounded-full" />
      </div>
    </div>
  );
}

