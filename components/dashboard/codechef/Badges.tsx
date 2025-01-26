"use client";

import type { CodeChefData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Medal } from 'lucide-react';

interface BadgesProps {
  data: CodeChefData;
}

interface BadgeCardProps {
  badge: {
    title: string;
    description: string;
    image: string;
  };
}

export function Badges({ data }: BadgesProps) {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const MINIMUM_BADGES_FOR_VIEW_ALL = 4;
  const visibleBadges = showAll ? data.badges : data.badges.slice(0, 4);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn(
      "bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden select-none h-[400px]"
    )}>
      <div className="grid grid-cols-3 items-center mb-2">
        <h3 className="text-lg font-semibold">Badges</h3>
        <div className="flex items-center gap-2 justify-center">
          <Medal className="w-6 h-6 text-yellow-500" />
          <span className="text-base font-medium text-gray-700">{data.badges.length} earned</span>
        </div>
        <div className="flex justify-end">
          {data.badges.length > MINIMUM_BADGES_FOR_VIEW_ALL && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors duration-200"
            >
              {showAll ? 'Show Less' : 'View All'}
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Grid of badges */}
      <div className="transition-all duration-500 overflow-y-auto h-[320px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className={cn(
          "flex flex-wrap gap-4",
          showAll ? "" : ""
        )}>
          {visibleBadges.map((badge, index) => (
            <div key={index} className="w-[calc(50%-8px)] flex justify-center">
              <BadgeCard badge={badge} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }: BadgeCardProps) {
  const shortTitle = badge.title.split('-')[0].trim();
  
  return (
    <div className="relative group w-full max-w-[140px]">
      <div className="aspect-square relative rounded-lg overflow-hidden bg-white">
        {/* Hover Description Overlay */}
        <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4 z-10">
          <p className="text-xs text-gray-700 text-center">
            {badge.description}
          </p>
        </div>
        <img
          src={badge.image}
          alt={shortTitle}
          className="w-full h-full object-contain p-2"
        />
      </div>
      <div className="mt-2 text-center">
        <div className="font-medium text-xs truncate text-gray-900">
          {shortTitle}
        </div>
      </div>
    </div>
  );
}