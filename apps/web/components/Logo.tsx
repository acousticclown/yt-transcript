"use client";

import Link from "next/link";
import { cn } from "../lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  href?: string;
  className?: string;
};

export function Logo({ size = "md", showIcon = true, href = "/dashboard", className }: LogoProps) {
  const sizes = {
    sm: { text: "text-lg", icon: "w-6 h-6" },
    md: { text: "text-xl", icon: "w-8 h-8" },
    lg: { text: "text-3xl", icon: "w-10 h-10" },
  };

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className={cn("relative", sizes[size].icon)}>
          {/* Abstract logo mark - layered shapes */}
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            {/* Background circle with gradient */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="logoShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Main shape - rounded square */}
            <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#logoGradient)" />
            
            {/* Shine overlay */}
            <rect x="4" y="4" width="32" height="16" rx="10" fill="url(#logoShine)" />
            
            {/* Abstract "N" mark */}
            <path
              d="M12 28V14L20 22V14M20 28V22L28 14V28"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            
            {/* Sparkle dot */}
            <circle cx="30" cy="10" r="2" fill="white" opacity="0.8" />
          </svg>
        </div>
      )}
      
      {/* Text with gradient clip */}
      <span
        className={cn(
          sizes[size].text,
          "font-black tracking-tight",
          "bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-indigo-500",
          "bg-clip-text text-transparent",
          "select-none"
        )}
        style={{
          fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
          letterSpacing: "-0.03em",
        }}
      >
        Notes
        <span className="opacity-80">AI</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

