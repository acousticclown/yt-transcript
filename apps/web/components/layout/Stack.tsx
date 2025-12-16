import { cn } from "../../lib/utils";

type StackProps = {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col";
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  as?: keyof JSX.IntrinsicElements;
};

const gapClasses = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * Stack component for vertical or horizontal layouts
 * Mobile-first: Stacks vertically on mobile by default
 */
export function Stack({
  children,
  className,
  direction = "col",
  gap = 4,
  align = "stretch",
  justify = "start",
  wrap = false,
  as: Component = "div",
}: StackProps) {
  return (
    <Component
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </Component>
  );
}

