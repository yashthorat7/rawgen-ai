"use client";

import { useState } from "react";
import { AddPlatformDialog } from "./AddPlatformDialog";
import { usePlatforms } from "@/lib/PlatformContext";

export function AddCard() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addPlatform } = usePlatforms();

  const handleSubmit = async (platform: string, username: string) => {
    console.log('AddCard: Submitting platform:', platform, 'username:', username);
    
    setIsLoading(true);
    try {
      await addPlatform(platform, username);
      console.log('AddCard: Platform added successfully');
    } catch (error) {
      console.error('AddCard: Error adding platform:', error);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="h-[225px] mb-4 border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center hover:border-gray-400 transition-colors w-full min-w-[280px] max-w-full rounded-lg"
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <AddPlatformDialog open={open} onOpenChange={setOpen} onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
} 