"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlatforms } from "@/lib/PlatformContext";
import { LeetCodeStats } from "./platform-stats/LeetCodeStats";
import { CodeChefStats } from "./platform-stats/CodeChefStats";
import { GeeksForGeeksStats } from "./platform-stats/GeeksForGeeksStats";
import { DeleteButton } from "./DeleteButton";
import { CodeforcesStats } from "./platform-stats/CodeforcesStats";
import { LoadingSkeleton } from "./platform-stats/LoadingSkeleton";
import { LeetCodeDashboard } from "./dashboard/LeetCodeDashboard";

export function ProfileCard({ 
  platform, 
  username,
  index,
  isLoading = false
}: { 
  platform: string;
  username: string;
  index: number;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { removePlatform, reorderPlatforms, platformData, isLoading: isDataLoading } = usePlatforms();
  const isLoadingData = isLoading || isDataLoading[`${platform}-${username}`];

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
    if (isLoadingData) {
      return <LoadingSkeleton />;
    }

    switch (platform) {
      case 'leetcode':
        return <LeetCodeStats data={platformData.leetcode[username]} isLoading={false} />;
      case 'codechef':
        return <CodeChefStats data={platformData.codechef[username]} isLoading={false} />;
      case 'geeksforgeeks':
        return <GeeksForGeeksStats data={platformData.geeksforgeeks[username]} isLoading={false} />;
      case 'codeforces':
        return <CodeforcesStats data={platformData.codeforces[username]} isLoading={false} />;
      default:
        return <LoadingSkeleton />;
    }
  };

  const renderDashboard = () => {
    switch (platform) {
      case 'leetcode':
        const leetcodeData = platformData.leetcode[username];
        return leetcodeData ? (
          <LeetCodeDashboard 
            username={username}
            data={leetcodeData}
            platform={platform}
            onDelete={() => {
              removePlatform(platform, username);
              setIsOpen(false);
            }}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <div 
        className={`grid grid-cols-[160px_1fr] gap-4 relative bg-background 
                  w-full min-w-[280px] max-w-full h-[225px] overflow-hidden
                  shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                  hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] cursor-pointer p-4 rounded-lg
                  ${isLoadingData ? 'min-w-[320px]' : 'min-w-[280px]'}`}
        onClick={() => !isLoadingData && setIsOpen(true)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="w-full bg-gray-50 h-full flex flex-col items-center rounded-lg transition-colors hover:bg-white">
          <div className="flex-1 flex items-center justify-center">
            {isLoadingData ? (
              <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <Image
                src={`/${platform}.png`}
                alt={platform}
                width={200}
                height={200}
                className="w-auto h-auto"
                draggable={false}
              />
            )}
          </div>
          <div className="block text-sm text-gray-800 uppercase tracking-wider font-bold mb-2">
            {isLoadingData ? (
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            ) : (
              platform
            )}
          </div>
        </div>

        <div className="relative flex flex-col h-full rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 truncate w-full">
            {isLoadingData ? (
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              username
            )}
          </h3>
          <div className="pr-6 flex-1">
            {renderStats()}
          </div>
          <div className="absolute bottom-0 right-0">
            <DeleteButton onDelete={() => removePlatform(platform, username)} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-auto relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            {renderDashboard()}
          </div>
        </div>
      )}
    </>
  );
} 