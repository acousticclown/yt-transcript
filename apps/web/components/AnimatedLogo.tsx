"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { cn } from "../lib/utils";

type AnimatedLogoProps = {
  className?: string;
};

// Sophisticated animated hero logo for landing page
export function AnimatedLogo({ className }: AnimatedLogoProps) {
  const noteLetters = ["N", "o", "t", "e"];
  const yLetter = "y";
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  // Spring configurations for fluid motion
  const springConfig = {
    type: "spring",
    stiffness: 100,
    damping: 15,
    mass: 1,
  };

  const letterSpring = {
    type: "spring",
    stiffness: 200,
    damping: 20,
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      {/* Main container with staggered children */}
      <div className="flex items-center gap-5 sm:gap-6">
        {/* Animated Note/Paper Vector - More sophisticated */}
        <motion.div
          className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{
            ...springConfig,
            delay: 0.1,
          }}
        >
          <motion.svg 
            viewBox="0 0 64 64" 
            fill="none" 
            className="w-full h-full"
            initial={{ filter: "blur(10px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Shadow/depth layer */}
            <motion.rect
              x="8" y="8" width="48" height="52" rx="6"
              className="fill-[var(--color-text)]"
              opacity="0.1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 8, opacity: 0.1 }}
              transition={{ ...springConfig, delay: 0.3 }}
            />
            
            {/* Main paper shape */}
            <motion.path
              d="M8 6C8 3.79086 9.79086 2 12 2H40L56 18V58C56 60.2091 54.2091 62 52 62H12C9.79086 62 8 60.2091 8 58V6Z"
              className="fill-[var(--color-text)]"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            />
            
            {/* Folded corner with 3D effect */}
            <motion.path
              d="M40 2V14C40 16.2091 41.7909 18 44 18H56L40 2Z"
              className="fill-[var(--color-bg)]"
              opacity="0.3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ ...springConfig, delay: 0.8 }}
            />
            
            {/* Animated lines - staggered reveal */}
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={i}
                x="16"
                y={28 + i * 10}
                width={[28, 36, 24][i]}
                height="3"
                rx="1.5"
                fill="var(--color-primary)"
                stroke="white"
                strokeWidth="1"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.85 }}
                transition={{
                  ...springConfig,
                  delay: 1 + i * 0.15,
                }}
                style={{ originX: 0 }}
              />
            ))}
            
            {/* Sparkle/magic dot */}
            <motion.circle
              cx="50"
              cy="8"
              r="3"
              className="fill-[var(--color-primary)]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0.8],
              }}
              transition={{
                duration: 0.6,
                delay: 1.5,
                ease: "easeOut",
              }}
            />
          </motion.svg>
        </motion.div>

        {/* Text container */}
        <div className="flex items-baseline overflow-hidden">
          {/* "Note" - Morphing reveal */}
          <div className="flex">
            {noteLetters.map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--color-text)]"
                style={{
                  fontFamily: "var(--font-outfit), system-ui, sans-serif",
                  letterSpacing: "-0.03em",
                }}
                initial={{ 
                  opacity: 0, 
                  y: 60,
                  rotateX: -90,
                  filter: "blur(8px)",
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  filter: "blur(0px)",
                }}
                transition={{
                  ...letterSpring,
                  delay: 0.5 + i * 0.08,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* AI thinking dots transform into "ly" - repeats 3 times */}
          <div className="flex items-end relative ml-3 sm:ml-4">
            {/* Three bouncing dots - small, bottom aligned */}
            <div className="flex items-end gap-0.5 absolute bottom-0 left-1/2 -translate-x-1/2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--color-primary)]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
                    scale: [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
                    y: [0, 0, -8, 0, -8, 0, 0, 0, 0, -8, 0, -8, 0, 0, 0, 0, -8, 0, -8, 0, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    delay: 1.0 + i * 0.1,
                    times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.33, 0.38, 0.43, 0.48, 0.53, 0.58, 0.63, 0.66, 0.71, 0.76, 0.81, 0.86, 0.91, 1],
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* "ly" letters - appear after each dot cycle */}
            <motion.span
              className="inline-block text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--color-primary)]"
              style={{
                fontFamily: "var(--font-outfit), system-ui, sans-serif",
                letterSpacing: "-0.03em",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
                scale: [0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 1],
              }}
              transition={{
                duration: 4.5,
                delay: 1.0,
                times: [0, 0.25, 0.28, 0.32, 0.33, 0.58, 0.61, 0.64, 0.68, 0.69, 0.91, 0.94, 0.97, 1],
                ease: "easeOut",
              }}
            >
              ly
            </motion.span>
          </div>
        </div>
      </div>

      {/* Tagline with fade up */}
      <motion.p
        className="text-base sm:text-lg text-[var(--color-text-muted)] font-medium tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          ...springConfig,
          delay: 1.8,
        }}
      >
        Smart notes, effortlessly
      </motion.p>
    </div>
  );
}

