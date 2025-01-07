"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { extractLeetCodeData } from "./extractors/leetcodeExtractor";
import { extractCodeChefData } from "./extractors/codechefExtractor";
import { extractGeeksForGeeksData } from "./extractors/geeksforgeeksExtractor";
import type { LeetCodeData, CodeChefData, GeeksForGeeksData } from './types';

type PlatformData = {
  leetcode: Record<string, LeetCodeData | null>;
  codechef: Record<string, CodeChefData | null>;
  geeksforgeeks: Record<string, GeeksForGeeksData | null>;
};

type Platform = {
  id: string;
  platform: string;
  username: string;
};

type PlatformContextType = {
  platforms: Platform[];
  platformData: PlatformData;
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
    geeksforgeeks: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      const newPlatformData = { ...platformData };

      for (const { platform, username } of platforms) {
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
        }
      }

      setPlatformData(newPlatformData);
    };

    fetchData();
  }, [platforms]);

  const addPlatform = (platform: string, username: string) => {
    setPlatforms([...platforms, {
      id: Math.random().toString(36).slice(2),
      platform,
      username
    }]);
  };

  const removePlatform = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
  };

  const reorderPlatforms = (fromIndex: number, toIndex: number) => {
    const updatedPlatforms = [...platforms];
    const [movedPlatform] = updatedPlatforms.splice(fromIndex, 1);
    updatedPlatforms.splice(toIndex, 0, movedPlatform);
    setPlatforms(updatedPlatforms);
  };

  return (
    <PlatformContext.Provider value={{ platforms, platformData, addPlatform, removePlatform, reorderPlatforms }}>
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