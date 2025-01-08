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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasInitialDataLoaded, setHasInitialDataLoaded] = useState(false);

  useEffect(() => {
    if (!profiles || hasInitialDataLoaded) return;

    const fetchData = async () => {
      setIsInitialLoading(true);

      try {
        await Promise.all(profiles.map(async (profile) => {
          try {
            switch (profile.platform) {
              case 'leetcode': {
                const data = await extractLeetCodeData(profile.username);
                if (data) {
                  setPlatformData(prev => ({
                    ...prev,
                    leetcode: { ...prev.leetcode, [profile.username]: data }
                  }));
                }
                break;
              }
              case 'codechef': {
                const data = await extractCodeChefData(profile.username);
                if (data) {
                  setPlatformData(prev => ({
                    ...prev,
                    codechef: { ...prev.codechef, [profile.username]: data }
                  }));
                }
                break;
              }
              case 'geeksforgeeks': {
                const data = await extractGeeksForGeeksData(profile.username);
                if (data) {
                  setPlatformData(prev => ({
                    ...prev,
                    geeksforgeeks: { ...prev.geeksforgeeks, [profile.username]: data }
                  }));
                }
                break;
              }
              case 'codeforces': {
                const data = await extractCodeforcesData(profile.username);
                if (data) {
                  setPlatformData(prev => ({
                    ...prev,
                    codeforces: { ...prev.codeforces, [profile.username]: data }
                  }));
                }
                break;
              }
            }
          } catch (error) {
            console.error(`Error fetching data for ${profile.platform}:`, error);
          }
        }));
      } finally {
        setIsInitialLoading(false);
        setHasInitialDataLoaded(true);
      }
    };

    fetchData();
  }, [profiles, hasInitialDataLoaded]);

  const addPlatform = async (platform: string, username: string) => {
    if (!userEmail) return;

    const maxOrder = profiles ? 
      Math.max(...profiles.map(p => p.order), -1) : 
      -1;

    try {
      await addPlatformMutation({
        email: userEmail,
        platform,
        username,
        order: maxOrder + 1
      });

      // Fetch and update platform data
      try {
        switch (platform) {
          case 'leetcode': {
            const data = await extractLeetCodeData(username);
            if (data) {
              setPlatformData(prev => ({
                ...prev,
                leetcode: { ...prev.leetcode, [username]: data }
              }));
            }
            break;
          }
          case 'codechef': {
            const data = await extractCodeChefData(username);
            if (data) {
              setPlatformData(prev => ({
                ...prev,
                codechef: { ...prev.codechef, [username]: data }
              }));
            }
            break;
          }
          case 'geeksforgeeks': {
            const data = await extractGeeksForGeeksData(username);
            if (data) {
              setPlatformData(prev => ({
                ...prev,
                geeksforgeeks: { ...prev.geeksforgeeks, [username]: data }
              }));
            }
            break;
          }
          case 'codeforces': {
            const data = await extractCodeforcesData(username);
            if (data) {
              setPlatformData(prev => ({
                ...prev,
                codeforces: { ...prev.codeforces, [username]: data }
              }));
            }
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${platform}:`, error);
      }
    } catch (error) {
      console.error('Error adding platform:', error);
    }
  };

  const removePlatform = async (platform: string, username: string) => {
    if (!userEmail) return;

    setPlatformData(prev => {
      const newData = { ...prev };
      switch (platform) {
        case 'leetcode':
          delete newData.leetcode[username];
          break;
        case 'codechef':
          delete newData.codechef[username];
          break;
        case 'geeksforgeeks':
          delete newData.geeksforgeeks[username];
          break;
        case 'codeforces':
          delete newData.codeforces[username];
          break;
      }
      return newData;
    });

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