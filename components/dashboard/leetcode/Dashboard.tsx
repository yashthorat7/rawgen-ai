"use client";

import type { LeetCodeData } from "@/lib/types";
import { Summary } from "./Summary";
import { Stats } from "./Stats";
import { QuestionsSolved } from "./QuestionsSolved";
import { Calendar } from "./Calendar";
import { Languages } from "./Languages";
import { Skills } from "./Skills";
import { ContestRank } from "./ContestRank";
import { Badges } from "./Badges";
import { SolvedQuestionList } from "./SolvedQuestionList";
import { X, Loader2 } from "lucide-react";
import { cn, useScrollLock } from "@/lib/utils";

interface LeetCodeDashboardProps {
  data: LeetCodeData;
  onClose?: () => void;
  isLoading?: boolean;
}

export function LeetCodeDashboard({ data, onClose, isLoading }: LeetCodeDashboardProps) {
  useScrollLock(true);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-5 text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading LeetCode profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl overflow-hidden">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-5 sm:top-7 right-5 sm:right-7 z-50 p-3 rounded-full bg-white/80 shadow-lg backdrop-blur-sm hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        </button>
      )}

      {/* Scrollable container */}
      <div className="h-full overflow-y-auto">
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-5 sm:py-7 lg:py-9">
          <div className="space-y-4">
            {/* Profile Summary - Always show */}
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <Summary data={data} />
            </div>
            
            {/* Questions Solved and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-full">
                <div className="h-full transform transition-all duration-200 hover:scale-[1.01]">
                  <QuestionsSolved data={data} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 h-full">
                <div className="transform transition-all duration-200 hover:scale-[1.01]">
                  <Stats data={data} />
                </div>
                {data.languageStats && data.languageStats.length > 0 && (
                  <div className="flex-1 transform transition-all duration-200 hover:scale-[1.01]">
                    <Languages data={data} />
                  </div>
                )}
              </div>
            </div>

            {/* Calendar - Show if submission calendar exists */}
            {data.calendar && (
              <div className="transform transition-all duration-200 hover:scale-[1.01] mx-0 sm:mx-0">
                <Calendar data={data} />
              </div>
            )}

            {/* Contest Rank */}
            {data.contests && data.contests.length > 0 && (
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <ContestRank data={data} />
              </div>
            )}

            {/* Skills and Badges side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Badges - 60% width */}
              {data.badges && data.badges.length > 0 ? (
                <div className="lg:col-span-3 transform transition-all duration-200 hover:scale-[1.01]">
                  <Badges data={data} />
                </div>
              ) : null}
              
              {/* Skills - 40% width or full width if no badges */}
              {data.topicStats && (
                <div className={cn(
                  "transform transition-all duration-200 hover:scale-[1.01]",
                  data.badges && data.badges.length > 0 ? "lg:col-span-2" : "lg:col-span-5"
                )}>
                  <Skills 
                    data={data} 
                    hasBadges={Boolean(data.badges && data.badges.length > 0)} 
                  />
                </div>
              )}
            </div>

            {/* Recent Questions */}
            {data.recentlySolved && data.recentlySolved.length > 0 && (
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <SolvedQuestionList data={data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
