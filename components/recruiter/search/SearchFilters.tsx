"use client";

import { useState, useEffect } from "react";
import { TabType } from "./SearchTabs";
import { FilterState } from "./SearchResults";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  tab: TabType;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Helper function to ensure all platform values are boolean
const updatePlatforms = (
  currentPlatforms: Partial<FilterState['platforms']> | undefined,
  platform: string,
  checked: boolean
): FilterState['platforms'] => {
  return {
    leetcode: platform === 'leetcode' ? checked : currentPlatforms?.leetcode || false,
    codechef: platform === 'codechef' ? checked : currentPlatforms?.codechef || false,
    codeforces: platform === 'codeforces' ? checked : currentPlatforms?.codeforces || false,
    geeksforgeeks: platform === 'geeksforgeeks' ? checked : currentPlatforms?.geeksforgeeks || false,
  };
};

export function SearchFilters({
  tab,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange
}: SearchFiltersProps) {
  const [localSearchTerms, setLocalSearchTerms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [projectNameSearch, setProjectNameSearch] = useState("");

  // Handle input submission for skills/tech stack
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const newTerm = inputValue.trim();
      if (!localSearchTerms.includes(newTerm)) {
        const updatedTerms = [...localSearchTerms, newTerm];
        setLocalSearchTerms(updatedTerms);
        if (tab === "skills") {
          onFilterChange({ ...filters, searchTerms: updatedTerms });
        } else if (tab === "projects") {
          onFilterChange({ ...filters, techStack: updatedTerms });
        }
      }
      setInputValue("");
    }
  };

  // Remove search term
  const removeSearchTerm = (term: string) => {
    const updatedTerms = localSearchTerms.filter(t => t !== term);
    setLocalSearchTerms(updatedTerms);
    if (tab === "skills") {
      onFilterChange({ ...filters, searchTerms: updatedTerms });
    } else if (tab === "projects") {
      onFilterChange({ ...filters, techStack: updatedTerms });
    }
  };

  const showTagInput = tab === "skills" || tab === "projects";

  return (
    <div className="space-y-4">
      {/* Search Bars Section */}
      <div className="grid gap-4">
        {/* Project Search - Two Search Bars */}
        {tab === "projects" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search project names..."
                value={projectNameSearch}
                onChange={(e) => {
                  setProjectNameSearch(e.target.value);
                  onSearchChange(e.target.value);
                }}
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Add tech stack..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="text-xs">Press Enter to add</span>
              </div>
            </div>
          </div>
        )}
        {/* Regular Search Bar for Other Tabs */}
        {tab !== "projects" && (
          <div className="relative">
            <Input
              type="text"
              placeholder={tab === "platforms" ? "Search usernames..." : `Search ${tab}...`}
              value={showTagInput ? inputValue : searchQuery}
              onChange={(e) => {
                if (showTagInput) {
                  setInputValue(e.target.value);
                } else {
                  onSearchChange(e.target.value);
                }
              }}
              onKeyDown={showTagInput ? handleInputKeyDown : undefined}
              className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showTagInput ? (
                <span className="text-xs">Press Enter to add</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tags Display */}
      {showTagInput && localSearchTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {localSearchTerms.map((term) => (
            <Badge
              key={term}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
            >
              {term}
              <X
                className="h-3 w-3 cursor-pointer hover:text-primary-800"
                onClick={() => removeSearchTerm(term)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Users Tab Filters */}
        {tab === "users" && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-users"
                checked={filters.verified}
                onCheckedChange={(checked) => onFilterChange({ ...filters, verified: !!checked })}
              />
              <label htmlFor="verified-users" className="text-sm font-medium">
                Verified Users
              </label>
            </div>
            <Button
              variant={filters.sortBy === "stars" ? "default" : "outline"}
              onClick={() => onFilterChange({ ...filters, sortBy: "stars" })}
              size="sm"
              className="w-full sm:w-auto"
            >
              Sort by Stars
            </Button>
            <Button
              variant={filters.sortBy === "projects" ? "default" : "outline"}
              onClick={() => onFilterChange({ ...filters, sortBy: "projects" })}
              size="sm"
              className="w-full sm:w-auto"
            >
              Sort by Projects
            </Button>
          </>
        )}

        {/* Skills Tab Filters */}
        {tab === "skills" && (
          <Button
            variant={filters.sortBy === "skills" ? "default" : "outline"}
            onClick={() => onFilterChange({ ...filters, sortBy: "skills" })}
            size="sm"
            className="w-full sm:w-auto"
          >
            Sort by Number of Skills
          </Button>
        )}

        {/* Platforms Tab Filters */}
        {tab === "platforms" && (
          <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["leetcode", "codechef", "codeforces", "geeksforgeeks"].map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={`platform-${platform}`}
                  checked={filters.platforms?.[platform as keyof typeof filters.platforms] || false}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      ...filters,
                      platforms: updatePlatforms(filters.platforms, platform, !!checked)
                    });
                  }}
                />
                <label htmlFor={`platform-${platform}`} className="text-sm font-medium capitalize">
                  {platform}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Projects Tab Filters */}
        {tab === "projects" && (
          <div className="col-span-full flex items-center space-x-2">
            <Checkbox
              id="has-deployment"
              checked={filters.hasDeployment}
              onCheckedChange={(checked) => {
                onFilterChange({ ...filters, hasDeployment: !!checked });
              }}
            />
            <label htmlFor="has-deployment" className="text-sm font-medium">
              Has Deployment
            </label>
          </div>
        )}
      </div>
    </div>
  );
} 