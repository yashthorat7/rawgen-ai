"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  platform: string;
  username: string;
  profileUrl: string;
  onDelete: () => void;
}

export function DashboardHeader({ platform, username, profileUrl, onDelete }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-start p-6 border-b">
      <Link 
        href={profileUrl}
        target="_blank"
        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <Image
          src={`/${platform}.png`}
          alt={platform}
          width={48}
          height={48}
          className="rounded-lg"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{username}</h2>
          <p className="text-sm text-gray-500">{platform}</p>
        </div>
      </Link>
      
      <button 
        onClick={onDelete}
        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
} 