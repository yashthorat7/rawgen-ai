"use client";

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { GeeksForGeeksData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SolvedQuestionListProps {
  data: GeeksForGeeksData;
}

type Difficulty = 'school' | 'basic' | 'easy' | 'medium' | 'hard';

const DIFFICULTY_COLORS = {
  school: 'text-purple-600 bg-purple-100',
  basic: 'text-blue-600 bg-blue-100',
  easy: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  hard: 'text-red-600 bg-red-100'
} as const;

export function SolvedQuestionList({ data }: SolvedQuestionListProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const difficulties: Difficulty[] = ['school', 'basic', 'easy', 'medium', 'hard'];
  const currentProblems = data.problems[selectedDifficulty] || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 select-none">
      {/* Header with Tabs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Solved Problems</h3>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200",
                selectedDifficulty === difficulty
                  ? DIFFICULTY_COLORS[difficulty]
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              )}
            >
              {difficulty}
              <span className="ml-2 text-xs">
                ({data.problems[difficulty]?.length || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Problems Grid */}
      <div className="overflow-y-auto min-h-[calc(1*5.5rem)] max-h-[calc(5*5.5rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentProblems.map((problem, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 h-[2.5rem]"
            >
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <div className="flex items-center justify-between gap-2 h-full">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate flex-1">
                    {problem.title}
                  </h4>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0" />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 