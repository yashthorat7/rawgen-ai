"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { SearchFilters as ApiSearchFilters } from "@/convex/recruiters";
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
  sortBy:
    | "recent"
    | "stars"
    | "projects"
    | "skills"
    | "platforms"
    | "certificates";
  platforms?: {
    leetcode: boolean;
    codechef: boolean;
    codeforces: boolean;
    geeksforgeeks: boolean;
  };
  searchTerms?: string[];
  techStack?: string[];
  hasDeployment?: boolean;
  categories?: string[];
  projectNameSearch?: string;
  certificateSearch?: string;
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

const ITEMS_PER_BATCH = 9;

interface ProfileCardOverlayProps {
  username: string;
  userEmail: string;
  recruiterEmail?: string;
  isMarked: boolean;
  children: React.ReactNode;
  showRedirect?: boolean;
}

function ProfileCardOverlay({
  username,
  userEmail,
  recruiterEmail,
  isMarked,
  children,
  showRedirect = true,
}: ProfileCardOverlayProps) {
  const [isBookmarked, setIsBookmarked] = useState(isMarked);

  const handleMarkChange = (newState: boolean) => {
    setIsBookmarked(newState);
  };

  return (
    <div className="relative group h-full">
      {showRedirect && (
        <Link
          href={`/${username}`}
          className="absolute inset-0 z-30 bg-transparent hover:bg-black/5 transition-colors pointer-events-auto cursor-pointer"
        >
          <span className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            View Full Profile
          </span>
        </Link>
      )}
      <div className="absolute top-2 right-2 z-40 pointer-events-auto">
        <BookmarkButton
          recruiterEmail={recruiterEmail}
          userEmail={userEmail}
          isMarked={isBookmarked}
          onMarkChange={handleMarkChange}
        />
      </div>
      <div
        className={`pointer-events-none select-none h-full ${!showRedirect ? "pointer-events-auto" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

interface SearchFilters {
  verified: boolean;
  sortBy: FilterState["sortBy"];
  tab: TabType;
  platforms?: FilterState["platforms"];
  searchTerms?: string[];
  techStack?: string[];
  hasDeployment?: boolean;
  categories?: string[];
  sortByRank?: boolean;
  legendaryGrandmaster?: boolean;
  sortByStars?: boolean;
}

const SearchResults = ({
  tab,
  searchQuery,
  filters,
  onFilterChange,
  recruiterEmail,
  page,
  itemsPerPage,
  onTotalItemsChange,
}: SearchResultsProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [visibleCardCount, setVisibleCardCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setVisibleCardCount(0);
    setIsInitialLoad(true);

    const timer = setTimeout(() => {
      setIsInitialLoad(false);
      const renderCards = () => {
        setVisibleCardCount((prev) => {
          const next = Math.min(prev + 1, itemsPerPage);
          return next;
        });
      };

      let currentCard = 0;
      const interval = setInterval(() => {
        renderCards();
        currentCard++;
        if (currentCard >= itemsPerPage) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, itemsPerPage]);

  const recruiterData = useQuery(api.recruiters.getByEmail, {
    email: recruiterEmail || "",
  });

  const markedEmails = useMemo(() => {
    return recruiterData?.markstar || [];
  }, [recruiterData?.markstar]);

  const isUserMarked = useCallback(
    (email: string) => {
      return markedEmails.includes(email);
    },
    [markedEmails],
  );

  useEffect(() => {
    const defaultFilters: FilterState = {
      verified: false,
      sortBy: "recent",
      platforms:
        tab === "platforms"
          ? {
              leetcode: false,
              codechef: false,
              codeforces: false,
              geeksforgeeks: false,
            }
          : undefined,
      searchTerms: tab === "skills" ? [] : undefined,
      techStack: tab === "projects" ? [] : undefined,
      hasDeployment: tab === "projects" ? false : undefined,
      categories: tab === "certificates" ? [] : undefined,
      projectNameSearch: tab === "projects" ? "" : undefined,
      certificateSearch: tab === "certificates" ? "" : undefined,
    };

    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  }, [tab, onFilterChange]);

  const searchSkills = useMemo(() => {
    if (tab !== "skills" || !searchQuery) return [];
    return searchQuery
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [searchQuery, tab]);

  const searchResults = useQuery(api.recruiters.searchUsers, {
    query:
      tab === "projects"
        ? filters.projectNameSearch || ""
        : tab === "certificates"
          ? filters.certificateSearch || ""
          : searchQuery || "",
    filters: {
      verified: filters.verified,
      sortBy: filters.sortBy,
      tab,
      platformFilters:
        tab === "platforms"
          ? {
              leetcode: filters.platforms?.leetcode || false,
              codechef: filters.platforms?.codechef || false,
              codeforces: filters.platforms?.codeforces || false,
              geeksforgeeks: filters.platforms?.geeksforgeeks || false,
            }
          : undefined,
      skillFilters:
        tab === "skills"
          ? {
              searchTerms: filters.searchTerms || [],
            }
          : undefined,
      projectFilters:
        tab === "projects"
          ? {
              hasDeployment: filters.hasDeployment,
              techStack: filters.techStack,
              projectNameSearch: filters.projectNameSearch,
            }
          : undefined,
      certificateFilters:
        tab === "certificates"
          ? {
              categories: filters.categories || [],
              certificateSearch: filters.certificateSearch,
            }
          : undefined,
      userFilters:
        tab === "users"
          ? {
              isVerified: filters.verified,
            }
          : undefined,
    },
    page,
    pageSize: itemsPerPage,
    recruiterEmail,
  });

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
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.skills && typeof parsed.skills === "object") {
          return Object.keys(parsed.skills);
        }
        return [];
      } catch {
        if (value.includes(",")) {
          return value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return value.trim() ? [value.trim()] : [];
      }
    }
    return [];
  };

  const renderCard = (user: any, index: number) => {
    if (!user) return null;

    const overlayProps = {
      username: user.username,
      userEmail: user.email,
      recruiterEmail,
      isMarked: isUserMarked(user.email),
    };

    switch (tab) {
      case "users":
        if (!user.username) return null;

        if (filters.verified && !user.isverified) return null;

        return (
          <ProfileCardOverlay {...overlayProps} showRedirect={false}>
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

        const hasMatchingSkills =
          !filters.searchTerms?.length ||
          skillsArray.some((skill) =>
            filters.searchTerms?.some((search) =>
              skill.toLowerCase().includes(search.toLowerCase()),
            ),
          );

        if (!hasMatchingSkills) return null;

        return (
          <ProfileCardOverlay {...overlayProps}>
            <SkillCard
              category={user.skillCategory}
              skills={skillsArray}
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

        if (filters.techStack) {
          const { hasDeployment, techStack } = filters;

          if (hasDeployment && !user.deployLink) return null;
          if (
            techStack?.length &&
            !techStack.some((tech) =>
              techStackArray.some((t) =>
                t.toLowerCase().includes(tech.toLowerCase()),
              ),
            )
          )
            return null;
        }

        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch =
            user.projectTitle.toLowerCase().includes(searchLower) ||
            user.projectDescription.toLowerCase().includes(searchLower) ||
            techStackArray.some((tech) =>
              tech.toLowerCase().includes(searchLower),
            );

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
        if (!user.platform || !user.platformUsername || !user.userId)
          return null;

        if (filters.platforms) {
          const { leetcode, codechef, codeforces, geeksforgeeks } =
            filters.platforms;

          const platform = user.platform.toLowerCase();
          const shouldShow =
            (!leetcode && !codechef && !codeforces && !geeksforgeeks) ||
            (leetcode && platform === "leetcode") ||
            (codechef && platform === "codechef") ||
            (codeforces && platform === "codeforces") ||
            (geeksforgeeks && platform === "geeksforgeeks");

          if (!shouldShow) return null;
        }

        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesUsername = user.platformUsername
            .toLowerCase()
            .includes(searchLower);
          const matchesPlatform = user.platform
            .toLowerCase()
            .includes(searchLower);
          const matchesSkills = user.platformData?.skills?.some(
            (skill: string) => skill.toLowerCase().includes(searchLower),
          );

          if (!matchesUsername && !matchesPlatform && !matchesSkills)
            return null;
        }

        const platformName = user.platform.toLowerCase();
        const formattedPlatformData = {
          [platformName]: {
            [user.platformUsername]: {
              ...user.platformData,
              ...(platformName === "leetcode" && {
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
                  totalSubmissionNum: [],
                },
              }),
              ...(platformName === "codechef" && {
                currentRating: user.platformData?.currentRating || 0,
                highestRating: user.platformData?.highestRating || 0,
                globalRank: user.platformData?.globalRank || 0,
                countryRank: user.platformData?.countryRank || 0,
                stars: user.platformData?.stars || 0,
                submissionStats: user.platformData?.submissionStats || [],
                totalContests: user.platformData?.totalContests || 0,
                countryName: user.platformData?.countryName || "",
              }),
            },
          },
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
      case "certificates":
        if (!user.certificateTitle || !user.certificateCategory) return null;

        if (filters.categories) {
          const { categories } = filters;

          if (
            categories?.length &&
            !categories.includes(user.certificateCategory)
          )
            return null;
        }

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

  const filteredUsers = visibleUsers
    .filter((user): user is any => user !== null)
    .flatMap((user) => (Array.isArray(user) ? user : [user]));

  let sortedUsers = [...filteredUsers];

  switch (localFilters.sortBy) {
    case "stars":
      sortedUsers.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
      break;
    case "projects":
      sortedUsers.sort((a, b) => (b.projectCount || 0) - (a.projectCount || 0));
      break;
    case "skills":
      sortedUsers.sort((a, b) => (b.skillCount || 0) - (a.skillCount || 0));
      break;
    case "platforms":
      sortedUsers.sort(
        (a, b) => (b.platformCount || 0) - (a.platformCount || 0),
      );
      break;
    case "certificates":
      sortedUsers.sort(
        (a, b) => (b.certificateCount || 0) - (a.certificateCount || 0),
      );
      break;
    case "recent":
    default:
      sortedUsers.sort((a, b) => {
        const dateA = new Date(a._creationTime || 0);
        const dateB = new Date(b._creationTime || 0);
        return dateB.getTime() - dateA.getTime();
      });
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 auto-rows-fr">
        {sortedUsers
          .slice(0, visibleCardCount)
          .map((user: any, index: number) => {
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
                case "certificates":
                  return `${user.username}-${user.certificateId || index}`;
                default:
                  return `${user.username}-${index}`;
              }
            })();

            return (
              <div
                key={uniqueKey}
                className={`transition-all duration-300 ease-in-out ${
                  isInitialLoad
                    ? "opacity-0 translate-y-4"
                    : "opacity-100 translate-y-0"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="h-full">{card}</div>
              </div>
            );
          })}

        {visibleCardCount < itemsPerPage &&
          sortedUsers.length > 0 &&
          Array.from({ length: itemsPerPage - visibleCardCount }).map(
            (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="animate-pulse bg-gray-100 rounded-lg h-[300px]"
              />
            ),
          )}
      </div>
    </div>
  );
};

export default SearchResults;
