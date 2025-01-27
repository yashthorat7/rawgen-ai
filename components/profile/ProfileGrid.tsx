"use client";

import { AddCard } from "./AddProfileCard";
import { ProfileCard } from "./ProfileCard";
import { usePlatforms } from "@/lib/PlatformContext";
import { useUser } from "@clerk/nextjs";
import { ProfileCardSkeleton } from "../platform-stats/LoadingSkeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProfileGrid() {
  const { platforms, isInitialLoading, platformData } = usePlatforms();
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // Get user data from email
  const userData = useQuery(
    api.users.getUser,
    email ? { email } : "skip"
  );

  // Show loading state while data is loading
  if (!isLoaded || !userData || platforms === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show message if no user is logged in
  if (!email) {
    return (
      <div className="mt-8 text-center text-gray-500">
        Please log in to view profiles
      </div>
    );
  }

  // Show message if no platforms found
  if (platforms.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AddCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {platforms.map((platform, index) => (
        <ProfileCard
          key={platform.platform + platform.username}
          platform={platform.platform}
          username={platform.username}
          index={index}
        />
      ))}
      <AddCard />
    </div>
  );
};