"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { usePlatforms } from "@/lib/PlatformContext";
import { LeetCodeStats } from "./platform-stats/LeetCodeStats";
import { CodeChefStats } from "./platform-stats/CodeChefStats";
import { GeeksForGeeksStats } from "./platform-stats/GeeksForGeeksStats";
import { DeleteButton } from "./DeleteButton";

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
  const { removePlatform, reorderPlatforms, platformData } = usePlatforms();

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

  const renderStats = () => {
    switch (platform) {
      case 'leetcode':
        return <LeetCodeStats data={platformData.leetcode[username]} />;
      case 'codechef':
        return <CodeChefStats data={platformData.codechef[username]} />;
      case 'geeksforgeeks':
        return <GeeksForGeeksStats data={platformData.geeksforgeeks[username]} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="grid grid-cols-[160px_1fr] gap-4 relative bg-background w-full min-w-[280px] max-w-full h-[225px] 
                shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] cursor-move p-4 rounded-lg"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="w-full bg-gray-50 h-full flex flex-col items-center rounded-lg transition-colors hover:bg-white">
        <div className="flex-1 flex items-center justify-center">
          <Image
            src={`/${platform}.png`}
            alt={platform}
            width={200}
            height={200}
            className="w-auto h-auto"
            draggable={false}
          />
        </div>
        <p className="block text-sm text-gray-800 uppercase tracking-wider font-bold mb-2">{platform}</p>
      </div>

      <div className="relative flex flex-col h-full rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 truncate w-full">{username}</h3>
        <div className="pr-6 flex-1">
          {renderStats()}
        </div>
        <div className="absolute bottom-0 right-0">
          <DeleteButton onDelete={() => removePlatform(id)} />
        </div>
      </div>
    </div>
  );
} 