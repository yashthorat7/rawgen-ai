"use client";

import { useMemo, useState } from 'react';
import type { CodeforcesData } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trophy, Target, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ContestRankProps {
  data: CodeforcesData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ContestRank({ data }: ContestRankProps) {
  const [timeRange, setTimeRange] = useState(12); // months
  const [startIndex, setStartIndex] = useState(0);

  const allChartData = useMemo(() => {
    return [...data.ratingHistory]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(contest => ({
        contestId: contest.contestId,
        name: contest.contestName,
        rating: contest.newRating,
        oldRating: contest.oldRating,
        ratingChange: contest.newRating - contest.oldRating,
        rank: contest.rank,
        date: new Date(contest.timestamp * 1000).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        }),
        timestamp: contest.timestamp
      }));
  }, [data.ratingHistory]);

  const chartData = useMemo(() => {
    const now = Date.now() / 1000;
    const monthsAgo = now - (timeRange * 30 * 24 * 60 * 60);
    return allChartData.filter(item => item.timestamp >= monthsAgo);
  }, [allChartData, timeRange]);

  const minRating = Math.min(...chartData.map(item => item.rating));
  const maxRating = Math.max(...chartData.map(item => item.rating));
  const domain = [Math.floor(minRating / 100) * 100, Math.ceil(maxRating / 100) * 100];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-[400px]">
      <div className="grid grid-cols-3 items-center mb-6">
        <h3 className="text-lg font-semibold">Rating Progress</h3>
        <div className="flex items-center gap-2 justify-center">
          <Target className="w-6 h-6 text-red-500" />
          <span className="text-base font-medium text-gray-700">
            {data.contestCount} <span className="hidden sm:inline">contests</span>
          </span>
        </div>
        <div className="flex justify-end items-center gap-4">
        <div className="flex items-center gap-2">
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-2 py-1 rounded border text-sm"
            >
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
              <option value={24}>2 Years</option>
              <option value={36}>3 Years</option>
              <option value={1000}>All Time</option>
            </select>
          </div>
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
            <ReferenceLine y={data.maxRating} stroke="#EAB308" strokeDasharray="3 3" />
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
  const ratingChange = data.rating - data.oldRating;
  const changeColor = ratingChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-3 border border-gray-100">
      <p className="font-medium text-sm text-gray-900 mb-1">{data.name}</p>
      <p className="text-xs text-gray-600 mb-1">{data.date}</p>
      <div className="flex items-center gap-3 text-sm">
        <p className="text-primary-600 font-medium">
          Rating: {data.rating}
        </p>
        <p className={`font-medium ${changeColor}`}>
          {ratingChange > 0 ? '+' : ''}{ratingChange}
        </p>
        <p className="text-gray-600">
          Rank: #{data.rank}
        </p>
      </div>
    </div>
  );
} 