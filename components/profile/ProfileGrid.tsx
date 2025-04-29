"use client";

import { AddCard } from "./AddProfileCard";
import { ProfileCard } from "./ProfileCard";
import { usePlatforms } from "@/lib/PlatformContext";
import { useUser } from "@clerk/nextjs";
import { ProfileCardSkeleton } from "../platform-stats/LoadingSkeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Platform } from "@/lib/types";
import { Title } from "../ui/Title";
import { useState, useEffect, useRef } from "react";

interface ProfileGridProps {
  username?: string;
  isPublicView?: boolean;
  platformData?: any;
}

export function ProfileGrid({ username, isPublicView = false, platformData }: ProfileGridProps) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasRefreshedRef = useRef(false);

  const publicUserData = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );

  const platformContext = isPublicView ? null : usePlatforms();
  const { platforms, platformData: privatePlatformData, forceRefreshAllPlatforms } = platformContext || {};

  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && email ? { email } : "skip"
  );

  const userData = isPublicView ? publicUserData : privateUserData;
  const userPlatforms = isPublicView 
    ? publicUserData?.profiles?.map(p => ({
        platform: p.platformName,
        username: p.platformUsername,
        order: p.order
      })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) as Platform[]
    : platforms;

  useEffect(() => {
    const refreshOnce = async () => {
      if (hasRefreshedRef.current || isRefreshing || isPublicView || 
          !forceRefreshAllPlatforms || !userPlatforms || userPlatforms.length === 0) {
        return;
      }

      hasRefreshedRef.current = true;
      setIsRefreshing(true);
      
      try {
        await forceRefreshAllPlatforms();
      } catch (error) {
        console.error('[UI] Error in automatic refresh:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    if (userPlatforms && userPlatforms.length > 0) {
      refreshOnce();
    }
  }, [userPlatforms, isPublicView, forceRefreshAllPlatforms, isRefreshing]);

  if ((!isLoaded && !isPublicView) || !userData || userPlatforms === undefined) {
    return (
      <>
        <Title title="Coding Profiles" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(3)].map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (!isPublicView && !email) {
    return (
      <>
        <Title title="Coding Profiles" />
        <div className="mt-2 text-center text-gray-500">
          Please log in to view profiles
        </div>
      </>
    );
  }

  if (!userPlatforms || userPlatforms.length === 0) {
    if (isPublicView) {
      return null;
    }
    return (
      <>
        <Title title="Coding Profiles" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <AddCard />
        </div>
      </>
    );
  }

  return (
    <>
      <Title title="Coding Profiles" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {userPlatforms.map((platform, index) => (
          <ProfileCard
            key={platform.platform + platform.username}
            platform={platform.platform}
            username={platform.username}
            index={index}
            isPublicView={isPublicView}
            platformData={isPublicView ? platformData : privatePlatformData}
          />
        ))}
        {!isPublicView && <AddCard />}
      </div>
    </>
  );
}