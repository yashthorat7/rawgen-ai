export function LoadingStrip() {
  return (
    <div className="mt-5 mb-5">
      <div className="relative z-[3] w-full">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </div>
    </div>
  );
} 