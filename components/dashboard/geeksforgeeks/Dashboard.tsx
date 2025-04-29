"use client";

import type { GeeksForGeeksData } from "@/lib/types";
import { Summary } from "./Summary";
import { Languages } from "./Languages";
import { QuestionsSolved } from "./QuestionsSolved";
import { SolvedQuestionList } from "./SolvedQuestionList";
import { X, Loader2 } from "lucide-react";
import { useScrollLock } from "@/lib/utils";

interface GeeksForGeeksDashboardProps {
  data: GeeksForGeeksData;
  onClose?: () => void;
  isLoading?: boolean;
}

export function GeeksForGeeksDashboard({ data, onClose, isLoading }: GeeksForGeeksDashboardProps) {
  useScrollLock(true);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-5 text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading GeeksForGeeks profile...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-9 py-5 sm:py-7 lg:py-9">
          <div className="space-y-4">
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <Summary data={data} />
            </div>
            
            {/* Questions and Languages */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-2/6 transform transition-all duration-200 hover:scale-[1.01]">
                <Languages data={data} />
              </div>
              <div className="lg:w-4/6 transform transition-all duration-200 hover:scale-[1.01]">
                <QuestionsSolved data={data} />
              </div>
            </div>

            {/* Solved Questions List */}
            <div className="transform transition-all duration-200 hover:scale-[1.01]">
              <SolvedQuestionList data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
