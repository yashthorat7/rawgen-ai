"use client";

import { useState, useCallback, useRef } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { debounce } from "@/lib/utils";
import { SearchGrid } from "./SearchGrid";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type SortOption = "skills" | "name" | "recent";
type SortDirection = "asc" | "desc";

interface SearchUsersProps {
  recruiterEmail: string;
}

export function SearchUsers({ recruiterEmail }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Sorting states
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Get available filter options
  const filterOptions = useQuery(api.recruiters.getAvailableFilters);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on new search
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

  const clearFilters = () => {
    setSelectedSkills([]);
    setSortBy("recent");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-4 w-full sm:w-[70%] mx-auto">
        {/* Search Bar */}
        <div className={`
          relative flex-1 transition-all duration-300
          ${isSearchFocused ? 'transform -translate-y-1' : ''}
        `}>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users by username..."
              className="w-full pl-12 pr-10 py-3.5 sm:py-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 
                       rounded-2xl outline-none
                       transition-all duration-300 placeholder:text-gray-400
                       text-base sm:text-lg"
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 
                         hover:bg-gray-100 rounded-full transition-colors
                         group"
                aria-label="Clear search"
              >
                <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            p-4 sm:p-5 rounded-2xl border border-gray-200 
            hover:border-blue-500 transition-all duration-300
            ${showFilters ? 'bg-blue-50 border-blue-500' : 'bg-white/90'}
          `}
        >
          <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="w-full mx-auto bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 space-y-6 animate-slideDown shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Skills</label>
              <select
                multiple
                value={selectedSkills}
                onChange={(e) => setSelectedSkills(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full p-2 border border-gray-200 rounded-lg"
              >
                {filterOptions?.skills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 p-2 border border-gray-200 rounded-lg"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">Name</option>
                  <option value="skills">Skills Count</option>
                </select>
                <button
                  onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
                  className="p-2 border border-gray-200 rounded-lg hover:border-blue-500"
                >
                  <ChevronDown className={`h-5 w-5 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="w-full mx-auto animate-fadeIn">
          <SearchGrid 
            searchQuery={searchQuery}
            filters={{
              skills: selectedSkills
            }}
            sort={sortBy}
            sortDirection={sortDirection}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            recruiterEmail={recruiterEmail}
          />
        </div>
      )}
    </div>
  );
} 
