import { cn } from "../lib/utils";
import { motion, MotionProps } from "framer-motion";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle";
  interactive?: boolean;
} & Omit<MotionProps, "children">;

const variantClasses = {
  default: "glass",
  elevated: "glass glass-elevated",
  subtle: "glass glass-subtle",
};

/**
 * GlassCard - Glassmorphic card component with backdrop blur
 * Supports light/dark modes and different elevation levels
 */
export function GlassCard({
  children,
  className,
  variant = "default",
  interactive = false,
  ...motionProps
}: GlassCardProps) {
  const baseClasses = cn(
    "rounded-xl",
    variantClasses[variant],
    interactive && "cursor-pointer transition-all duration-200",
    interactive && "hover:scale-[1.01] hover:shadow-lg",
    className
  );

  if (Object.keys(motionProps).length > 0) {
    return (
      <motion.div className={baseClasses} {...motionProps}>
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

