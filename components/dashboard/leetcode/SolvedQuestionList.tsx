"use client";

import { Clock, ArrowUpRight } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SolvedQuestionListProps {
  data: LeetCodeData;
}

interface QuestionItemProps {
  question: {
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
    url: string;
    difficulty: string;
  };
}

export function SolvedQuestionList({ data }: SolvedQuestionListProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4">Recently Solved</h3>
      <div className="divide-y divide-gray-100">
        {data.recentlySolved.map((question, index) => (
          <QuestionItem key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}

function QuestionItem({ question }: QuestionItemProps) {
  const difficultyColor = {
    Easy: 'text-green-600',
    Medium: 'text-yellow-600',
    Hard: 'text-red-600'
  }[question.difficulty] || 'text-gray-600';

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(parseInt(timestamp) * 1000);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="group py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {question.title}
          </h4>
          <a
            href={question.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
          <Clock className="w-4 h-4" />
          {timeAgo(question.timestamp)}
        </div>
      </div>
    </div>
  );
}