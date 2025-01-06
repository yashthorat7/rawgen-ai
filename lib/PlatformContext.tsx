"use client";

import { createContext, useContext, useState } from "react";

type Platform = {
  id: string;
  platform: string;
  username: string;
};

type PlatformContextType = {
  platforms: Platform[];
  addPlatform: (platform: string, username: string) => void;
  removePlatform: (id: string) => void;
  reorderPlatforms: (fromIndex: number, toIndex: number) => void;
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const addPlatform = (platform: string, username: string) => {
    setPlatforms([...platforms, {
      id: Math.random().toString(36).slice(2),
      platform,
      username
    }]);
  };

  const removePlatform = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
  };

  const reorderPlatforms = (fromIndex: number, toIndex: number) => {
    const updatedPlatforms = [...platforms];
    const [movedPlatform] = updatedPlatforms.splice(fromIndex, 1);
    updatedPlatforms.splice(toIndex, 0, movedPlatform);
    setPlatforms(updatedPlatforms);
  };

  return (
    <PlatformContext.Provider value={{ platforms, addPlatform, removePlatform, reorderPlatforms }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatforms() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatforms must be used within a PlatformProvider');
  }
  return context;
} 