"use client";

import { cn } from "../lib/utils";

type ButtonGroupProps = {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
};

/**
 * ButtonGroup - Groups related buttons together
 * Provides consistent spacing and visual grouping
 */
export function ButtonGroup({
  children,
  className,
  orientation = "horizontal",
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}

