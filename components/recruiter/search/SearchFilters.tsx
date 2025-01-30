"use client";

import { useState } from "react";
import { TabType } from "./SearchTabs";
import { FilterState } from "./SearchResults";
import { 
  Filter, 
  SlidersHorizontal, 
  Star, 
  Briefcase, 
  Code2, 
  Award,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface SearchFiltersProps {
  tab: TabType;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function SearchFilters({ tab, filters, onFilterChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...updates });
  };

  // Common filters that appear at the top of every tab
  const renderCommonFilters = () => (
    <div className="space-y-4 mb-6 border-b pb-4">
      <div className="font-medium">Sort & Filter</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => updateFilters({ verified: e.target.checked })}
            className="rounded text-primary-600"
          />
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-primary-500" />
            Verified Only
          </span>
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value as FilterState["sortBy"] })}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="stars">Most Stars</option>
          <option value="projects">Most Projects</option>
          <option value="skills">Most Skills</option>
          <option value="platforms">Most Platforms</option>
          <option value="certificates">Most Certificates</option>
        </select>
      </div>
    </div>
  );

  const renderTabFilters = () => {
    switch (tab) {
      case "users":
        return (
          <div className="space-y-4">
            <div className="font-medium">User Filters</div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.userFilters?.hasProfileImage}
                  onChange={(e) => updateFilters({
                    userFilters: {
                      ...filters.userFilters,
                      hasProfileImage: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>Has Profile Image</span>
              </label>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Minimum Requirements</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Stars</label>
                  <input
                    type="number"
                    min={0}
                    value={filters.userFilters?.minStars || 0}
                    onChange={(e) => updateFilters({
                      userFilters: {
                        ...filters.userFilters,
                        minStars: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Projects</label>
                  <input
                    type="number"
                    min={0}
                    value={filters.userFilters?.minProjects || 0}
                    onChange={(e) => updateFilters({
                      userFilters: {
                        ...filters.userFilters,
                        minProjects: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "platforms":
        return (
          <div className="space-y-4">
            <div className="font-medium">Platform Filters</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.platformFilters?.leetcode}
                  onChange={(e) => updateFilters({
                    platformFilters: {
                      ...filters.platformFilters,
                      leetcode: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>LeetCode</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.platformFilters?.codechef}
                  onChange={(e) => updateFilters({
                    platformFilters: {
                      ...filters.platformFilters,
                      codechef: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>CodeChef</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.platformFilters?.codeforces}
                  onChange={(e) => updateFilters({
                    platformFilters: {
                      ...filters.platformFilters,
                      codeforces: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>Codeforces</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.platformFilters?.geeksforgeeks}
                  onChange={(e) => updateFilters({
                    platformFilters: {
                      ...filters.platformFilters,
                      geeksforgeeks: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>GeeksForGeeks</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.platformFilters?.sortByRank}
                  onChange={(e) => updateFilters({
                    platformFilters: {
                      ...filters.platformFilters,
                      sortByRank: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Sort by Rank
                </span>
              </label>
              {filters.platformFilters?.sortByRank && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm">Min Rank</label>
                    <input
                      type="number"
                      min={0}
                      value={filters.platformFilters?.minRank || 0}
                      onChange={(e) => updateFilters({
                        platformFilters: {
                          ...filters.platformFilters,
                          minRank: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Max Rank</label>
                    <input
                      type="number"
                      min={0}
                      value={filters.platformFilters?.maxRank || 0}
                      onChange={(e) => updateFilters({
                        platformFilters: {
                          ...filters.platformFilters,
                          maxRank: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            <div className="font-medium">Skill Filters</div>
            <div className="space-y-2">
              <div>
                <label className="text-sm">Skill Categories</label>
                <select
                  multiple
                  value={filters.skillFilters?.categories || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    updateFilters({
                      skillFilters: {
                        searchTerms: filters.skillFilters?.searchTerms || [],
                        categories: selected
                      }
                    });
                  }}
                  className="w-full px-2 py-1 border rounded"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="devops">DevOps</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Min Skills</label>
                  <input
                    type="number"
                    min={0}
                    value={filters.skillFilters?.minSkills || 0}
                    onChange={(e) => updateFilters({
                      skillFilters: {
                        ...filters.skillFilters,
                        searchTerms: filters.skillFilters?.searchTerms || [],
                        minSkills: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Max Skills</label>
                  <input
                    type="number"
                    min={0}
                    value={filters.skillFilters?.maxSkills || 0}
                    onChange={(e) => updateFilters({
                      skillFilters: {
                        ...filters.skillFilters,
                        searchTerms: filters.skillFilters?.searchTerms || [],
                        maxSkills: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4">
            <div className="font-medium">Project Filters</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.projectFilters?.hasDeployment}
                  onChange={(e) => updateFilters({
                    projectFilters: {
                      ...filters.projectFilters,
                      hasDeployment: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>Has Deployment</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.projectFilters?.hasImage}
                  onChange={(e) => updateFilters({
                    projectFilters: {
                      ...filters.projectFilters,
                      hasImage: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>Has Image</span>
              </label>
            </div>
            <div>
              <label className="text-sm">Tech Stack (comma-separated)</label>
              <input
                type="text"
                value={filters.projectFilters?.techStack?.join(", ") || ""}
                onChange={(e) => updateFilters({
                  projectFilters: {
                    ...filters.projectFilters,
                    techStack: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }
                })}
                className="w-full px-2 py-1 border rounded"
                placeholder="React, Node.js, etc."
              />
            </div>
            <div>
              <label className="text-sm">Min Tech Stack Size</label>
              <input
                type="number"
                min={0}
                value={filters.projectFilters?.minTechStack || 0}
                onChange={(e) => updateFilters({
                  projectFilters: {
                    ...filters.projectFilters,
                    minTechStack: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          </div>
        );

      case "internships":
        return (
          <div className="space-y-4">
            <div className="font-medium">Certificate Filters</div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.certificateFilters?.hasImage}
                  onChange={(e) => updateFilters({
                    certificateFilters: {
                      ...filters.certificateFilters,
                      hasImage: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span>Has Image</span>
              </label>
            </div>
            <div>
              <label className="text-sm">Categories</label>
              <select
                multiple
                value={filters.certificateFilters?.categories || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  updateFilters({
                    certificateFilters: {
                      ...filters.certificateFilters,
                      categories: selected
                    }
                  });
                }}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="internship">Internship</option>
                <option value="course">Course</option>
                <option value="certification">Certification</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Date Range</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Start Date</label>
                  <input
                    type="date"
                    value={filters.certificateFilters?.dateRange?.start || ""}
                    onChange={(e) => updateFilters({
                      certificateFilters: {
                        ...filters.certificateFilters,
                        dateRange: {
                          ...filters.certificateFilters?.dateRange,
                          start: e.target.value
                        }
                      }
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">End Date</label>
                  <input
                    type="date"
                    value={filters.certificateFilters?.dateRange?.end || ""}
                    onChange={(e) => updateFilters({
                      certificateFilters: {
                        ...filters.certificateFilters,
                        dateRange: {
                          ...filters.certificateFilters?.dateRange,
                          end: e.target.value
                        }
                      }
                    })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getFilterIcon = () => {
    switch (tab) {
      case "users":
        return <Star className="w-4 h-4" />;
      case "projects":
        return <Briefcase className="w-4 h-4" />;
      case "skills":
        return <Code2 className="w-4 h-4" />;
      case "platforms":
        return <Filter className="w-4 h-4" />;
      case "internships":
        return <Award className="w-4 h-4" />;
      default:
        return <SlidersHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm"
      >
        {getFilterIcon()}
        <span>Filters</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white border rounded-lg shadow-sm p-4">
        {renderTabFilters()}
      </div>

      {/* Mobile Filters Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-80 bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Filters</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
              {renderTabFilters()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 