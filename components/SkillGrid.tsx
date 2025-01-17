"use client";

export function SkillGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* Placeholder for future skill cards */}
      {[...Array(5)].map((_, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="h-[420px] flex items-center justify-center text-gray-400">
            Skill Card {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
} 