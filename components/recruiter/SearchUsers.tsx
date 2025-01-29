"use client";

import { useState, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { debounce } from "@/lib/utils";
import { SearchGrid } from "./SearchGrid";

export function SearchUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Bar */}
      <div className={`
        relative transition-all duration-300 w-full max-w-[90%] mx-auto
        ${isSearchFocused ? 'transform -translate-y-1' : ''}
      `}>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search users by name, email, or skills..."
            className="w-full pl-12 pr-10 py-4 sm:py-5 bg-white/90 backdrop-blur-sm border border-gray-200 
                     rounded-2xl outline-none focus:border-blue-500 
                     transition-all duration-300 placeholder:text-gray-400
                     shadow-lg hover:shadow-xl focus:shadow-xl
                     text-base sm:text-lg"
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2
                       hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="w-full max-w-[90%] mx-auto animate-fadeIn">
          <SearchGrid searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
} 
