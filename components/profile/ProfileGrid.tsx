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

interface ProfileGridProps {
  username?: string;
  isPublicView?: boolean;
  platformData?: any;
}

export function ProfileGrid({ username, isPublicView = false, platformData }: ProfileGridProps) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // Get user data - either from username (public view) or email (private view)
  const publicUserData = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );

  // Only use PlatformContext for private view
  const platformContext = isPublicView ? null : usePlatforms();
  const { platforms, platformData: privatePlatformData } = platformContext || {};

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
      })) as Platform[]
    : platforms;

  // Show loading state while data is loading
  if ((!isLoaded && !isPublicView) || !userData || userPlatforms === undefined) {
    return (
      <>
        <Title title="Coding Profiles" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // Show message if no user is logged in and not in public view
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

  // Show message if no platforms found
  if (!userPlatforms || userPlatforms.length === 0) {
    return (
      <>
        <Title title="Coding Profiles" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {!isPublicView && <AddCard />}
          {isPublicView && (
            <div className="mt-2 text-center text-gray-500 col-span-3">
              No platforms added yet
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Title title="Coding Profiles" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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