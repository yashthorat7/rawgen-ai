"use client";

import type { LeetCodeData } from "@/lib/types";
import { Summary } from "./Summary";
import { Stats } from "./Stats";
import { QuestionsSolved } from "./QuestionsSolved";
import { Calendar } from "./Calender";
import { Languages } from "./Languages";
import { Skills } from "./Skills";
import { ContestRank } from "./ContestRank";
import { Badges } from "./Badges";
import { SolvedQuestionList } from "./SolvedQuestionList";
import { X } from "lucide-react";

interface LeetCodeDashboardProps {
  data: LeetCodeData;
  onClose?: () => void;
}

export function LeetCodeDashboard({ data, onClose }: LeetCodeDashboardProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl overflow-hidden">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 p-2 rounded-full bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white/90 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable container */}
      <div className="h-full overflow-y-auto">
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
          <div className="space-y-6">
            {/* Profile Summary - Always show */}
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <Summary data={data} />
            </div>
            
            {/* Questions Solved and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-full">
                <div className="h-full transform transition-all duration-200 hover:scale-[1.01]">
                  <QuestionsSolved data={data} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 h-full">
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
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <Calendar data={data} />
              </div>
            )}

            {/* Contest Rank */}
            {data.contests && data.contests.length > 0 && (
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <ContestRank data={data} />
              </div>
            )}

            {/* Skills */}
            {data.topicStats && (
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <Skills data={data} />
              </div>
            )}
            
            {/* Badges */}
            {data.badges && data.badges.length > 0 && (
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <Badges data={data} />
              </div>
            )}

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
