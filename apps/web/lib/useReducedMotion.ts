"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has prefers-reduced-motion enabled
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if media query is supported
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation config that respects reduced motion preference
 */
export function getAnimationConfig(reducedMotion: boolean) {
  return {
    duration: reducedMotion ? 0.01 : 0.2,
    ease: "easeOut" as const,
  };
}

/**
 * Get transition config that respects reduced motion preference
 */
export function getTransitionConfig(reducedMotion: boolean) {
  return {
    duration: reducedMotion ? 0.01 : 0.15,
    ease: "easeOut" as const,
  };
}

