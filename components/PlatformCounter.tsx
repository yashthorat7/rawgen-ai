"use client";

export function PlatformCounter() {
  // TODO: Replace with actual data from your backend
  const visits = 128;  // Example value
  const stars = 45;    // Example value

  return (
    <div className="flex flex-wrap gap-3 mt-4 sm:mt-2">
      <div className="px-1 pl-2 py-1 bg-primary-500 rounded-md text-[15px] font-medium text-white flex items-center gap-2">
        Profile Visits
        <span className="bg-white text-primary-700 px-2 py-0.2 rounded-sm font-semibold">
          {visits}
        </span>
      </div>
      <div className="px-1 pl-2 py-1 bg-primary-500 rounded-md text-[15px] font-medium text-white flex items-center gap-2">
        Stars ⭐
        <span className="bg-white text-primary-700 px-2 py-0.2 rounded-sm font-semibold">
          {stars}
        </span>
      </div>
    </div>
  );
} 