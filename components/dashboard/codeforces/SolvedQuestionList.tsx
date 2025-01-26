"use client";

import { Clock, Trophy, ArrowUpRight, TrendingDown } from 'lucide-react';
import type { CodeforcesData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SolvedQuestionListProps {
  data: CodeforcesData;
}

interface ContestItemProps {
  contest: {
    contestId: number;
    contestName: string;
    rank: number;
    oldRating: number;
    newRating: number;
    timestamp: number;
  };
}

export function SolvedQuestionList({ data }: SolvedQuestionListProps) {
  // Get last 10 contests
  const recentContests = [...data.ratingHistory]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 15);

  const { averageRank, averageRatingChange } = data.recentPerformance;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {recentContests.map((contest) => (
          <ContestItem 
            key={contest.contestId}
            contest={{
              contestId: contest.contestId,
              contestName: contest.contestName,
              rank: contest.rank,
              oldRating: contest.oldRating,
              newRating: contest.newRating,
              timestamp: contest.timestamp
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ContestItem({ contest }: ContestItemProps) {
  const ratingChange = contest.newRating - contest.oldRating;
  const timeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diffInSeconds = Math.floor(now - timestamp);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center flex gap-3 min-w-0 flex-1">
        <a
          href={`https://codeforces.com/contest/${contest.contestId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-primary-600 transition-colors flex-shrink-0 truncate max-w-full"
          title={contest.contestName}
        >
          {contest.contestName} <ArrowUpRight className="w-4 h-4 inline text-gray-400 ml-1" />
        </a>
        </div>
        <div className="flex items-center gap-4 text-sm whitespace-nowrap flex-shrink-0">
          <div className="flex items-center gap-1 text-gray-500">
            <Trophy className="w-4 h-4" />
            <span>#{contest.rank}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{timeAgo(contest.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 