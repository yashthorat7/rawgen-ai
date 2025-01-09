"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  solved: number;
  total?: number;
  color: "green" | "yellow" | "red" | "blue" | "purple";
}

export function ProgressBar({ solved, total, color }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let progress: number;

    if (total) {
      // If total is provided, use non-linear exaggerated progress
      progress = Math.pow(solved / total, 0.6) * 100;
      // progress = solved / total * 100;
      // progress = Math.sqrt(solved / total) * 100;
    } else {
      // If no total, use adaptive ranges
      let effectiveTotal: number;
      
      if (solved <= 100) {
        effectiveTotal = 100;
      } else if (solved <= 200) {
        effectiveTotal = 200;
      } else {
        effectiveTotal = 300;
      }

      // Use linear progress for adaptive ranges
      progress = (solved / effectiveTotal) * 100;
    }

    setWidth(progress);
  }, [solved, total]);

  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500"
  };

  return (
    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClasses[color]} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(width, 100)}%` }}
      />
    </div>
  );
} 