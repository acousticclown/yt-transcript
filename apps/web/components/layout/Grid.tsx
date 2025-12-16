import { cn } from "../../lib/utils";

type GridProps = {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    sm?: 1 | 2 | 3;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
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

const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

/**
 * Grid component for responsive grid layouts
 * Mobile-first: 1 column on mobile by default
 */
export function Grid({
  children,
  className,
  cols = { mobile: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
}: GridProps) {
  const mobileCols = cols.mobile ?? 1;
  const smCols = cols.sm ?? mobileCols;
  const mdCols = cols.md ?? smCols;
  const lgCols = cols.lg ?? mdCols;

  return (
    <div
      className={cn(
        "grid",
        colClasses[mobileCols],
        smCols !== mobileCols && `sm:${colClasses[smCols]}`,
        mdCols !== smCols && `md:${colClasses[mdCols]}`,
        lgCols !== mdCols && `lg:${colClasses[lgCols]}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

