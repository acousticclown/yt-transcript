"use client";

import { cn } from "../lib/utils";

type SectionMetadataProps = {
  createdAt?: string; // ISO timestamp
  lastEditedAt?: string; // ISO timestamp
  className?: string;
};

/**
 * Format date to relative time (e.g., "2 minutes ago", "1 hour ago")
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  // For older dates, show actual date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * SectionMetadata - Display section creation and edit timestamps
 */
export function SectionMetadata({
  createdAt,
  lastEditedAt,
  className,
}: SectionMetadataProps) {
  const wasEdited = lastEditedAt && createdAt && lastEditedAt !== createdAt;

  if (!createdAt && !lastEditedAt) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500",
        className
      )}
      title={
        wasEdited && lastEditedAt
          ? `Created ${formatRelativeTime(createdAt)}, edited ${formatRelativeTime(lastEditedAt)}`
          : createdAt
          ? `Created ${formatRelativeTime(createdAt)}`
          : undefined
      }
    >
      {wasEdited && lastEditedAt ? (
        <>
          <span>Edited {formatRelativeTime(lastEditedAt)}</span>
        </>
      ) : createdAt ? (
        <span>Created {formatRelativeTime(createdAt)}</span>
      ) : null}
    </div>
  );
}

