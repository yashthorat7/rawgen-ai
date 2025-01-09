import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { extractLeetCodeData } from "./extractors/leetcodeExtractor";
import { extractCodeChefData } from "./extractors/codechefExtractor";
import { extractGeeksForGeeksData } from "./extractors/geeksforgeeksExtractor";
import { extractCodeforcesData } from "./extractors/codeforcesExtractor";
import type { PlatformData } from './types';

export function usePlatformState(userEmail: string | undefined) {
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

  // Fetch platform data when profiles change
  useEffect(() => {
    if (!profiles) return;

    const fetchPlatformData = async () => {
      try {
        // Initialize with empty platform data
        setPlatformData({
          leetcode: {},
          codechef: {},
          geeksforgeeks: {},
          codeforces: {}
        });
        
        // Process each profile independently
        profiles.forEach(async (profile) => {
          try {
            switch (profile.platform) {
              case 'leetcode': {
                const result = await extractLeetCodeData(profile.username);
                if (result) {
                  setPlatformData(prev => ({
                    ...prev,
                    leetcode: { ...prev.leetcode, [profile.username]: result }
                  }));
                }
                break;
              }
              case 'codechef': {
                const result = await extractCodeChefData(profile.username);
                if (result) {
                  setPlatformData(prev => ({
                    ...prev,
                    codechef: { ...prev.codechef, [profile.username]: result }
                  }));
                }
                break;
              }
              case 'geeksforgeeks': {
                const result = await extractGeeksForGeeksData(profile.username);
                if (result) {
                  setPlatformData(prev => ({
                    ...prev,
                    geeksforgeeks: { ...prev.geeksforgeeks, [profile.username]: result }
                  }));
                }
                break;
              }
              case 'codeforces': {
                const result = await extractCodeforcesData(profile.username);
                if (result) {
                  setPlatformData(prev => ({
                    ...prev,
                    codeforces: { ...prev.codeforces, [profile.username]: result }
                  }));
                }
                break;
              }
            }
          } catch (error) {
            console.error(`Failed to load data for ${profile.platform}/${profile.username}:`, error);
          }
        });
      } catch (error) {
        console.error('Error fetching platform data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchPlatformData();
  }, [profiles]);

  const addPlatform = async (platform: string, username: string) => {
    if (!userEmail) return;


    try {
      // Check for duplicate only for the same platform+username combination
      const existingProfile = profiles?.find(
        p => p.platform === platform && p.username === username
      );

      if (existingProfile) {
        throw new Error(`Username ${username} already exists for platform ${platform}`);
      }

      const order = (profiles?.length ?? 0) + 1;

      const result = await addPlatformMutation({ 
        email: userEmail, 
        platform, 
        username, 
        order 
      });

      // Fetch the platform data for the newly added profile
      try {
        const newData = { ...platformData };
        switch (platform) {
          case 'leetcode':
            newData.leetcode[username] = await extractLeetCodeData(username);
            break;
          case 'codechef':
            newData.codechef[username] = await extractCodeChefData(username);
            break;
          case 'geeksforgeeks':
            newData.geeksforgeeks[username] = await extractGeeksForGeeksData(username);
            break;
          case 'codeforces':
            newData.codeforces[username] = await extractCodeforcesData(username);
            break;
        }
        setPlatformData(newData);
      } catch (error) {
        console.error("Failed to load data for new profile:", error);
      }

      return result;
    } catch (error) {
      console.error("PlatformState: Error adding platform:", error);
      throw error;
    }
  };

  const removePlatform = async (platform: string, username: string) => {
    if (!userEmail) return;
    await deletePlatformMutation({ email: userEmail, platform, username });
  };

  const reorderPlatforms = async (fromIndex: number, toIndex: number) => {
    if (!userEmail || !profiles) return;
    
    const newProfiles = [...profiles];
    const [movedItem] = newProfiles.splice(fromIndex, 1);
    newProfiles.splice(toIndex, 0, movedItem);
    
    // Update order for all items
    const updates = newProfiles.map((profile, index) => ({
      platform: profile.platform,
      username: profile.username,
      order: index + 1
    }));

    await updateOrderMutation({ email: userEmail, updates });
  };

  const sortedProfiles = profiles ? 
    [...profiles].sort((a, b) => a.order - b.order)
      .map(p => ({
        platform: p.platform,
        username: p.username,
        order: p.order
      })) : 
    [];

  return {
    platforms: sortedProfiles,
    platformData,
    isInitialLoading,
    profileCount: profiles?.length ?? 0,
    addPlatform,
    removePlatform,
    reorderPlatforms
  };
} 