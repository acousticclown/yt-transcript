import { cn } from "../../lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: boolean;
};

const sizeClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

/**
 * Container component for consistent max-width and padding
 * Mobile-first: Full width on mobile, constrained on larger screens
 */
export function Container({
  children,
  className,
  size = "xl",
  padding = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        sizeClasses[size],
        padding && "px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

