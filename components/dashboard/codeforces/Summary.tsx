"use client";

import { MapPin, Trophy, Award, Target, Users } from 'lucide-react';
import type { CodeforcesData } from "@/lib/types";

interface SummaryProps {
  data: CodeforcesData;
}

export function Summary({ data }: SummaryProps) {
  const codeforcesProfileUrl = `https://codeforces.com/profile/${data.username}`;
  const lastOnlineDate = data.lastOnline ? new Date(data.lastOnline * 1000).toLocaleDateString() : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
      {/* Profile Info */}
      <div className="bg-white p-4 rounded-lg shadow-sm select-none">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-4">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <a 
              href={codeforcesProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden border-4 border-primary-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {data.titlePhoto ? (
                <img 
                  src={data.titlePhoto} 
                  alt={data.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-8xl font-bold text-gray-300">
                    {data.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </a>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            {/* Name and Location */}
            <div className="flex flex-wrap items-center sm:items-start justify-center sm:justify-start gap-3 mb-1">
              <div className="flex flex-col">
                <a 
                  href={codeforcesProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl sm:text-2xl font-bold hover:text-primary-600 transition-colors"
                >
                  {data.username}
                </a>
                <span className="text-xs sm:text-sm text-gray-500">
                  {data.rank}
                </span>
              </div>
              {data.organization && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 sm:px-2.5 py-0.5 text-xs sm:text-sm font-medium">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {data.organization}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <span className="text-sm font-medium">
                  Max Rating: {data.maxRating}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <span className="text-sm font-medium">
                  Friends: {data.friendOfCount}
                </span>
              </div>
            </div>

            {lastOnlineDate && (
              <span className="text-xs text-gray-500">
                Last online: {lastOnlineDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Rating */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm flex items-center sm:flex-col sm:items-center justify-start sm:justify-center text-left sm:text-center select-none">
          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mb-0 sm:mb-2 mr-3 sm:mr-0" />
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-0 sm:mb-1">
              {data.rating}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Rating</div>
          </div>
        </div>

        {/* Contribution */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm flex items-center sm:flex-col sm:items-center justify-start sm:justify-center text-left sm:text-center select-none">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-0 sm:mb-2 mr-3 sm:mr-0" />
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-0 sm:mb-1">
              {data.contribution}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Contribution</div>
          </div>
        </div>
      </div>
    </div>
  );
}