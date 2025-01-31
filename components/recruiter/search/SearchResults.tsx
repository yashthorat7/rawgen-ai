"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TabType } from "./SearchTabs";
import UserCard from "../UserCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import { SkillCard } from "@/components/skill/SkillCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { CertificateCard } from "@/components/certificate/CertificateCard";
import { SearchFilters } from "./SearchFilters";
import Link from "next/link";
import BookmarkButton from "@/components/ui/Bookmark";

export interface FilterState {
  verified: boolean;
  sortBy: "recent" | "stars" | "projects" | "skills" | "platforms" | "certificates";
  // Platform-specific filters
  platformFilters?: {
    leetcode?: boolean;
    codechef?: boolean;
    codeforces?: boolean;
    geeksforgeeks?: boolean;
    sortByRank?: boolean;
    minRank?: number;
    maxRank?: number;
  };
  // Skill-specific filters
  skillFilters?: {
    searchTerms: string[];
    categories?: string[];
    minSkills?: number;
    maxSkills?: number;
  };
  // Project-specific filters
  projectFilters?: {
    hasDeployment?: boolean;
    hasImage?: boolean;
    techStack?: string[];
    minTechStack?: number;
  };
  // Certificate-specific filters
  certificateFilters?: {
    categories?: string[];
    hasImage?: boolean;
    dateRange?: {
      start?: string;  // ISO date string
      end?: string;    // ISO date string
    };
  };
  // User-specific filters
  userFilters?: {
    hasProfileImage?: boolean;
    isVerified?: boolean;
    minStars?: number;
    minProjects?: number;
    minSkills?: number;
    minPlatforms?: number;
    minCertificates?: number;
  };
}

interface SearchResultsProps {
  tab: TabType;
  searchQuery: string;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  recruiterEmail?: string;
  page: number;
  itemsPerPage: number;
  onTotalItemsChange?: (total: number) => void;
}

const ITEMS_PER_BATCH = 9; // Show 9 items per batch (3x3 grid)

function ProfileCardOverlay({ 
  username, 
  userEmail,
  recruiterEmail,
  isMarked,
  children 
}: { 
  username: string, 
  userEmail: string,
  recruiterEmail?: string,
  isMarked: boolean,
  children: React.ReactNode 
}) {
  const [isBookmarked, setIsBookmarked] = useState(isMarked);

  const handleMarkChange = (newState: boolean) => {
    setIsBookmarked(newState);
    console.log("Bookmark state changed:", {
      username,
      userEmail,
      recruiterEmail,
      newState
    });
  };

  return (
    <div className="relative group">
      <Link 
        href={`/${username}`}
        className="absolute inset-0 z-30 bg-transparent hover:bg-black/5 transition-colors pointer-events-auto cursor-pointer"
      >
        <span className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
          View Full Profile
        </span>
      </Link>
      <div className="absolute top-2 right-2 z-40 pointer-events-auto">
        <BookmarkButton
          recruiterEmail={recruiterEmail}
          userEmail={userEmail}
          isMarked={isBookmarked}
          onMarkChange={handleMarkChange}
        />
      </div>
      <div className="pointer-events-none select-none">
        {children}
      </div>
    </div>
  );
}

