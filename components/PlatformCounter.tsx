"use client";

export function PlatformCounter() {
  // TODO: Replace with actual data from your backend
  const visits = 128;  // Example value
  const stars = 45;    // Example value

  return (
    <div className="flex flex-wrap gap-2 mt-4 sm:mt-2">
      <div className="px-3 py-1 bg-primary-500 rounded-md text-sm font-medium text-white flex items-center gap-1">
        Profile Visits
        <span className="bg-white text-primary-500 px-1.5 rounded-md text-xs">
          {visits}
        </span>
      </div>
      <div className="px-3 py-1 bg-primary-500 rounded-md text-sm font-medium text-white flex items-center gap-1">
        Stars ⭐
        <span className="bg-white text-primary-500 px-1.5 rounded-md text-xs">
          {stars}
        </span>
      </div>
    </div>
  );
} 