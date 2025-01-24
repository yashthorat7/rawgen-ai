"use client";

import { useState } from 'react';
import { Award, ChevronRight } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  isHighlighted?: boolean;
}

export function Badges({ data }: BadgesProps) {
  const [showAll, setShowAll] = useState(false);
  const recentBadge = data.badges[0];
  const displayedBadges = showAll ? data.badges : data.badges.slice(0, 6);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Badges</h3>
          <span className="text-sm text-gray-600">({data.badges.length})</span>
        </div>
        {data.badges.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-primary-600 hover:text-primary-700"
          >
            {showAll ? 'Show Less' : 'View All'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {recentBadge && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Most Recent Badge</h4>
          <div className="flex justify-center">
            <BadgeCard badge={recentBadge} isHighlighted />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayedBadges.map((badge, index) => (
          <BadgeCard key={index} badge={badge} />
        ))}
      </div>
    </div>
  );
}

function BadgeCard({ badge, isHighlighted }: BadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group transition-transform duration-300",
        isHighlighted && "scale-110",
        !isHighlighted && "hover:scale-105"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative">
        <img
          src={isHovered && badge.gifIcon ? badge.gifIcon : badge.icon}
          alt={badge.name}
          className="w-full h-full rounded-lg"
        />
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium truncate">
          {badge.shortName}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(badge.creationDate).toLocaleDateString()}
        </div>
      </div>

      {/* Hover tooltip */}
      <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full whitespace-nowrap">
        {badge.name}
      </div>
    </div>
  );
}