"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
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
  platform: string;
  username: string;
  order: number;
};

type PlatformContextType = {
  platforms: Platform[];
  platformData: PlatformData;
  isLoading: Record<string, boolean>;
  isInitialLoading: boolean;
  profileCount: number;
  addPlatform: (platform: string, username: string) => void;
  removePlatform: (platform: string, username: string) => void;
  reorderPlatforms: (fromIndex: number, toIndex: number) => void;
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  // Convex mutations and queries
  const addPlatformMutation = useMutation(api.profiles.addPlatform);
  const deletePlatformMutation = useMutation(api.profiles.deletePlatform);
  const updateOrderMutation = useMutation(api.profiles.updateOrder);
  const profiles = useQuery(api.profiles.getProfiles, 
    userEmail ? { email: userEmail } : "skip"
  );

  const [platformData, setPlatformData] = useState<PlatformData>({
    leetcode: {},
    codechef: {},
    geeksforgeeks: {},
    codeforces: {}
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch platform data whenever profiles change
  useEffect(() => {
    if (!profiles) return;

    const fetchData = async () => {
      setIsInitialLoading(true);
      const newPlatformData = { ...platformData };
      const newLoadingState = { ...isLoading };

      try {
        for (const profile of profiles) {
          const key = `${profile.platform}-${profile.username}`;
          newLoadingState[key] = true;
          setIsLoading(newLoadingState);

          try {
            switch (profile.platform) {
              case 'leetcode':
                newPlatformData.leetcode[profile.username] = 
                  await extractLeetCodeData(profile.username);
                break;
              case 'codechef':
                newPlatformData.codechef[profile.username] = 
                  await extractCodeChefData(profile.username);
                break;
              case 'geeksforgeeks':
                newPlatformData.geeksforgeeks[profile.username] = 
                  await extractGeeksForGeeksData(profile.username);
                break;
              case 'codeforces':
                newPlatformData.codeforces[profile.username] = 
                  await extractCodeforcesData(profile.username);
                break;
            }
          } finally {
            newLoadingState[key] = false;
            setIsLoading(newLoadingState);
          }
        }

        setPlatformData(newPlatformData);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [profiles]);

  const addPlatform = async (platform: string, username: string) => {
    if (!userEmail) return;

    const maxOrder = profiles ? 
      Math.max(...profiles.map(p => p.order), -1) : 
      -1;

    await addPlatformMutation({
      email: userEmail,
      platform,
      username,
      order: maxOrder + 1
    });
  };

  const removePlatform = async (platform: string, username: string) => {
    if (!userEmail) return;
    await deletePlatformMutation({
      email: userEmail,
      platform,
      username
    });
  };

  const reorderPlatforms = async (fromIndex: number, toIndex: number) => {
    if (!userEmail || !profiles) return;

    const reorderedProfiles = [...profiles];
    const [movedProfile] = reorderedProfiles.splice(fromIndex, 1);
    reorderedProfiles.splice(toIndex, 0, movedProfile);

    await updateOrderMutation({
      email: userEmail,
      updates: reorderedProfiles.map((p, index) => ({
        platform: p.platform,
        username: p.username,
        order: index
      }))
    });
  };

  // Sort profiles by order
  const sortedProfiles = profiles ? 
    [...profiles].sort((a, b) => a.order - b.order)
      .map(p => ({
        platform: p.platform,
        username: p.username,
        order: p.order
      })) : 
    [];

  return (
    <PlatformContext.Provider value={{ 
      platforms: sortedProfiles,
      platformData, 
      isLoading,
      isInitialLoading,
      profileCount: profiles?.length ?? 0,
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