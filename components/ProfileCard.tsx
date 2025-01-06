"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { usePlatforms } from "@/lib/PlatformContext";

export function ProfileCard({ 
  id, 
  platform, 
  username,
  index 
}: { 
  id: string;
  platform: string;
  username: string;
  index: number;
}) {
  const { removePlatform, reorderPlatforms } = usePlatforms();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = index;
    
    if (fromIndex !== toIndex) {
      reorderPlatforms(fromIndex, toIndex);
    }
  };

  return (
    <div 
      className="relative bg-background w-full min-w-[280px] max-w-full h-[300px] shadow-[0_4px_8px_rgba(0,0,100,0.08)] 
                transition-all duration-200 ease-in-out hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] 
                hover:scale-[1.01] cursor-move flex p-4 rounded-lg"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <button 
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-50 group transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          removePlatform(id);
        }}
      >
        <Trash2 className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" />
      </button>

      <div className="w-[250px] bg-gray-50 h-full flex flex-col items-center rounded-lg transition-colors hover:bg-white">
        <div className="flex-1 flex items-center justify-center">
          <Image
            src={`/${platform}.svg`}
            alt={platform}
            width={120}
            height={120}
            className="text-gray-200"
            draggable={false}
          />
        </div>
        <p className="text-xl text-gray-800 uppercase tracking-wider font-bold mb-4">{platform}</p>
      </div>

      <div className="flex-1 p-6">
        <h3 className="text-[32px] font-bold text-gray-900">{username}</h3>
      </div>
    </div>
  );
} 