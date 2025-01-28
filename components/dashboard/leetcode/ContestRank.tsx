"use client";

import { useMemo } from 'react';
import type { LeetCodeData } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestRankProps {
  data: LeetCodeData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ContestRank({ data }: ContestRankProps) {
  const chartData = useMemo(() => {
    return [...data.contests]
      .sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
      .map(contest => ({
        name: contest.title,
        rating: contest.rating,
        rank: contest.ranking,
        date: contest.startTime 
          ? new Date(contest.startTime * 1000).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            })
          : 'Unknown',
        trendDirection: contest.trendDirection,
        problemsSolved: contest.problemsSolved,
        totalProblems: contest.totalProblems,
        finishTimeInSeconds: contest.finishTimeInSeconds
      }));
  }, [data.contests]);

  const minRating = Math.min(...chartData.map(item => item.rating));
  const maxRating = Math.max(...chartData.map(item => item.rating));
  const domain = [Math.floor(minRating / 100) * 100, Math.ceil(maxRating / 100) * 100];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-[400px]">
      <div className="grid grid-cols-3 items-center mb-6">
        <h3 className="text-lg font-semibold">Contest Rating</h3>
        <div className="flex items-center gap-2 justify-center">
          <Target className="w-6 h-6 text-red-500" />
          <span className="text-base font-medium text-gray-700">
            {data.contestStats?.attendedContestsCount || data.contests.length} 
            <span className="hidden sm:inline"> contests</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-base font-medium text-gray-700">
              {data.contestStats?.rating.toFixed(1) || maxRating.toFixed(1)}
            </span>
          </div>
          {data.contestStats && (
            <div className="text-xs text-gray-500">
              Top {data.contestStats.topPercentage.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={domain}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ r: 4, fill: '#6366F1' }}
              activeDot={{ r: 6, fill: '#4F46E5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-3 border border-gray-100">
      <p className="font-medium text-sm text-gray-900 mb-1">{data.name}</p>
      <p className="text-xs text-gray-600 mb-1">{data.date}</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 text-sm">
          <p className="text-primary-600 font-medium">
            Rating: {data.rating.toFixed(1)}
          </p>
          <p className="text-gray-600">
            Rank: #{data.rank}
          </p>
        </div>
        {data.problemsSolved !== undefined && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Solved: {data.problemsSolved}/{data.totalProblems}</span>
            {data.finishTimeInSeconds && (
              <span>Time: {Math.floor(data.finishTimeInSeconds / 60)}:{(data.finishTimeInSeconds % 60).toString().padStart(2, '0')}</span>
            )}
          </div>
        )}
        {data.trendDirection && (
          <div className="flex items-center gap-1 text-xs">
            {data.trendDirection === 'UP' ? (
              <>
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">Improved</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-red-600">Decreased</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 