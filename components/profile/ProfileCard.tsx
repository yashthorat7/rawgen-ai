"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlatforms } from "@/lib/PlatformContext";
import { LeetCodeStats } from "../platform-stats/LeetCodeStats";
import { CodeChefStats } from "../platform-stats/CodeChefStats";
import { GeeksForGeeksStats } from "../platform-stats/GeeksForGeeksStats";
import { CodeforcesStats } from "../platform-stats/CodeforcesStats";
import { LoadingSkeleton } from "../platform-stats/LoadingSkeleton";
import { LeetCodeDashboard } from "../dashboard/leetcode/Dashboard";
import { CodeChefDashboard } from "../dashboard/codechef/Dashboard";
import { GeeksForGeeksDashboard } from "../dashboard/GeeksForGeeksDashboard";
import { CodeforcesDashboard } from "../dashboard/codeforces/Dashboard";
import type { LeetCodeData, CodeChefData, GeeksForGeeksData, CodeforcesData } from "@/lib/types";
import { UpdateCardIcon } from "../ui/UpdateCardIcon";

export function ProfileCard({
  platform,
  username,
  index
}: {
  platform: string;
  username: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { platformData, platforms, removePlatform, reorderPlatforms } = usePlatforms();

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-2', 'border-primary-500', 'border-dashed');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-2', 'border-primary-500', 'border-dashed');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-2', 'border-primary-500', 'border-dashed');

    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex === index) return;

    // Create updates array with new order
    const newPlatforms = [...platforms];
    const [movedItem] = newPlatforms.splice(fromIndex, 1);
    newPlatforms.splice(index, 0, movedItem);

    // Update order in database
    const updates = newPlatforms.map((p, i) => ({
      platform: p.platform,
      username: p.username,
      order: i
    }));

    await reorderPlatforms(fromIndex, index);
  };

  const renderStats = () => {
    const data = platformData[platform as keyof typeof platformData]?.[username];
    if (!data) return null;

    switch (platform) {
      case 'leetcode':
        if ('totalSolved' in data) {
          return <LeetCodeStats data={data as LeetCodeData} />;
        }
        break;
      case 'codechef':
        if ('currentRating' in data) {
          return <CodeChefStats data={data as CodeChefData} />;
        }
        break;
      case 'geeksforgeeks':
        if ('codingScore' in data) {
          return <GeeksForGeeksStats data={data as GeeksForGeeksData} />;
        }
        break;
      case 'codeforces':
        if ('rating' in data) {
          return <CodeforcesStats data={data as CodeforcesData} />;
        }
        break;
    }
    return null;
  };

  const renderDashboard = () => {
    const data = platformData[platform as keyof typeof platformData]?.[username];
    if (!data) return null;

    switch (platform) {
      case 'leetcode':
        if ('totalSolved' in data) {
          return (
            <LeetCodeDashboard
              data={data as LeetCodeData}
              onClose={() => setIsOpen(false)}
            />
          );
        }
        break;
      case 'codechef':
        if ('currentRating' in data) {
          return (
            <CodeChefDashboard
              data={data as CodeChefData}
              onClose={() => setIsOpen(false)}
            />
          );
        }
        break;
      case 'geeksforgeeks':
        if ('codingScore' in data) {
          return (
            <GeeksForGeeksDashboard
              username={username}
              data={data as GeeksForGeeksData}
              platform={platform}
              onClose={() => setIsOpen(false)}
            />
          );
        }
        break;
      case 'codeforces':
        if ('rating' in data) {
          return (
            <CodeforcesDashboard
              data={data as CodeforcesData}
              onClose={() => setIsOpen(false)}
            />
          );
        }
        break;
    }
    return null;
  };

  return (
    <>
      <div className="w-full">
        <div
          className={`group grid grid-cols-[160px_1fr] gap-4 relative bg-background 
                    w-full min-w-[280px] max-w-full h-[225px] overflow-hidden
                    shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                    hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] cursor-pointer p-4 rounded-lg
                    ${isDragging ? 'opacity-50' : ''}`}
          onClick={() => setIsOpen(true)}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
            <div className="block text-sm text-gray-800 uppercase tracking-wider font-bold mb-2">
              {platform}
            </div>
          </div>

          <div className="relative flex flex-col h-full rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 truncate w-full mb-1">
              {username}
            </h3>
            <div className="pr-2 flex-1">
              {renderStats()}
            </div>
            <div className="absolute bottom-0 right-0">
              <UpdateCardIcon onDelete={() => removePlatform(platform, username)} />
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50">
            {renderDashboard()}
          </div>
        </>
      )}
    </>
  );
} 