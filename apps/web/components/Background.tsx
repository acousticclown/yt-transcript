"use client";

import { useTheme } from "../app/components/ThemeProvider";
import { cn } from "../lib/utils";

type BackgroundProps = {
  children: React.ReactNode;
  pattern?: "dots" | "grid" | "gradient" | "none";
  className?: string;
};

/**
 * Background component with subtle patterns and gradients
 * Supports different visual styles that work with glassmorphism
 */
export function Background({
  children,
  pattern = "gradient",
  className,
}: BackgroundProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const patternClasses = {
    dots: isDark
      ? "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]"
      : "bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.05)_1px,transparent_0)] [background-size:24px_24px]",
    grid: isDark
      ? "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:32px_32px]"
      : "bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] [background-size:32px_32px]",
    gradient: isDark
      ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      : "bg-gradient-to-br from-indigo-50 via-white to-purple-50",
    none: "",
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full",
        patternClasses[pattern],
        className
      )}
    >
      {children}
    </div>
  );
}

