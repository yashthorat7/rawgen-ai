"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { extractLeetCodeData } from "./extractors/leetcodeExtractor";
import { extractCodeChefData } from "./extractors/codechefExtractor";
import { extractGeeksForGeeksData } from "./extractors/geeksforgeeksExtractor";
import { extractCodeforcesData } from "./extractors/codeforcesExtractor";
import {
  extractEssentialLeetCodeData,
  extractEssentialCodeChefData,
  extractEssentialGeeksForGeeksData,
  extractEssentialCodeforcesData
} from "./extractors";
import type { Platform, PlatformData, LeetCodeData, CodeChefData, GeeksForGeeksData, CodeforcesData } from "./types";
import { preparePlatformProfileData } from "./utils";

// Create HTTP client for direct queries
const convexHttp = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function usePlatformState(initialPlatformData?: PlatformData) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData>(initialPlatformData || {
    leetcode: {},
    codechef: {},
    geeksforgeeks: {},
    codeforces: {}
  });
  const [isInitialLoading, setIsInitialLoading] = useState(!initialPlatformData);

  // If we have initial platform data, we're in public view mode
  const isPublicView = !!initialPlatformData;

  const addPlatform = useMutation(api.users.addPlatform);
  const deletePlatform = useMutation(api.users.deletePlatform);
  const updateProfileData = useMutation(api.users.updateProfileData);
  const updateOrder = useMutation(api.users.updateOrder);
  const createUser = useMutation(api.users.createUser);

  // Get profiles from database only if not in public view
  const profiles = useQuery(
    api.users.getProfiles,
    !isPublicView && user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  // Create user if not exists and not in public view
  useEffect(() => {
    if (isPublicView) return;

    const initUser = async () => {
      if (!isUserLoaded || !user?.primaryEmailAddress?.emailAddress) return;

      try {
        await createUser({
          email: user.primaryEmailAddress.emailAddress,
          username: user.username || user.primaryEmailAddress.emailAddress.split('@')[0]
        });
      } catch (error) {
        // Error handling silently
      }
    };

    initUser();
  }, [isUserLoaded, user, createUser, isPublicView]);

  // Fetch platform data and update database with both stats and full data
  const fetchAndStorePlatformData = useCallback(async (platformName: string, platformUsername: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return null;
    const email = user.primaryEmailAddress.emailAddress;
    

    try {
      // Fetch full platform data
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
        // Extract essential stats data directly to avoid additional API calls
        
        // Type-safe extraction of stats data
        let statsData = JSON.stringify({});
        
        switch(platformName) {
          case 'leetcode':
            statsData = JSON.stringify(extractEssentialLeetCodeData(data as LeetCodeData));
            break;
          case 'codechef':
            statsData = JSON.stringify(extractEssentialCodeChefData(data as CodeChefData));
            break;
          case 'geeksforgeeks':
            statsData = JSON.stringify(extractEssentialGeeksForGeeksData(data as GeeksForGeeksData));
            break;
          case 'codeforces':
            statsData = JSON.stringify(extractEssentialCodeforcesData(data as CodeforcesData));
            break;
        }
        
        // Update both stats and full data in database
        await updateProfileData({
          email,
          platformName,
          platformUsername,
          statsData,
          fullData: JSON.stringify(data)
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
      return null;
    }
  }, [user?.primaryEmailAddress?.emailAddress, updateProfileData]);

  // Process profiles and update state
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    const processProfiles = async () => {
      if (!profiles) {
        setPlatforms([]);
        setPlatformData({
          leetcode: {},
          codechef: {},
          geeksforgeeks: {},
          codeforces: {}
        });
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

      // First try to load from cache
      try {
        // Get all platform data for this user
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;
        
        const allPlatformData = await convexHttp.query(api.users.getAllPlatformData, { email });
        
        if (allPlatformData && Array.isArray(allPlatformData) && allPlatformData.length > 0) {
          // Map profileId to data for quick lookup
          const platformDataMap = new Map();
          allPlatformData.forEach(item => {
            if (item && item.profileId && item.fullData) {
              platformDataMap.set(item.profileId, item);
            }
          });
          
          // Process each profile
          for (const profile of sortedProfiles) {
            const cachedData = platformDataMap.get(profile._id);
            
            if (cachedData && cachedData.fullData) {
              try {
                const parsedData = JSON.parse(cachedData.fullData);
                
                // Update platform data with cached data
                switch (profile.platformName) {
                  case 'leetcode':
                    newPlatformData.leetcode[profile.platformUsername] = parsedData;
                    break;
                  case 'codechef':
                    newPlatformData.codechef[profile.platformUsername] = parsedData;
                    break;
                  case 'geeksforgeeks':
                    newPlatformData.geeksforgeeks[profile.platformUsername] = parsedData;
                    break;
                  case 'codeforces':
                    newPlatformData.codeforces[profile.platformUsername] = parsedData;
                    break;
                }
                
                // Check if data is stale and queue background refresh
                const timeSinceUpdate = Date.now() - cachedData.lastUpdated;
                const isStale = timeSinceUpdate > 12 * 60 * 60 * 1000;
                
                if (isStale) {
                  // Queue background refresh without awaiting
                  setTimeout(() => {
                    fetchAndStorePlatformData(profile.platformName, profile.platformUsername)
                      .then(data => {
                        if (data) {
                        }
                      })
                      .catch(e => console.error(`[REFRESH ERROR] Background refresh failed for ${profile.platformName}/${profile.platformUsername}:`, e));
                  }, 1000);
                }
              } catch (error) {
              }
            } else {
              // No cached data, fetch fresh data
              try {
                const data = await fetchAndStorePlatformData(profile.platformName, profile.platformUsername);
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
              }
            }
          }
        } else {
          // No cached data found, fetch all fresh
          await Promise.all(sortedProfiles.map(async (profile) => {
            try {
              const data = await fetchAndStorePlatformData(profile.platformName, profile.platformUsername);
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
            }
          }));
        }
      } catch (error) {
      }
      
      // Update platform data and finish loading
      setPlatformData(newPlatformData);
      setIsInitialLoading(false);
    };

    processProfiles();
  }, [profiles, user?.primaryEmailAddress?.emailAddress, fetchAndStorePlatformData]);

  // Add a new platform
  const handleAddPlatform = async (platformName: string, platformUsername: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    // Fetch full platform data
    const data = await fetchAndStorePlatformData(platformName, platformUsername);
    if (!data) {
      throw new Error("Failed to fetch platform data");
    }
    
    // Prepare essential platform data for stats
    const profileData = await preparePlatformProfileData(platformName, platformUsername);
    if (!profileData) {
      throw new Error("Failed to prepare platform data");
    }

    // Add platform with both minimal stats and full data
    await addPlatform({
      email: user.primaryEmailAddress.emailAddress,
      platformName,
      platformUsername,
      statsData: profileData.statsData,
      fullData: JSON.stringify(data)
    });
  };

  const handleDeletePlatform = async (platformName: string, platformUsername: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    // Store current state for rollback
    const previousPlatforms = [...platforms];
    const previousPlatformData = { ...platformData };

    // Optimistically update UI
    setPlatforms(prev => prev.filter(p => !(p.platform === platformName && p.username === platformUsername)));
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

    try {
      // Run deletion in background
      await deletePlatform({
        email: user.primaryEmailAddress.emailAddress,
        platformName,
        platformUsername
      });
    } catch (error) {
      // Rollback on error
      setPlatforms(previousPlatforms);
      setPlatformData(previousPlatformData);
      throw error;
    }
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

  // Force refresh all profiles
  const forceRefreshAllPlatforms = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress || !profiles || profiles.length === 0) {
      return;
    }

    // Sort profiles by order
    const sortedProfiles = [...profiles].sort((a, b) => a.order - b.order);
    
    // Queue refreshes in the background
    sortedProfiles.forEach((profile, index) => {
      setTimeout(() => {
        fetchAndStorePlatformData(profile.platformName, profile.platformUsername)
          .then(data => {
          })
          .catch(error => {
            console.error(`[FORCE_REFRESH] Error refreshing ${profile.platformName}/${profile.platformUsername}:`, error);
          });
      }, index * 300); // Stagger by 300ms per profile
    });
    
  }, [user?.primaryEmailAddress?.emailAddress, profiles, fetchAndStorePlatformData]);

  return {
    platforms,
    platformData,
    isInitialLoading,
    profileCount: profiles?.length ?? 0,
    addPlatform: handleAddPlatform,
    removePlatform: handleDeletePlatform,
    reorderPlatforms: handleUpdateOrder,
    forceRefreshAllPlatforms
  };
} 