"use client";

import type { GeeksForGeeksData } from "@/lib/types";
import { Code2 } from "lucide-react";

interface LanguagesProps {
  data: GeeksForGeeksData;
}

export function Languages({ data }: LanguagesProps) {
  if (!data.languages || data.languages.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full select-none">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Languages</h3>
      </div>

      <div className="overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="space-y-2">
          {data.languages.map((language, index) => (
            <div
              key={index}
              className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="text-base font-medium text-gray-700">
                {language}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


