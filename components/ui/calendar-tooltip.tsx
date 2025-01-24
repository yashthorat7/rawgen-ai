"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface CalendarTooltipProps {
  date: Date;
  count: number;
  children: React.ReactNode;
}

export function CalendarTooltip({ date, count, children }: CalendarTooltipProps) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
          <div className="flex flex-col items-center gap-1">
            <div className="text-xl font-bold text-gray-900">
              {count} submission{count === 1 ? '' : 's'}
            </div>
            <div className="text-sm text-gray-600">
              {formattedDate}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 