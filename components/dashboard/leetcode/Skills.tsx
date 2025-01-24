"use client";

import type { LeetCodeData } from "@/lib/types";
import { Brain } from 'lucide-react';

interface SkillsProps {
  data: LeetCodeData;
}

interface TagSection {
  title: string;
  tags: Array<{
    name: string;
    slug: string;
    solved: number;
  }>;
}

export function Skills({ data }: SkillsProps) {
  const sections: TagSection[] = [
    { title: 'Advanced', tags: data.topicStats.advanced },
    { title: 'Intermediate', tags: data.topicStats.intermediate },
    { title: 'Fundamental', tags: data.topicStats.fundamental }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Skills</h3>
      </div>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{section.title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.tags
                .sort((a, b) => b.solved - a.solved)
                .map((tag) => (
                  <div key={tag.slug} className="space-y-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-gray-500">{tag.solved}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${Math.max((tag.solved / 100) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
