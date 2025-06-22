"use client";

import { useMemo } from "react";
import type { CodeChefData } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Target } from "lucide-react";

interface ContestRankProps {
  data: CodeChefData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ContestRank({ data }: ContestRankProps) {
  const chartData = useMemo(() => {
    return [...data.ratingHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((contest) => ({
        name: contest.name,
        rating: contest.rating,
        rank: contest.rank,
        date: new Date(contest.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        color: contest.color,
      }));
  }, [data.ratingHistory]);

  const minRating = Math.min(...chartData.map((item) => item.rating));
  const maxRating = Math.max(...chartData.map((item) => item.rating));
  const domain = [
    Math.floor(minRating / 100) * 100,
    Math.ceil(maxRating / 100) * 100,
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-[400px]">
      <div className="grid grid-cols-3 items-center mb-6">
        <h3 className="text-lg font-semibold">Ranking</h3>
        <div className="flex items-center gap-2 justify-center">
          <Target className="w-6 h-6 text-red-500" />
          <span className="text-base font-medium text-gray-700">
            {data.totalContests}{" "}
            <span className="hidden sm:inline"> contests</span>
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-base font-medium text-gray-700">
            <span className="hidden sm:inline">Peak: </span>
            {maxRating}
          </span>
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
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={domain}
              tick={{ fontSize: 12, fill: "#6B7280" }}
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
              dot={{ r: 4, fill: "#6366F1" }}
              activeDot={{ r: 6, fill: "#4F46E5" }}
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
      <div className="flex items-center gap-3 text-sm">
        <p className="text-primary-600 font-medium">Rating: {data.rating}</p>
        <p className="text-gray-600">Rank: #{data.rank}</p>
      </div>
    </div>
  );
}
