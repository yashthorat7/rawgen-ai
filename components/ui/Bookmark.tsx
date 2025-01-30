"use client";

import { Bookmark } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

interface BookmarkButtonProps {
  recruiterEmail?: string;
  userEmail?: string;
  isMarked: boolean;
  onMarkChange?: (isMarked: boolean) => void;
}

export default function BookmarkButton({ 
  recruiterEmail, 
  userEmail, 
  isMarked,
  onMarkChange 
}: BookmarkButtonProps) {
  const toggleMarkstar = useMutation(api.recruiters.toggleMarkstar);

  const handleMarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!recruiterEmail || !userEmail) return;

    try {
      const result = await toggleMarkstar({
        recruiterEmail,
        userEmail
      });

      if (result.success) {
        onMarkChange?.(result.action === "marked");
      }
    } catch (error) {
      console.error('Error toggling mark:', error);
    }
  };

  return (
    <button
      onClick={handleMarkClick}
      style={{ zIndex: 2147483647 }}
      className="fixed top-2 right-2 w-10 h-10 rounded-full bg-white/95 
               shadow-lg hover:shadow-2xl transition-all duration-300 
               hover:scale-110 hover:bg-indigo-50 border border-gray-200
               flex items-center justify-center group"
    >
      <Bookmark 
        className={`w-5 h-5 ${isMarked ? 'text-green-600 fill-green-600' : 'text-indigo-600'} 
                 transition-all duration-300 group-hover:scale-110`}
      />
    </button>
  );
} 