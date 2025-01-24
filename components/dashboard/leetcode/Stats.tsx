"use client";

import { Eye, MessageSquare, Star, Code2, TrendingUp } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";

interface StatsProps {
  data: LeetCodeData;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  count: number;
  weeklyCount?: number;
  color: string;
  bgColor: string;
}

export function Stats({ data }: StatsProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
        <StatItem
          icon={Eye}
          label="Profile Views"
          count={data.views.count}
          weeklyCount={data.views.diff}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <StatItem
          icon={Code2}
          label="Solution Views"
          count={data.solutions.count}
          weeklyCount={data.solutions.diff}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatItem
          icon={MessageSquare}
          label="Discussion Posts"
          count={data.discussions.count}
          weeklyCount={data.discussions.diff}
          color="text-indigo-500"
          bgColor="bg-indigo-50"
        />
        <StatItem
          icon={Star}
          label="Reputation Score"
          count={data.reputation}
          weeklyCount={data.contributionPoints?.diff}
          color="text-amber-500"
          bgColor="bg-amber-50"
        />
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, count, weeklyCount, color, bgColor }: StatItemProps) {
  return (
    <div className="group flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
      <div className={`p-2 sm:p-2.5 rounded-xl ${bgColor} shadow-sm group-hover:shadow-md transition-all duration-200`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <p className="text-base sm:text-xl font-bold text-gray-900">{count.toLocaleString()}</p>
          {weeklyCount && weeklyCount > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium text-green-600">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">+{weeklyCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

