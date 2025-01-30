"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SearchTabs, TabType } from "./SearchTabs";
import { SearchResults, FilterState } from "./SearchResults";
import { useUser } from "@clerk/nextjs";
import { Star, Award, FolderKanban, Code, Verified } from "lucide-react";
import { SearchBar } from "./SearchBar";

// Sort options type
type SortOption = FilterState["sortBy"];

// Sort options configuration
const sortOptions = [
  { id: "recent" as const, label: "Most Recent", icon: null },
  { id: "stars" as const, label: "Most Stars", icon: Star },
  { id: "projects" as const, label: "Most Projects", icon: FolderKanban },
  { id: "skills" as const, label: "Most Skills", icon: Award },
  { id: "platforms" as const, label: "Most Platforms", icon: Code },
  { id: "certificates" as const, label: "Most Certificates", icon: Award }
];

export function SearchContainer() {
  const { user } = useUser();
  const recruiterEmail = user?.primaryEmailAddress?.emailAddress;

  // State for search and filters
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    verified: false,
    sortBy: "recent",
    platformFilters: {
      leetcode: false,
      codechef: false,
      codeforces: false,
      geeksforgeeks: false,
      sortByRank: false,
      minRank: 0,
      maxRank: 0
    },
    skillFilters: {
      searchTerms: [],
      categories: [],
      minSkills: 0,
      maxSkills: 0
    },
    projectFilters: {
      hasDeployment: false,
      hasImage: false,
      techStack: [],
      minTechStack: 0
    },
    certificateFilters: {
      categories: [],
      hasImage: false,
      dateRange: {
        start: "",
        end: ""
      }
    },
    userFilters: {
      hasProfileImage: false,
      minStars: 0,
      minProjects: 0,
      minSkills: 0,
      minPlatforms: 0,
      minCertificates: 0
    }
  });

  // Get available skills for filter
  const availableSkills = useQuery(api.skills.getAllSkills) || [];

  // Handler for filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full space-y-4">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={`Search ${activeTab}...`}
      />
      <SearchTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <SearchResults
        tab={activeTab}
        searchQuery={searchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        recruiterEmail={recruiterEmail}
      />
    </div>
  );
} 