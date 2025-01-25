"use client";

import type { LeetCodeData } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SkillsProps {
  data: LeetCodeData;
  hasBadges?: boolean;
}

interface TagSection {
  title: string;
  tags: Array<{
    name: string;
    slug: string;
    solved: number;
  }>;
  color: string;
}

export function Skills({ data, hasBadges }: SkillsProps) {
  const sections: TagSection[] = [
    { 
      title: 'Advanced', 
      tags: data.topicStats.advanced,
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    { 
      title: 'Intermediate', 
      tags: data.topicStats.intermediate,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    { 
      title: 'Fundamental', 
      tags: data.topicStats.fundamental,
      color: 'bg-sky-600 hover:bg-sky-700'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-[490px] hover:shadow-md transition-all duration-300 overflow-hidden select-none">
      <h3 className="text-lg font-semibold">Skills</h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-6 pr-2">
          {sections.map((section) => {
            const sortedTags = section.tags.sort((a, b) => b.solved - a.solved);
            
            return (
              <div key={section.title}>
                <h4 className="text-base font-bold text-gray-700 text-center mb-3">{section.title}</h4>
                <div className={cn(
                  "grid gap-2",
                  hasBadges 
                    ? "grid-cols-2" // Always 2 columns when badges are present
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" // More columns when full width
                )}>
                  {sortedTags.map((tag) => (
                    <div 
                      key={tag.slug}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg transition-colors duration-200",
                        section.color
                      )}
                    >
                      <span className="text-sm font-medium text-white flex-1 truncate">
                        {tag.name}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-white/20 text-white">
                        ×{tag.solved}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
