"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { usePlatformState } from "./PlatformState";
import type { PlatformContextType } from './types';

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const platformState = usePlatformState(userEmail);

  return (
    <PlatformContext.Provider value={platformState}>
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