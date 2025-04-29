"use client";

import { Clock, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import type { CodeChefData } from "@/lib/types";
import { useState } from 'react';
import { cn } from "@/lib/utils";

interface SolvedQuestionListProps {
  data: CodeChefData;
}

interface ContestItemProps {
  contest: {
    name: string;
    rank: number;
    date: string;
    problems?: string[];
  };
}

export function SolvedQuestionList({ data }: SolvedQuestionListProps) {
  const recentContests = [...data.ratingHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)
    .map(contest => {
      const details = data.contestDetails?.find(
        detail => detail.name === contest.name
      );
      
      return {
        ...contest,
        problems: details?.problems || []
      };
    });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 select-none">
      <h3 className="text-lg font-semibold mb-4">Recent Contests</h3>
      <div className="divide-y divide-gray-100">
        {recentContests.map((contest, index) => (
          <ContestItem 
            key={`${contest.code}-${index}`} 
            contest={{
              name: contest.name,
              rank: contest.rank,
              date: contest.date,
              problems: contest.problems
            }} 
          />
        ))}
      </div>
    </div>
  );
}

function ContestItem({ contest }: ContestItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div 
        className="group cursor-pointer" 
        onClick={() => contest.problems && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 truncate transition-colors">
              {contest.name}
            </h4>
            {contest.problems && (
              <button className="text-gray-400 hover:text-primary-600 transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm whitespace-nowrap flex-shrink-0">
            <div className="flex items-center gap-1 text-gray-500">
              <Trophy className="w-4 h-4" />
              <span>#{contest.rank}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              {timeAgo(contest.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Problems Section */}
      {contest.problems && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded ? "max-h-48 mt-3" : "max-h-0"
          )}
        >
          <div className="pl-4 border-l-2 border-gray-100 space-y-1">
            {contest.problems.map((problem, index) => (
              <div 
                key={index}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {problem}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 