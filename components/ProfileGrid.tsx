"use client";

import { AddCard } from "./AddProfileCard";
import { ProfileCard } from "./ProfileCard";
import { usePlatforms } from "@/lib/PlatformContext";

export function ProfileGrid() {
  const { platforms, isInitialLoading, profileCount } = usePlatforms();

  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(profileCount || 1)].map((_, i) => (
          <ProfileCard
            key={i}
            platform=""
            username=""
            index={i}
            isLoading={true}
          />
        ))}
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
} 