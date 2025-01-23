export function LoadingSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Top section - common for all platforms */}
        <div className="flex items-center gap-1 mb-4">
          <div className="h-3.5 w-3.5 bg-gray-200 rounded" /> {/* Icon placeholder */}
          <div className="h-4 bg-gray-200 rounded w-24" /> {/* Title placeholder */}
        </div>
        
        {/* Progress bars section */}
        <div className="space-y-3">
          {/* Two progress bars for all platforms */}
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-8" />
              </div>
              <div className="h-2 bg-gray-200 rounded-full w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-auto mb-1">
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}

// Add new skeleton for project cards
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video p-4 pb-1">
        <div className="w-full h-full bg-gray-200 rounded-lg" />
      </div>
      
      {/* Content */}
      <div className="p-4 pt-0">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
        
        {/* Description */}
        <div className="h-4 bg-gray-200 rounded w-full mb-4" />
        
        {/* Tech stack */}
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="group grid grid-cols-[160px_1fr] gap-4 relative bg-background 
                  w-full min-w-[280px] max-w-full h-[225px] overflow-hidden
                  shadow-[0_4px_8px_rgba(0,0,100,0.08)] p-4 rounded-lg animate-pulse">
      {/* Platform section */}
      <div className="w-full bg-gray-50 h-full flex flex-col items-center rounded-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-32 h-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded mb-2" />
      </div>

      {/* Stats section */}
      <div className="relative flex flex-col h-full rounded-lg">
        {/* Username */}
        <div className="w-32 h-6 bg-gray-200 rounded mb-4" />
        
        {/* Stats content */}
        <div className="pr-2 flex-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full" />
            <div className="flex justify-between items-center">
              <div className="w-20 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkillCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm animate-pulse min-h-[225px] p-4">
      {/* Category */}
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
      
      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded w-20" />
        ))}
      </div>
    </div>
  );
}

export function CertificateCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video p-4 pb-1">
        <div className="w-full h-full bg-gray-200 rounded-lg" />
      </div>
      
      {/* Content */}
      <div className="p-4 pt-0">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
} 