export function SearchResults({ 
  tab, 
  searchQuery, 
  filters,
  onFilterChange,
  recruiterEmail,
  page,
  itemsPerPage,
  onTotalItemsChange
}: SearchResultsProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Get recruiter's markstar list
  const recruiterData = useQuery(api.recruiters.getByEmail, { 
    email: recruiterEmail || "" 
  });

  // Memoize the marked emails list
  const markedEmails = useMemo(() => {
    return recruiterData?.markstar || [];
  }, [recruiterData?.markstar]);

  // Function to check if a user is marked
  const isUserMarked = useCallback((email: string) => {
    return markedEmails.includes(email);
  }, [markedEmails]);

  // Reset filters when tab changes
  useEffect(() => {
    const defaultFilters: FilterState = {
      verified: filters.verified,
      sortBy: "recent",
      platformFilters: tab === "platforms" ? {
        leetcode: false,
        codechef: false,
        codeforces: false,
        geeksforgeeks: false,
        sortByRank: false
      } : undefined,
      skillFilters: tab === "skills" ? {
        searchTerms: [],
        categories: []
      } : undefined,
      projectFilters: tab === "projects" ? {
        hasDeployment: false,
        hasImage: false,
        techStack: []
      } : undefined,
      certificateFilters: tab === "internships" ? {
        categories: [],
        hasImage: false
      } : undefined,
      userFilters: tab === "users" ? {
        hasProfileImage: false,
        isVerified: false,
        minStars: undefined,
        minProjects: undefined,
        minSkills: undefined,
        minPlatforms: undefined,
        minCertificates: undefined
      } : undefined
    };
    
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  }, [tab]);

  // Parse search query for skills
  const searchSkills = useMemo(() => {
    if (tab !== "skills" || !searchQuery) return [];
    return searchQuery.split(',').map(s => s.trim()).filter(Boolean);
  }, [searchQuery, tab]);

  // Get search results based on tab type
  const searchResults = useQuery(api.recruiters.searchUsers, {
    query: searchQuery || "",
    filters: {
      verified: filters.verified,
      sortBy: filters.sortBy,
      tab: tab === "users" ? undefined : tab,
      platformFilters: tab === "platforms" ? filters.platformFilters : undefined,
      skillFilters: tab === "skills" ? { ...filters.skillFilters, searchTerms: searchSkills } : undefined,
      projectFilters: tab === "projects" ? filters.projectFilters : undefined,
      certificateFilters: tab === "internships" ? filters.certificateFilters : undefined,
      userFilters: tab === "users" ? filters.userFilters : undefined
    },
    page,
    pageSize: itemsPerPage,
    recruiterEmail
  });

  // Update total items when search results change
  useEffect(() => {
    if (searchResults && onTotalItemsChange) {
      onTotalItemsChange(searchResults.total);
    }
  }, [searchResults?.total, onTotalItemsChange]);

  if (!searchResults) {
    return (
      <div className="w-full min-h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading results...</div>
      </div>
    );
  }

  if (searchResults.users.length === 0) {
    if (!searchQuery && !filters.verified) {
      return (
        <div className="w-full min-h-[200px] flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading {tab}...</div>
        </div>
      );
    }
    return (
      <div className="w-full min-h-[200px] flex items-center justify-center">
        <div className="text-gray-500">
          {searchQuery 
            ? `No ${tab} found matching your search`
            : `No ${tab} found matching your filters`}
        </div>
      </div>
    );
  }

  const startIndex = 0;
  const endIndex = itemsPerPage;
  const visibleUsers = searchResults?.users.slice(startIndex, endIndex) || [];

  const getStringArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.skills && typeof parsed.skills === 'object') {
          return Object.keys(parsed.skills);
        }
        return [];
      } catch {
        // If it's a comma-separated string, split it
        if (value.includes(',')) {
          return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        // If it's a single value, return it as a one-item array
        return value.trim() ? [value.trim()] : [];
      }
    }
    return [];
  };

  const renderCard = (user: any, index: number) => {
    if (!user) return null;

    // Common props for ProfileCardOverlay
    const overlayProps = {
      username: user.username,
      userEmail: user.email,
      recruiterEmail,
      isMarked: isUserMarked(user.email)
    };

    switch (tab) {
      case "users":
        if (!user.username) return null;
        
        // Apply user-specific filters
        if (filters.userFilters) {
          const {
            hasProfileImage,
            minStars,
            minProjects,
            minSkills,
            minPlatforms,
            minCertificates
          } = filters.userFilters;

          if (hasProfileImage && !user.profileImage) return null;
          if (minStars && user.starCount < minStars) return null;
          if (minProjects && user.projectCount < minProjects) return null;
          if (minSkills && user.skillCount < minSkills) return null;
          if (minPlatforms && user.platformCount < minPlatforms) return null;
          if (minCertificates && user.certificateCount < minCertificates) return null;
        }

        return (
          <ProfileCardOverlay {...overlayProps}>
            <UserCard
              username={user.username}
              recruiterEmail={recruiterEmail}
            />
          </ProfileCardOverlay>
        );
      case "skills":
        if (!user.skillCategory) return null;
        const skillsArray = getStringArray(user.skills);
        if (skillsArray.length === 0) return null;
        
        // Apply skill-specific filters
        if (filters.skillFilters) {
          const { categories, minSkills, maxSkills } = filters.skillFilters;
          
          if (categories?.length && !categories.includes(user.skillCategory)) return null;
          if (minSkills && skillsArray.length < minSkills) return null;
          if (maxSkills && skillsArray.length > maxSkills) return null;
        }
        
        // Filter skills based on search query
        const matchingSkills = searchSkills.length > 0 
          ? skillsArray.filter(skill => 
              searchSkills.some(search => 
                skill.toLowerCase().includes(search.toLowerCase())
              )
            )
          : skillsArray;
        
        if (matchingSkills.length === 0) return null;
        
        return (
          <ProfileCardOverlay {...overlayProps}>
            <SkillCard
              category={user.skillCategory}
              skills={matchingSkills}
              index={index}
              isPublicView={true}
              onReorder={undefined}
              onDelete={undefined}
            />
          </ProfileCardOverlay>
        );
      case "projects":
        if (!user.projectTitle || !user.projectDescription) return null;
        const techStackArray = getStringArray(user.techStack);
        
        // Apply project-specific filters
        if (filters.projectFilters) {
          const { hasDeployment, hasImage, techStack, minTechStack } = filters.projectFilters;
          
          if (hasDeployment && !user.deployLink) return null;
          if (hasImage && !user.projectImageUrl) return null;
          if (techStack?.length && !techStack.some(tech => 
            techStackArray.some(t => t.toLowerCase().includes(tech.toLowerCase()))
          )) return null;
          if (minTechStack && techStackArray.length < minTechStack) return null;
        }
        
        // Search in project details
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            user.projectTitle.toLowerCase().includes(searchLower) ||
            user.projectDescription.toLowerCase().includes(searchLower) ||
            techStackArray.some(tech => tech.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return null;
        }
        
        return (
          <ProfileCardOverlay {...overlayProps}>
            <ProjectCard
              id={user.projectId}
              title={user.projectTitle}
              description={user.projectDescription}
              projectLink={user.projectLink}
              deployLink={user.deployLink}
              techStack={techStackArray}
              image={user.projectImageUrl}
              index={index}
              isPublicView={true}
              onReorder={undefined}
              onDelete={undefined}
            />
          </ProfileCardOverlay>
        );
      case "platforms":
        if (!user.platform || !user.platformUsername || !user.userId) return null;
        
        // Apply platform-specific filters
        if (filters.platformFilters) {
          const { 
            leetcode, 
            codechef, 
            codeforces, 
            geeksforgeeks,
            minRank,
            maxRank 
          } = filters.platformFilters;

          const platform = user.platform.toLowerCase();
          const shouldShow = (
            (!leetcode && !codechef && !codeforces && !geeksforgeeks) || // Show all if none selected
            (leetcode && platform === "leetcode") ||
            (codechef && platform === "codechef") ||
            (codeforces && platform === "codeforces") ||
            (geeksforgeeks && platform === "geeksforgeeks")
          );
          
          if (!shouldShow) return null;

          const rank = user.platformData?.rank;
          if (rank !== undefined) {
            if (minRank !== undefined && rank < minRank) return null;
            if (maxRank !== undefined && rank > maxRank) return null;
          }
        }

        // Search in platform data
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesUsername = user.platformUsername.toLowerCase().includes(searchLower);
          const matchesPlatform = user.platform.toLowerCase().includes(searchLower);
          const matchesSkills = user.platformData?.skills?.some(
            (skill: string) => skill.toLowerCase().includes(searchLower)
          );

          if (!matchesUsername && !matchesPlatform && !matchesSkills) return null;
        }

        // Format platform data
        const platformName = user.platform.toLowerCase();
        const formattedPlatformData = {
          [platformName]: {
            [user.platformUsername]: {
              ...user.platformData,
              // Add specific platform data based on platform type
              ...(platformName === 'leetcode' && {
                totalSolved: user.platformData?.totalSolved || 0,
                easySolved: user.platformData?.easySolved || 0,
                mediumSolved: user.platformData?.mediumSolved || 0,
                hardSolved: user.platformData?.hardSolved || 0,
                totalEasy: user.platformData?.totalEasy || 0,
                totalMedium: user.platformData?.totalMedium || 0,
                totalHard: user.platformData?.totalHard || 0,
                ranking: user.platformData?.ranking || 0,
                submitStats: user.platformData?.submitStats || {
                  acSubmissionNum: [],
                  totalSubmissionNum: []
                }
              }),
              ...(platformName === 'codechef' && {
                currentRating: user.platformData?.currentRating || 0,
                highestRating: user.platformData?.highestRating || 0,
                globalRank: user.platformData?.globalRank || 0,
                countryRank: user.platformData?.countryRank || 0,
                stars: user.platformData?.stars || 0,
                submissionStats: user.platformData?.submissionStats || [],
                totalContests: user.platformData?.totalContests || 0,
                countryName: user.platformData?.countryName || ''
              }),
              ...(platformName === 'geeksforgeeks' && {
                codingScore: user.platformData?.codingScore || 0,
                problemsSolved: user.platformData?.problemsSolved || 0,
                monthlyCoding: user.platformData?.monthlyCoding || 0,
                rank: user.platformData?.rank || 0,
                totalProblems: user.platformData?.totalProblems || 0,
                schoolProblems: user.platformData?.schoolProblems || 0,
                basicProblems: user.platformData?.basicProblems || 0,
                easyProblems: user.platformData?.easyProblems || 0,
                mediumProblems: user.platformData?.mediumProblems || 0,
                hardProblems: user.platformData?.hardProblems || 0
              }),
              ...(platformName === 'codeforces' && {
                rating: user.platformData?.rating || 0,
                maxRating: user.platformData?.maxRating || 0,
                rank: user.platformData?.rank || 0,
                maxRank: user.platformData?.maxRank || 0,
                contribution: user.platformData?.contribution || 0,
                friendOfCount: user.platformData?.friendOfCount || 0
              })
            }
          }
        };
        
        return (
          <ProfileCardOverlay {...overlayProps}>
            <ProfileCard
              platform={user.platform}
              username={user.platformUsername}
              index={index}
              isPublicView={true}
              platformData={formattedPlatformData}
            />
          </ProfileCardOverlay>
        );
      case "internships":
        if (!user.certificateTitle || !user.certificateCategory) return null;
        
        // Apply certificate-specific filters
        if (filters.certificateFilters) {
          const { categories, hasImage, dateRange } = filters.certificateFilters;
          
          if (categories?.length && !categories.includes(user.certificateCategory)) return null;
          if (hasImage && !user.certificateImageUrl) return null;
          
          if (dateRange) {
            const certDate = new Date(user.certificateDate);
            if (dateRange.start && certDate < new Date(dateRange.start)) return null;
            if (dateRange.end && certDate > new Date(dateRange.end)) return null;
          }
        }
        
        // Search in certificate details
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            user.certificateTitle.toLowerCase().includes(searchLower) ||
            user.certificateCategory.toLowerCase().includes(searchLower) ||
            user.certificateDescription.toLowerCase().includes(searchLower);
          
          if (!matchesSearch) return null;
        }
        
        return (
          <ProfileCardOverlay {...overlayProps}>
            <CertificateCard
              id={user.certificateId}
              title={user.certificateTitle}
              category={user.certificateCategory}
              description={user.certificateDescription}
              image={user.certificateImageUrl}
              index={index}
              isPublicView={true}
              onReorder={undefined}
              onDelete={undefined}
            />
          </ProfileCardOverlay>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <SearchFilters
          tab={tab}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleUsers.map((user: any, index: number) => {
          const card = renderCard(user, index);
          if (!card) return null;

          const uniqueKey = (() => {
            switch (tab) {
              case "platforms":
                return `${user.username}-${user.platform}-${user.platformUsername}`;
              case "skills":
                return `${user.username}-${user.skillCategory}-${index}`;
              case "projects":
                return `${user.username}-${user.projectId || index}`;
              case "internships":
                return `${user.username}-${user.certificateId || index}`;
              default:
                return `${user.username}-${index}`;
            }
          })();

          return (
            <div
              key={uniqueKey}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
} 