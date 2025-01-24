"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";

interface LanguagesProps {
  data: LeetCodeData;
}

export function Languages({ data }: LanguagesProps) {
  const [showAll, setShowAll] = useState(false);
  const sortedLanguages = [...data.languageStats].sort((a, b) => b.solved - a.solved);
  const displayLanguages = showAll ? sortedLanguages : sortedLanguages.slice(0, 6);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Languages</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {displayLanguages.map((language) => (
          <div 
            key={language.name}
            className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span className="font-medium text-gray-900">{language.name}</span>
            <span className="text-gray-600">
              {language.solved.toLocaleString()} solved
            </span>
          </div>
        ))}
      </div>

      {sortedLanguages.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors"
        >
          {showAll ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}


