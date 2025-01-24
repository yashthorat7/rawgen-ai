"use client";

import { CheckCircle2, Clock } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Recently Solved</h3>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {data.recentlySolved.map((question, index) => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </div>
      </ScrollArea>
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
    <a
      href={question.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-medium hover:text-primary-600 transition-colors">
            {question.title}
          </h4>
          <span className={cn("text-sm", difficultyColor)}>
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
          <Clock className="w-4 h-4" />
          {timeAgo(question.timestamp)}
        </div>
      </div>
    </a>
  );
}