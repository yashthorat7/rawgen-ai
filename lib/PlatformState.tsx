"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { extractLeetCodeData } from "./extractors/leetcodeExtractor";
import { extractCodeChefData } from "./extractors/codechefExtractor";
import { extractGeeksForGeeksData } from "./extractors/geeksforgeeksExtractor";
import { extractCodeforcesData } from "./extractors/codeforcesExtractor";
import type { Platform, PlatformData, LeetCodeData, CodeChefData, GeeksForGeeksData, CodeforcesData } from "./types";

export function usePlatformState() {
  const { user } = useUser();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData>({
    leetcode: {},
    codechef: {},
    geeksforgeeks: {},
    codeforces: {}
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const addPlatform = useMutation(api.users.addPlatform);
  const deletePlatform = useMutation(api.users.deletePlatform);
  const updateProfileData = useMutation(api.users.updateProfileData);
  const updateOrder = useMutation(api.users.updateOrder);

  // Get profiles from database
  const profiles = useQuery(api.users.getProfiles, user?.primaryEmailAddress?.emailAddress ? {
    email: user.primaryEmailAddress.emailAddress
  } : "skip");

  // Fetch platform data and update cache
  const fetchPlatformData = useCallback(async (platformName: string, platformUsername: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return null;

    try {
      let data: LeetCodeData | CodeChefData | GeeksForGeeksData | CodeforcesData | null = null;
      switch (platformName) {
        case 'leetcode':
          data = await extractLeetCodeData(platformUsername) as LeetCodeData;
          break;
        case 'codechef':
          data = await extractCodeChefData(platformUsername) as CodeChefData;
          break;
        case 'geeksforgeeks':
          data = await extractGeeksForGeeksData(platformUsername) as GeeksForGeeksData;
          break;
        case 'codeforces':
          data = await extractCodeforcesData(platformUsername) as CodeforcesData;
          break;
      }

      if (data) {
        // Update cache in database
        await updateProfileData({
          email: user.primaryEmailAddress.emailAddress,
          platformName,
          platformUsername,
          platformCacheData: JSON.stringify(data)
        });

        // Update local state
        setPlatformData(prev => {
          const newData = { ...prev };
          switch (platformName) {
            case 'leetcode':
              newData.leetcode[platformUsername] = data as LeetCodeData;
              break;
            case 'codechef':
              newData.codechef[platformUsername] = data as CodeChefData;
              break;
            case 'geeksforgeeks':
              newData.geeksforgeeks[platformUsername] = data as GeeksForGeeksData;
              break;
            case 'codeforces':
              newData.codeforces[platformUsername] = data as CodeforcesData;
              break;
          }
          return newData;
        });
      }
      return data;
    } catch (error) {
      console.error("Error fetching platform data:", error);
      return null;
    }
  }, [user?.primaryEmailAddress?.emailAddress, updateProfileData]);

  // Process profiles and update state
  useEffect(() => {
    const processProfiles = async () => {
      if (!profiles) {
        setIsInitialLoading(false);
        return;
      }

      // Initialize platform data
      const newPlatformData: PlatformData = {
        leetcode: {},
        codechef: {},
        geeksforgeeks: {},
        codeforces: {}
      };

      // Sort profiles by order
      const sortedProfiles = [...profiles].sort((a, b) => a.order - b.order);
      setPlatforms(sortedProfiles.map(p => ({
        platform: p.platformName,
        username: p.platformUsername,
        order: p.order
      })));

      // Process each profile
      for (const profile of sortedProfiles) {
        try {
          let data;
          if (profile.platformCacheData) {
            // Use cached data
            data = JSON.parse(profile.platformCacheData);
            // Update cache in background
            fetchPlatformData(profile.platformName, profile.platformUsername);
          } else {
            // Fetch fresh data
            data = await fetchPlatformData(profile.platformName, profile.platformUsername);
          }

          if (data) {
            switch (profile.platformName) {
              case 'leetcode':
                newPlatformData.leetcode[profile.platformUsername] = data as LeetCodeData;
                break;
              case 'codechef':
                newPlatformData.codechef[profile.platformUsername] = data as CodeChefData;
                break;
              case 'geeksforgeeks':
                newPlatformData.geeksforgeeks[profile.platformUsername] = data as GeeksForGeeksData;
                break;
              case 'codeforces':
                newPlatformData.codeforces[profile.platformUsername] = data as CodeforcesData;
                break;
            }
          }
        } catch (error) {
          console.error("Error processing profile:", error);
        }
      }

      setPlatformData(newPlatformData);
      setIsInitialLoading(false);
    };

    processProfiles();
  }, [profiles, user?.primaryEmailAddress?.emailAddress, fetchPlatformData]);

  const handleAddPlatform = async (platformName: string, platformUsername: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const data = await fetchPlatformData(platformName, platformUsername);
    if (!data) {
      throw new Error("Failed to fetch platform data");
    }

    await addPlatform({
      email: user.primaryEmailAddress.emailAddress,
      platformName,
      platformUsername,
      platformCacheData: JSON.stringify(data)
    });
  };

  const handleDeletePlatform = async (platformName: string, platformUsername: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    await deletePlatform({
      email: user.primaryEmailAddress.emailAddress,
      platformName,
      platformUsername
    });

    // Update local state
    setPlatformData(prev => {
      const newData = { ...prev };
      switch (platformName) {
        case 'leetcode':
          delete newData.leetcode[platformUsername];
          break;
        case 'codechef':
          delete newData.codechef[platformUsername];
          break;
        case 'geeksforgeeks':
          delete newData.geeksforgeeks[platformUsername];
          break;
        case 'codeforces':
          delete newData.codeforces[platformUsername];
          break;
      }
      return newData;
    });
  };

  const handleUpdateOrder = async (fromIndex: number, toIndex: number) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    // Create new array with updated order
    const newPlatforms = [...platforms];
    const [movedItem] = newPlatforms.splice(fromIndex, 1);
    newPlatforms.splice(toIndex, 0, movedItem);

    // Create updates array for database
    const updates = newPlatforms.map((p, i) => ({
      platformName: p.platform,
      platformUsername: p.username,
      order: i
    }));

    // Update platforms state optimistically
    setPlatforms(newPlatforms.map((p, i) => ({ ...p, order: i })));

    // Update order in database
    await updateOrder({
      email: user.primaryEmailAddress.emailAddress,
      updates
    });
  };

  return {
    platforms,
    platformData,
    isInitialLoading,
    profileCount: profiles?.length ?? 0,
    addPlatform: handleAddPlatform,
    removePlatform: handleDeletePlatform,
    reorderPlatforms: handleUpdateOrder
  };
} 