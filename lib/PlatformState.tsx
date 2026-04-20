"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { 
  extractAllPlatformData, 
  PlatformName 
} from "./extractors";
import type {
  Platform,
  PlatformData,
} from "./types";
import { preparePlatformProfileData } from "./utils";

const convexHttp = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function usePlatformState(initialPlatformData?: PlatformData) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData>(
    initialPlatformData || {
      leetcode: {},
      codechef: {},
      geeksforgeeks: {},
      codeforces: {},
    },
  );
  const [isInitialLoading, setIsInitialLoading] =
    useState(!initialPlatformData);

  const isPublicView = !!initialPlatformData;

  const addPlatform = useMutation(api.users.addPlatform);
  const deletePlatform = useMutation(api.users.deletePlatform);
  const updateProfileData = useMutation(api.users.updateProfileData);
  const updateOrder = useMutation(api.users.updateOrder);
  const createUser = useMutation(api.users.createUser);

  const profiles = useQuery(
    api.users.getProfiles,
    !isPublicView && user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip",
  );

  useEffect(() => {
    if (isPublicView) return;

    const initUser = async () => {
      if (!isUserLoaded || !user?.primaryEmailAddress?.emailAddress) return;

      try {
        await createUser({
          email: user.primaryEmailAddress.emailAddress,
          username:
            user.username ||
            user.primaryEmailAddress.emailAddress.split("@")[0],
        });
      } catch (error) {}
    };

    initUser();
  }, [isUserLoaded, user, createUser, isPublicView]);

  const fetchAndStorePlatformData = useCallback(
    async (platformName: string, platformUsername: string) => {
      if (!user?.primaryEmailAddress?.emailAddress) return null;
      const email = user.primaryEmailAddress.emailAddress;

      try {
        const result = await extractAllPlatformData(platformName, platformUsername);
        if (!result) return null;

        const { fullData, essentialData } = result;

        await updateProfileData({
          email,
          platformName,
          platformUsername,
          statsData: JSON.stringify(essentialData),
          fullData: JSON.stringify(fullData),
        });

        setPlatformData((prev) => ({
          ...prev,
          [platformName]: {
            ...prev[platformName],
            [platformUsername]: fullData
          }
        }));

        return fullData;
      } catch (error) {
        return null;
      }
    },
    [user?.primaryEmailAddress?.emailAddress, updateProfileData],
  );


  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    const processProfiles = async () => {
      if (!profiles) {
        setPlatforms([]);
        setPlatformData({ leetcode: {}, codechef: {}, geeksforgeeks: {}, codeforces: {} });
        setIsInitialLoading(false);
        return;
      }

      const newPlatformData: PlatformData = { leetcode: {}, codechef: {}, geeksforgeeks: {}, codeforces: {} };
      const sortedProfiles = [...profiles].sort((a, b) => a.order - b.order);
      
      setPlatforms(sortedProfiles.map((p) => ({
        platform: p.platformName,
        username: p.platformUsername,
        order: p.order,
      })));

      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const allPlatformData = await convexHttp.query(api.users.getAllPlatformData, { email });
        const platformDataMap = new Map(
          (allPlatformData || []).filter(item => item?.profileId).map(item => [item.profileId, item])
        );

        for (const profile of sortedProfiles) {
          const cachedData = platformDataMap.get(profile._id);

          if (cachedData?.fullData) {
            try {
              const parsedData = JSON.parse(cachedData.fullData);
              newPlatformData[profile.platformName][profile.platformUsername] = parsedData;

              const isStale = Date.now() - cachedData.lastUpdated > 12 * 60 * 60 * 1000;
              if (isStale) {
                setTimeout(() => {
                  fetchAndStorePlatformData(profile.platformName, profile.platformUsername).catch(() => {});
                }, 1000);
              }
            } catch (error) {}
          } else {
            const data = await fetchAndStorePlatformData(profile.platformName, profile.platformUsername);
            if (data) {
              newPlatformData[profile.platformName][profile.platformUsername] = data;
            }
          }
        }
      } catch (error) {}

      setPlatformData(newPlatformData);
      setIsInitialLoading(false);
    };


    processProfiles();
  }, [
    profiles,
    user?.primaryEmailAddress?.emailAddress,
    fetchAndStorePlatformData,
  ]);

  const handleAddPlatform = async (
    platformName: string,
    platformUsername: string,
  ) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const data = await fetchAndStorePlatformData(
      platformName,
      platformUsername,
    );
    if (!data) {
      throw new Error("Failed to fetch platform data");
    }

    const profileData = await preparePlatformProfileData(
      platformName,
      platformUsername,
    );
    if (!profileData) {
      throw new Error("Failed to prepare platform data");
    }

    await addPlatform({
      email: user.primaryEmailAddress.emailAddress,
      platformName,
      platformUsername,
      statsData: profileData.statsData,
      fullData: JSON.stringify(data),
    });
  };

  const handleDeletePlatform = async (
    platformName: string,
    platformUsername: string,
  ) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const previousPlatforms = [...platforms];
    const previousPlatformData = { ...platformData };

    setPlatforms((prev) =>
      prev.filter(
        (p) =>
          !(p.platform === platformName && p.username === platformUsername),
      ),
    );
    
    setPlatformData((prev) => {
      const newData = { ...prev };
      if (newData[platformName]) {
        delete newData[platformName][platformUsername];
      }
      return newData;
    });

    try {
      await deletePlatform({
        email: user.primaryEmailAddress.emailAddress,
        platformName,
        platformUsername,
      });
    } catch (error) {
      setPlatforms(previousPlatforms);
      setPlatformData(previousPlatformData);
      throw error;
    }
  };


  const handleUpdateOrder = async (fromIndex: number, toIndex: number) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const newPlatforms = [...platforms];
    const [movedItem] = newPlatforms.splice(fromIndex, 1);
    newPlatforms.splice(toIndex, 0, movedItem);

    const updates = newPlatforms.map((p, i) => ({
      platformName: p.platform,
      platformUsername: p.username,
      order: i,
    }));

    setPlatforms(newPlatforms.map((p, i) => ({ ...p, order: i })));

    await updateOrder({
      email: user.primaryEmailAddress.emailAddress,
      updates,
    });
  };

  const forceRefreshAllPlatforms = useCallback(async () => {
    if (
      !user?.primaryEmailAddress?.emailAddress ||
      !profiles ||
      profiles.length === 0
    ) {
      return;
    }

    const sortedProfiles = [...profiles].sort((a, b) => a.order - b.order);

    sortedProfiles.forEach((profile, index) => {
      setTimeout(() => {
        fetchAndStorePlatformData(
          profile.platformName,
          profile.platformUsername,
        )
          .then((data) => {})
          .catch((error) => {
            console.error(
              `[FORCE_REFRESH] Error refreshing ${profile.platformName}/${profile.platformUsername}:`,
              error,
            );
          });
      }, index * 300);
    });
  }, [
    user?.primaryEmailAddress?.emailAddress,
    profiles,
    fetchAndStorePlatformData,
  ]);

  return {
    platforms,
    platformData,
    isInitialLoading,
    profileCount: profiles?.length ?? 0,
    addPlatform: handleAddPlatform,
    removePlatform: handleDeletePlatform,
    reorderPlatforms: handleUpdateOrder,
    forceRefreshAllPlatforms,
  };
}
