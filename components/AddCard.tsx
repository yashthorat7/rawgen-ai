"use client";

import { useState } from "react";
import { AddPlatformDialog } from "./AddPlatformDialog";
import { usePlatforms } from "@/lib/PlatformContext";
import { Plus } from "lucide-react";
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
      throw error; // Re-throw to handle in the dialog
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="h-[120px] sm:h-[225px] mb-4 border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center hover:border-gray-400 transition-colors w-full min-w-[280px] max-w-full rounded-lg"
      >
        <Plus className="w-8 h-8 text-gray-300 group-hover:text-gray-500" />
      </div>
      <AddPlatformDialog open={open} onOpenChange={setOpen} onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
} 