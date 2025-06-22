"use client";

import { useState, useMemo } from "react";
import type { CodeforcesData } from "@/lib/types";
import HeatMap from "react-calendar-heatmap";
import { Trophy } from "lucide-react";

interface CalendarProps {
  data: CodeforcesData;
}

export function Calendar({ data }: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const heatmapData = useMemo(() => {
    return data.ratingHistory
      .map((contest) => ({
        date: new Date(contest.timestamp * 1000),
        count: 1,
        rank: contest.rank,
        rating: contest.newRating,
        name: contest.contestName,
      }))
      .filter((item) => item.date.getFullYear() === selectedYear);
  }, [data.ratingHistory, selectedYear]);

  const bestRank = Math.min(...data.ratingHistory.map((c) => c.rank));
  const averageRank = Math.round(
    data.ratingHistory.reduce((acc, c) => acc + c.rank, 0) /
      data.ratingHistory.length,
  );

  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Contest Activity</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="justify-center">
              <span className="hidden sm:inline">Best: </span>
              {bestRank}
            </span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mx-1 sm:-mx-0">
        <div className="min-w-[700px] pr-4 py-3 sm:py-0 sm:px-0">
          <div className="transform sm:transform-none sm:scale-100 scale-[1.2] origin-left -mr-[20%] sm:mx-2">
            <HeatMap
              values={heatmapData}
              startDate={startDate}
              endDate={endDate}
              classForValue={(value) => {
                if (!value) return "color-empty";
                return value.rank <= averageRank
                  ? "color-scale-4"
                  : "color-scale-2";
              }}
              titleForValue={(value) => {
                if (!value) return "No contests";
                return `${value.name}\nRank: #${value.rank}\nRating: ${value.rating}`;
              }}
              gutterSize={3}
              showWeekdayLabels={false}
              showMonthLabels
              monthLabels={[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ]}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar-heatmap {
          font-size: 10px;
        }

        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }

        .react-calendar-heatmap .color-scale-2 {
          fill: #87e09e;
        }

        .react-calendar-heatmap .color-scale-4 {
          fill: #40c463;
        }

        .react-calendar-heatmap rect:hover {
          stroke: #1f2937;
          stroke-width: 1px;
        }

        @media (max-width: 640px) {
          .react-calendar-heatmap text {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
}
