"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { extractLeetCodeData } from "./extractors/leetcodeExtractor";
import { extractCodeChefData } from "./extractors/codechefExtractor";
import { extractGeeksForGeeksData } from "./extractors/geeksforgeeksExtractor";
import { extractCodeforcesData } from "./extractors/codeforcesExtractor";
import type { LeetCodeData, CodeChefData, GeeksForGeeksData, CodeforcesData } from './types';

type PlatformData = {
  leetcode: Record<string, LeetCodeData | null>;
  codechef: Record<string, CodeChefData | null>;
  geeksforgeeks: Record<string, GeeksForGeeksData | null>;
  codeforces: Record<string, CodeforcesData | null>;
};

type Platform = {
  id: string;
  platform: string;
  username: string;
  order: number;
};

type PlatformContextType = {
  platforms: Platform[];
  platformData: PlatformData;
  isLoading: Record<string, boolean>;
  addPlatform: (platform: string, username: string) => void;
  removePlatform: (id: string) => void;
  reorderPlatforms: (fromIndex: number, toIndex: number) => void;
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData>({
    leetcode: {},
    codechef: {},
    geeksforgeeks: {},
    codeforces: {}
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Load platforms from localStorage on mount
  useEffect(() => {
    const savedPlatforms = localStorage.getItem('platforms');
    if (savedPlatforms) {
      setPlatforms(JSON.parse(savedPlatforms));
    }
  }, []);

  // Save platforms to localStorage when they change
  useEffect(() => {
    localStorage.setItem('platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    const fetchData = async () => {
      const newPlatformData = { ...platformData };
      const newLoadingState = { ...isLoading };

      // Set all loading states first
      for (const { platform, username } of platforms) {
        const key = `${platform}-${username}`;
        newLoadingState[key] = true;
      }
      setIsLoading(newLoadingState);

      // Then fetch data
      for (const { platform, username } of platforms) {
        const key = `${platform}-${username}`;
        try {
          switch (platform) {
            case 'leetcode':
              if (!platformData.leetcode[username]) {
                newPlatformData.leetcode[username] = await extractLeetCodeData(username);
              }
              break;
            case 'codechef':
              if (!platformData.codechef[username]) {
                newPlatformData.codechef[username] = await extractCodeChefData(username);
              }
              break;
            case 'geeksforgeeks':
              if (!platformData.geeksforgeeks[username]) {
                newPlatformData.geeksforgeeks[username] = await extractGeeksForGeeksData(username);
              }
              break;
            case 'codeforces':
              if (!platformData.codeforces[username]) {
                newPlatformData.codeforces[username] = await extractCodeforcesData(username);
              }
              break;
          }
        } finally {
          newLoadingState[key] = false;
          setIsLoading(newLoadingState);
        }
      }

      setPlatformData(newPlatformData);
    };

    fetchData();
  }, [platforms]);

  const addPlatform = (platform: string, username: string) => {
    setPlatforms(currentPlatforms => {
      const maxOrder = Math.max(...currentPlatforms.map(p => p.order), -1);
      return [...currentPlatforms, {
        id: Math.random().toString(36).slice(2),
        platform,
        username,
        order: maxOrder + 1
      }];
    });
  };

  const removePlatform = (id: string) => {
    setPlatforms(currentPlatforms => {
      const filteredPlatforms = currentPlatforms.filter(p => p.id !== id);
      return filteredPlatforms.map((platform, index) => ({
        ...platform,
        order: index
      }));
    });
  };

  const reorderPlatforms = (fromIndex: number, toIndex: number) => {
    setPlatforms(currentPlatforms => {
      const newPlatforms = [...currentPlatforms];
      const [movedPlatform] = newPlatforms.splice(fromIndex, 1);
      newPlatforms.splice(toIndex, 0, movedPlatform);
      
      // Update order for all platforms
      return newPlatforms.map((platform, index) => ({
        ...platform,
        order: index
      }));
    });
  };

  // Sort platforms by order when rendering
  const sortedPlatforms = [...platforms].sort((a, b) => a.order - b.order);

  return (
    <PlatformContext.Provider value={{ 
      platforms: sortedPlatforms, // Use sorted platforms
      platformData, 
      isLoading,
      addPlatform, 
      removePlatform, 
      reorderPlatforms 
    }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatforms() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatforms must be used within a PlatformProvider');
  }
  return context;
} 