"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  bg-white/90 backdrop-blur-sm placeholder-gray-400"
        placeholder={placeholder || "Search..."}
      />
    </div>
  );
}
