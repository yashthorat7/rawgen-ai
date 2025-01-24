"use client";

import { useState } from 'react';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import type { LeetCodeData } from "@/lib/types";

interface CalendarProps {
  data: LeetCodeData;
}

interface HeatmapValue {
  date: Date;
  count: number;
}

export function Calendar({ data }: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Parse submission calendar - it comes as a stringified JSON
  const submissionCalendar = typeof data.calendar.submissionCalendar === 'string' 
    ? JSON.parse(data.calendar.submissionCalendar)
    : data.calendar.submissionCalendar;

  const heatmapData = Object.entries(submissionCalendar)
    .map(([timestamp, count]) => ({
      date: new Date(parseInt(timestamp) * 1000),
      count: count as number
    }))
    .filter(item => item.date.getFullYear() === selectedYear);

  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
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

      <div className="-mx-6 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="min-w-[750px] px-6">
          <ReactCalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || !value.count) return 'color-empty';
              if (value.count <= 2) return 'color-scale-1';
              if (value.count <= 4) return 'color-scale-2';
              if (value.count <= 6) return 'color-scale-3';
              return 'color-scale-4';
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
            showMonthLabels
            monthLabels={[
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]}
            gutterSize={4}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#ebedf0] rounded-sm"></div>
          <span>0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#9be9a8] rounded-sm"></div>
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#40c463] rounded-sm"></div>
          <span>3-4</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#30a14e] rounded-sm"></div>
          <span>5-6</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#216e39] rounded-sm"></div>
          <span>7+</span>
        </div>
      </div>

      <style jsx global>{`
        .react-calendar-heatmap {
          font-size: 12px;
        }
        .react-calendar-heatmap .color-empty { fill: #ebedf0; }
        .react-calendar-heatmap .color-scale-1 { fill: #9be9a8; }
        .react-calendar-heatmap .color-scale-2 { fill: #40c463; }
        .react-calendar-heatmap .color-scale-3 { fill: #30a14e; }
        .react-calendar-heatmap .color-scale-4 { fill: #216e39; }
        .react-calendar-heatmap rect:hover {
          stroke: #1f2937;
          stroke-width: 1px;
        }
        [role="tooltip"] {
          background-color: white !important;
          border-radius: 0.75rem !important;
          padding: 0.75rem 1rem !important;
          font-size: 1rem !important;
          line-height: 1.5 !important;
          color: #1f2937 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border: 1px solid #e5e7eb !important;
          font-weight: 500 !important;
          z-index: 50 !important;
          white-space: pre-line !important;
        }
        [role="tooltip"] > div:first-child {
          font-size: 1.25rem !important;
          margin-bottom: 0.25rem !important;
        }
      `}</style>
    </div>
  );
}