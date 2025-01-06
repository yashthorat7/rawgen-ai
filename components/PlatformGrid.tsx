"use client";

import { AddCard } from "./AddCard";
import { ProfileCard } from "./ProfileCard";
import { usePlatforms } from "@/lib/PlatformContext";

export function PlatformGrid() {
  const { platforms } = usePlatforms();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {platforms.map((platform, index) => (
        <ProfileCard
          key={platform.id}
          id={platform.id}
          platform={platform.platform}
          username={platform.username}
          index={index}
        />
      ))}
      <AddCard />
    </div>
  );
} 