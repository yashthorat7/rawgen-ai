"use client";

import { useState } from 'react';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import type { CodeChefData } from "@/lib/types";
import HeatMap from 'react-calendar-heatmap';

interface CalendarProps {
  data: CodeChefData;
}

interface HeatmapValue {
  date: Date;
  count: number;
}

export function Calendar({ data }: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const heatmapData = data.submissionStats
    .map(stat => ({
      date: new Date(stat.date),
      count: stat.submissions
    }))
    .filter(item => item.date.getFullYear() === selectedYear);

  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Submission Activity</h3>
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

      <div className="overflow-x-auto mx-1 sm:-mx-0">
        <div className="min-w-[700px] pr-4 py-3 sm:py-0 sm:px-0">
          <div className="transform sm:transform-none sm:scale-100 scale-[1.2] origin-left -mr-[20%] sm:mx-2">
            <HeatMap
              values={heatmapData}
              startDate={startDate}
              endDate={endDate}
              classForValue={(value) => {
                if (!value) return "color-empty";
                const count = value.count;
                if (count >= 10) return "color-scale-4";
                if (count >= 5) return "color-scale-3";
                if (count >= 3) return "color-scale-2";
                return "color-scale-1";
              }}
              titleForValue={(value) => {
                if (!value || !value.count) return 'No submissions';
                const date = value.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                });
                return `${value.count} submission${value.count === 1 ? '' : 's'}\n${date}`;
              }}
              gutterSize={3}
              showWeekdayLabels={false}
              showMonthLabels
              monthLabels={[
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs sm:text-sm sm:gap-3 text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#ebedf0] rounded-sm"></div>
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#9be9a8] rounded-sm"></div>
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#40c463] rounded-sm"></div>
          <span>3-4</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#30a14e] rounded-sm"></div>
          <span>5-9</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#216e39] rounded-sm"></div>
          <span>10+</span>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar-heatmap {
          font-size: 10px;
        }
        
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        
        .react-calendar-heatmap .color-scale-1 {
          fill: #9be9a8;
        }
        
        .react-calendar-heatmap .color-scale-2 {
          fill: #40c463;
        }
        
        .react-calendar-heatmap .color-scale-3 {
          fill: #30a14e;
        }
        
        .react-calendar-heatmap .color-scale-4 {
          fill: #216e39;
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