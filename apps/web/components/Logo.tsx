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
          {/* Paper/Note icon - matches AnimatedLogo */}
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            {/* Main paper shape */}
            <path
              d="M8 6C8 3.79086 9.79086 2 12 2H40L56 18V58C56 60.2091 54.2091 62 52 62H12C9.79086 62 8 60.2091 8 58V6Z"
              className="fill-[var(--color-text)]"
            />
            
            {/* Folded corner */}
            <path
              d="M40 2V14C40 16.2091 41.7909 18 44 18H56L40 2Z"
              className="fill-[var(--color-bg)]"
              opacity="0.3"
            />
            
            {/* Lines on paper - primary color with white outline */}
            <rect x="16" y="28" width="28" height="3" rx="1.5" fill="var(--color-primary)" stroke="white" strokeWidth="0.5" />
            <rect x="16" y="38" width="36" height="3" rx="1.5" fill="var(--color-primary)" stroke="white" strokeWidth="0.5" />
            <rect x="16" y="48" width="24" height="3" rx="1.5" fill="var(--color-primary)" stroke="white" strokeWidth="0.5" />
            
            {/* Accent dot */}
            <circle cx="50" cy="8" r="3" className="fill-[var(--color-primary)]" />
          </svg>
        </div>
      )}
      
      {/* Text with subtle accent */}
      <span
        className={cn(
          sizes[size].text,
          "font-bold tracking-tight select-none"
        )}
        style={{
          fontFamily: "var(--font-outfit), system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        <span className="text-[var(--color-text)]">Note</span>
        <span className="text-[var(--color-primary)]">ly</span>
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

