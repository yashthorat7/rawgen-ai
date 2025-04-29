"use client";

import type { LeetCodeData } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LanguagesProps {
  data: LeetCodeData;
}

export function Languages({ data }: LanguagesProps) {
  const sortedLanguages = [...data.languageStats].sort((a, b) => b.solved - a.solved);
  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 3;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 select-none">
      <h3 className="text-lg font-semibold mb-4">Languages</h3>
      
      <ScrollArea className="max-h-[180px] sm:h-[180px]">
        <div className="space-y-2 pr-2">
          {sortedLanguages.map((language, index) => (
            <div 
              key={language.name}
              className={cn(
                "flex items-center justify-between py-1.5 px-2 rounded-md transition-colors",
                index % 2 === 0 ? "bg-gray-50/80 hover:bg-gray-50" : "bg-gray-100/80 hover:bg-gray-100"
              )}
            >
              <span className="font-medium text-gray-900">{language.name}</span>
              <span className="text-gray-600">
                {language.solved.toLocaleString()} solved
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


