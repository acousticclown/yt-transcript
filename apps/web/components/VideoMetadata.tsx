"use client";

import { cn } from "../lib/utils";

type VideoMetadataProps = {
  thumbnailUrl?: string;
  duration?: number; // in seconds
  generatedAt?: Date | null;
  className?: string;
};

/**
 * Format duration in seconds to human-readable format (e.g., "5:23" or "1:23:45")
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format date to relative time (e.g., "2 minutes ago", "1 hour ago")
 */
function formatRelativeTime(date: Date): string {
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
 * VideoMetadata - Display video thumbnail, duration, and generation timestamp
 */
export function VideoMetadata({
  thumbnailUrl,
  duration,
  generatedAt,
  className,
}: VideoMetadataProps) {
  if (!thumbnailUrl && !duration && !generatedAt) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="relative flex-shrink-0">
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            onError={(e) => {
              // Fallback to default thumbnail if maxresdefault fails
              const target = e.target as HTMLImageElement;
              if (target.src.includes("maxresdefault")) {
                target.src = target.src.replace("maxresdefault", "hqdefault");
              }
            }}
          />
          {/* Duration overlay */}
          {duration !== undefined && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-xs font-medium">
              {formatDuration(duration)}
            </div>
          )}
        </div>
      )}

      {/* Metadata text */}
      <div className="flex flex-col gap-0.5 min-w-0">
        {duration !== undefined && !thumbnailUrl && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Duration:</span> {formatDuration(duration)}
          </div>
        )}
        {generatedAt && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Generated {formatRelativeTime(generatedAt)}
          </div>
        )}
      </div>
    </div>
  );
}

