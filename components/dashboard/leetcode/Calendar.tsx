"use client";

import { CalendarTooltip } from "@/components/ui/calendar-tooltip";
import { Card } from "@/components/ui/card";
import { LeetCodeData } from "@/lib/types";
import ReactCalendarHeatmap, { ReactCalendarHeatmapValue } from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { ReactElement, SVGProps } from "react";

interface CalendarProps {
  data: LeetCodeData;
}

interface CalendarValue extends ReactCalendarHeatmapValue<Date> {
  date: Date;
  count: number;
}

export function Calendar({ data }: CalendarProps) {
  const submissionCalendar = typeof data.calendar.submissionCalendar === 'string'
    ? JSON.parse(data.calendar.submissionCalendar)
    : data.calendar.submissionCalendar;

  const values = Object.entries(submissionCalendar).map(([date, count]) => ({
    date: new Date(parseInt(date) * 1000),
    count: count as number,
  }));

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  const classForValue = (value: ReactCalendarHeatmapValue<Date> | undefined) => {
    if (!value || !('count' in value) || value.count === 0) return "color-empty";
    if (value.count < 5) return "color-scale-1";
    if (value.count < 10) return "color-scale-2";
    if (value.count < 15) return "color-scale-3";
    return "color-scale-4";
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Submission Activity</h3>
      <div className="-mx-6 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="min-w-[800px] px-6">
          <ReactCalendarHeatmap<Date>
            startDate={startDate}
            endDate={endDate}
            values={values}
            classForValue={classForValue}
            showWeekdayLabels
            transformDayElement={(element: SVGProps<SVGRectElement>, value: ReactCalendarHeatmapValue<Date> | undefined, index: number): ReactElement => {
              if (value && 'count' in value) {
                return (
                  <CalendarTooltip key={index} date={value.date} count={value.count as number}>
                    <rect {...(element as SVGProps<SVGRectElement>)} />
                  </CalendarTooltip>
                );
              }
              return <rect {...(element as SVGProps<SVGRectElement>)} />;
            }}
          />
        </div>
      </div>
      <style jsx global>{`
        .react-calendar-heatmap {
          font-size: 9px;
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
          stroke: #000;
          stroke-width: 1px;
        }
      `}</style>
    </Card>
  );
} 