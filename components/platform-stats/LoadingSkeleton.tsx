export function LoadingSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Rank at top */}
        <div className="flex items-center gap-1 mb-4">
          <div className="h-3.5 w-3.5 bg-gray-200 rounded" /> {/* Star icon */}
          <div className="h-4 bg-gray-200 rounded w-24" /> {/* Rank text */}
        </div>
        
        {/* Progress bars section */}
        <div className="space-y-3">
          {/* Contribution */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-8" />
            </div>
            <div className="h-2 bg-gray-200 rounded-full w-full" />
          </div>

          {/* Friend of */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-8" />
            </div>
            <div className="h-2 bg-gray-200 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-auto mb-1">
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
} 