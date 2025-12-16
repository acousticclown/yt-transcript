"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  href?: string;
  className?: string;
  animate?: boolean;
};

const letters = ["N", "o", "t", "e", "l", "y"];

// App name: "Notely" - Simple, memorable, note-focused
export function Logo({ size = "md", showIcon = true, href = "/dashboard", className, animate = true }: LogoProps) {
  const sizes = {
    sm: { text: "text-lg", icon: "w-6 h-6", gap: "gap-1.5" },
    md: { text: "text-xl", icon: "w-7 h-7", gap: "gap-2" },
    lg: { text: "text-2xl", icon: "w-9 h-9", gap: "gap-2.5" },
  };

  const content = (
    <div className={cn("flex items-center", sizes[size].gap, className)}>
      {showIcon && (
        <motion.div 
          className={cn("relative", sizes[size].icon)}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.div>
      )}
      
      {/* Animated letters */}
      <span
        className={cn(
          sizes[size].text,
          "font-bold tracking-tight text-[var(--color-text)]",
          "select-none inline-flex"
        )}
        style={{
          fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="inline-block"
            animate={animate ? {
              y: [0, -2, 0],
            } : undefined}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.1,
              y: -3,
              transition: { duration: 0.15 }
            }}
          >
            {letter}
          </motion.span>
        ))}
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

