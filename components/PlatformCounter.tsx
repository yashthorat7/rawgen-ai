"use client";

import { usePlatforms } from "@/lib/PlatformContext";

export function PlatformCounter() {
  const { platforms } = usePlatforms();

  const platformCounts = platforms.reduce((acc, { platform }) => {
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(platformCounts).map(([platform, count]) => (
        <div
          key={platform}
          className="px-3 py-1 bg-primary-500 rounded-md text-sm font-medium text-white flex items-center gap-1"
        >
          {platform}
          {count > 1 && (
            <span className="bg-white text-primary-500 px-1.5 rounded-md text-xs">
              {count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
} 