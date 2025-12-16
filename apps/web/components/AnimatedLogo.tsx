"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type AnimatedLogoProps = {
  className?: string;
};

// Animated hero logo for landing page
export function AnimatedLogo({ className }: AnimatedLogoProps) {
  const noteLetters = ["N", "o", "t", "e"];
  const lyLetters = ["l", "y"];

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* Animated Note/Paper Vector */}
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
          {/* Paper/Note shape */}
          <motion.path
            d="M12 8h40l16 16v48a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z"
            className="fill-[var(--color-text)]"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          
          {/* Folded corner */}
          <motion.path
            d="M52 8v12a4 4 0 004 4h12"
            className="fill-[var(--color-text-muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          />
          
          {/* Lines on paper */}
          <motion.g
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <rect x="16" y="36" width="32" height="3" rx="1.5" className="fill-[var(--color-bg)]" opacity="0.6" />
            <rect x="16" y="46" width="40" height="3" rx="1.5" className="fill-[var(--color-bg)]" opacity="0.6" />
            <rect x="16" y="56" width="28" height="3" rx="1.5" className="fill-[var(--color-bg)]" opacity="0.6" />
          </motion.g>
          
          {/* Pen/pencil coming out */}
          <motion.g
            initial={{ x: 20, y: 20, opacity: 0, rotate: 45 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
          >
            <rect x="54" y="50" width="4" height="24" rx="1" className="fill-[var(--color-primary)]" transform="rotate(-45 56 62)" />
            <path d="M42 74l4-8 4 4-8 4z" className="fill-[var(--color-primary-dark)]" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Text: "Note" flowing out, then "ly" with fluid animation */}
      <div className="flex items-baseline">
        {/* "Note" - fade in from right to left */}
        <span
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--color-text)] inline-flex"
          style={{
            fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
            letterSpacing: "-0.03em",
          }}
        >
          {noteLetters.map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.8 + (noteLetters.length - 1 - i) * 0.1, // Right to left
                ease: "easeOut",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </span>

        {/* "ly" - fluid wave animation */}
        <span
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--color-primary)] inline-flex"
          style={{
            fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
            letterSpacing: "-0.03em",
          }}
        >
          {lyLetters.map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block origin-bottom"
              initial={{ opacity: 0, scaleY: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                scaleY: 1, 
                y: [20, -8, 4, -2, 0], // Fluid bounce
              }}
              transition={{
                duration: 0.8,
                delay: 1.4 + i * 0.15,
                ease: "easeOut",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      </div>
    </div>
  );
}

