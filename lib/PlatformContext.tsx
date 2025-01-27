"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { usePlatformState } from "./PlatformState";
import type { PlatformContextType, PlatformData } from './types';

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

interface PlatformProviderProps {
  children: React.ReactNode;
  platformData?: PlatformData;
}

export function PlatformProvider({ children, platformData }: PlatformProviderProps) {
  const { user } = useUser();
  const platformState = usePlatformState(platformData);

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