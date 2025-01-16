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

  const addPlatform = useMutation(api.profiles.addPlatform);
  const deletePlatform = useMutation(api.profiles.deletePlatform);
  const updateOrder = useMutation(api.profiles.updateOrder);
  const updateProfileData = useMutation(api.profiles.updateProfileData);

  // Get profiles from database
  const profiles = useQuery(api.profiles.getProfiles, user?.primaryEmailAddress?.emailAddress ? {
    email: user.primaryEmailAddress.emailAddress
  } : "skip");

  // Function to fetch platform data and update cache
  const fetchPlatformData = useCallback(async (platform: string, username: string) => {
    try {
      let data = null;
      switch (platform) {
        case 'leetcode':
          data = await extractLeetCodeData(username) as LeetCodeData;
          break;
        case 'codechef':
          data = await extractCodeChefData(username) as CodeChefData;
          break;
        case 'geeksforgeeks':
          data = await extractGeeksForGeeksData(username) as GeeksForGeeksData;
          break;
        case 'codeforces':
          data = await extractCodeforcesData(username) as CodeforcesData;
          break;
      }

      if (data && user?.primaryEmailAddress?.emailAddress) {
        // Update database with new data
        await updateProfileData({
          email: user.primaryEmailAddress.emailAddress,
          platform,
          username,
          data: JSON.stringify(data)
        });

        // Update local state
        setPlatformData(prev => {
          const newData = { ...prev };
          switch (platform) {
            case 'leetcode':
              newData.leetcode[username] = data as LeetCodeData;
              break;
            case 'codechef':
              newData.codechef[username] = data as CodeChefData;
              break;
            case 'geeksforgeeks':
              newData.geeksforgeeks[username] = data as GeeksForGeeksData;
              break;
            case 'codeforces':
              newData.codeforces[username] = data as CodeforcesData;
              break;
          }
          return newData;
        });

        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${platform} data:`, error);
    }
    return null;
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
        platform: p.platform,
        username: p.username,
        order: p.order
      })));

      // Process each profile
      for (const profile of sortedProfiles) {
        try {
          let data;
          if (profile.data) {
            // Use cached data
            data = JSON.parse(profile.data);
            // Update cache in background
            fetchPlatformData(profile.platform, profile.username);
          } else {
            // Fetch fresh data
            data = await fetchPlatformData(profile.platform, profile.username);
          }

          if (data) {
            switch (profile.platform) {
              case 'leetcode':
                newPlatformData.leetcode[profile.username] = data as LeetCodeData;
                break;
              case 'codechef':
                newPlatformData.codechef[profile.username] = data as CodeChefData;
                break;
              case 'geeksforgeeks':
                newPlatformData.geeksforgeeks[profile.username] = data as GeeksForGeeksData;
                break;
              case 'codeforces':
                newPlatformData.codeforces[profile.username] = data as CodeforcesData;
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

  const handleAddPlatform = async (platform: string, username: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const data = await fetchPlatformData(platform, username);
    if (!data) {
      throw new Error("Failed to fetch platform data");
    }

    const order = platforms.length;
    await addPlatform({
      email: user.primaryEmailAddress.emailAddress,
      platform,
      username,
      order,
      data: JSON.stringify(data)
    });
  };

  const handleDeletePlatform = async (platform: string, username: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    await deletePlatform({
      email: user.primaryEmailAddress.emailAddress,
      platform,
      username
    });

    // Update local state
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
  };

  const handleUpdateOrder = async (fromIndex: number, toIndex: number) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    // Create new array with updated order
    const newPlatforms = [...platforms];
    const [movedItem] = newPlatforms.splice(fromIndex, 1);
    newPlatforms.splice(toIndex, 0, movedItem);

    // Create updates array for database
    const updates = newPlatforms.map((p, i) => ({
      platform: p.platform,
      username: p.username,
      order: i
    }));

    // Update platforms state optimistically
    setPlatforms(newPlatforms);

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