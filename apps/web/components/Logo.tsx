"use client";

import Link from "next/link";
import { cn } from "../lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  href?: string;
  className?: string;
};

// App name: "Notely" - Simple, memorable, note-focused
export function Logo({ size = "md", showIcon = true, href = "/dashboard", className }: LogoProps) {
  const sizes = {
    sm: { text: "text-lg", icon: "w-6 h-6", gap: "gap-1.5" },
    md: { text: "text-xl", icon: "w-7 h-7", gap: "gap-2" },
    lg: { text: "text-2xl", icon: "w-9 h-9", gap: "gap-2.5" },
  };

  const content = (
    <div className={cn("flex items-center", sizes[size].gap, className)}>
      {showIcon && (
        <div className={cn("relative", sizes[size].icon)}>
          {/* Sophisticated monochrome logo mark */}
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            {/* Outer rounded square */}
            <rect 
              x="2" y="2" width="28" height="28" rx="8" 
              className="fill-[var(--color-text)]"
            />
            
            {/* Inner pen/note shape - negative space */}
            <path
              d="M10 22V12L16 18L22 12V22"
              className="stroke-[var(--color-bg)]"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            
            {/* Dot accent */}
            <circle cx="16" cy="9" r="1.5" className="fill-[var(--color-bg)]" />
          </svg>
        </div>
      )}
      
      {/* Simple text */}
      <span
        className={cn(
          sizes[size].text,
          "font-bold tracking-tight text-[var(--color-text)]",
          "select-none"
        )}
        style={{
          fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        Notely
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

