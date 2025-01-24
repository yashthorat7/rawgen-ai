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
}

export function Stats({ data }: StatsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatItem
          icon={Eye}
          label="Profile Views"
          count={data.views.count}
          weeklyCount={data.views.diff}
        />
        <StatItem
          icon={Code2}
          label="Solution Views"
          count={data.solutions.count}
          weeklyCount={data.solutions.diff}
        />
        <StatItem
          icon={MessageSquare}
          label="Discussion Posts"
          count={data.discussions.count}
          weeklyCount={data.discussions.diff}
        />
        <StatItem
          icon={Star}
          label="Reputation Score"
          count={data.reputation}
          weeklyCount={data.contributionPoints?.diff}
        />
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, count, weeklyCount }: StatItemProps) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200">
      <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow transition-shadow">
        <Icon className="w-5 h-5 text-primary-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold text-gray-900">{count.toLocaleString()}</p>
          {weeklyCount && weeklyCount > 0 && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{weeklyCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

