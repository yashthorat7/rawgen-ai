"use client";

import type { LeetCodeData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Medal } from 'lucide-react';

interface BadgesProps {
  data: LeetCodeData;
}

interface BadgeCardProps {
  badge: {
    name: string;
    shortName: string;
    icon: string;
    gifIcon?: string;
    creationDate: string;
  };
  size?: 'sm' | 'lg';
}

export function Badges({ data }: BadgesProps) {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const recentBadge = data.badges[0];
  const otherBadges = data.badges.slice(1);
  const MINIMUM_BADGES_FOR_VIEW_ALL = 6;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn(
      "bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden select-none",
      showAll ? "h-auto" : "h-[460px] sm:h-[490px]"
    )}>
      <div className="grid grid-cols-3 items-center mb-4">
        <h3 className="text-lg font-semibold">Badges</h3>
        <div className="flex items-center gap-2 justify-center">
          <Medal className="w-6 h-6 text-yellow-500" />
          <span className="text-base font-medium text-gray-700">{data.badges.length} earned</span>
        </div>
        <div className="flex justify-end">
          {otherBadges.length > MINIMUM_BADGES_FOR_VIEW_ALL && (
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
      
      {/* Center section with recent badge */}
      <div className={cn(
        "flex items-center justify-center transition-all duration-300",
        showAll ? "mb-6" : "mb-8"
      )}>
        {recentBadge && (
          <div className="w-40">
            <BadgeCard badge={recentBadge} size="lg" />
          </div>
        )}
      </div>

      {/* Bottom section with horizontal badges */}
      <div className="transition-all duration-500">
        <div className={cn(
          "grid gap-4",
          showAll 
            ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5" 
            : "grid-cols-3 sm:grid-cols-5"
        )}>
          {(showAll 
            ? otherBadges 
            : otherBadges.slice(0, isMobile ? 3 : 5)
          ).map((badge, index) => (
            <div key={index}>
              <BadgeCard badge={badge} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge, size = 'sm' }: BadgeCardProps) {
  return (
    <div
      className={cn(
        "relative group",
        size === 'lg' ? "text-base" : "text-sm"
      )}
    >
      <div className="aspect-square relative rounded-lg overflow-hidden bg-white">
        <img
          src={badge.gifIcon || badge.icon}
          alt={badge.name}
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div className="mt-2 text-center">
        <div className={cn(
          "font-medium truncate text-gray-900",
          size === 'lg' ? "text-base" : "text-sm"
        )}>
          {badge.shortName}
        </div>
        <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute inset-x-0 -bottom-5">
          {new Date(badge.creationDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}