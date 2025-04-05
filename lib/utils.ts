import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect } from 'react';
import { Id } from "../convex/_generated/dataModel";
import { extractEssentialPlatformData } from "./extractors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [lock]);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Function to prepare platform profile data for saving
export async function preparePlatformProfileData(
  platform: string, 
  username: string
): Promise<{ statsData: string }> {
  try {
    // Extract only the essential data needed for platform cards
    const essentialData = await extractEssentialPlatformData(platform, username);
    
    // If extraction failed, provide an empty object as default
    if (!essentialData) {
      console.error(`Failed to extract essential ${platform} data for ${username}`);
      return {
        statsData: JSON.stringify({})
      };
    }
    
    // Convert to JSON string for storage
    return {
      statsData: JSON.stringify(essentialData)
    };
  } catch (error) {
    console.error(`Error preparing ${platform} profile data:`, error);
    // Return empty object as default in case of error
    return {
      statsData: JSON.stringify({})
    };
  }
}

// Function to get default statsData for a platform if none exists
export function getDefaultStatsData(platformName: string): string {
  switch (platformName.toLowerCase()) {
    case 'leetcode':
      return JSON.stringify({
        ranking: 0,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalEasy: 0,
        totalMedium: 0,
        totalHard: 0
      });
    case 'codechef':
      return JSON.stringify({
        stars: 0,
        currentRating: 0,
        highestRating: 0,
        globalRank: 0,
        countryRank: 0,
        countryName: '',
        totalContests: 0
      });
    case 'geeksforgeeks':
      return JSON.stringify({
        codingScore: 0,
        problemsSolved: 0,
        easyProblems: 0,
        mediumProblems: 0,
        hardProblems: 0,
        currentStreak: 0,
        rank: 0
      });
    case 'codeforces':
      return JSON.stringify({
        rank: '',
        rating: 0,
        maxRating: 0,
        maxRank: '',
        contribution: 0,
        friendOfCount: 0
      });
    default:
      return JSON.stringify({});
  }
}
