"use client";

import { useState } from "react";
import { AddPlatformDialog } from "./AddProfileDialog";
import { usePlatforms } from "@/lib/PlatformContext";

export function AddCard() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addPlatform } = usePlatforms();

  const handleSubmit = async (platform: string, username: string) => {
    setIsLoading(true);
    try {
      await addPlatform(platform, username);
    } catch (error) {
      console.error('AddCard: Database error while adding platform:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="h-[120px] sm:h-[225px] border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center hover:border-primary-500 transition-colors w-full min-w-[280px] max-w-full rounded-lg group"
      >
        <span className="text-gray-400 group-hover:text-primary-500 font-medium">
          Add Platform
        </span>
      </div>
      <AddPlatformDialog open={open} onOpenChange={setOpen} onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
} 