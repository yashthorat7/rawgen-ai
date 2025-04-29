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
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm select-none">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <a 
              href={codeforcesProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-24 sm:w-32 h-24 sm:h-32 rounded-2xl overflow-hidden border-4 border-primary-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {data.titlePhoto ? (
                <img 
                  src={data.titlePhoto} 
                  alt={data.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-6xl sm:text-8xl font-bold text-gray-300">
                    {data.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </a>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 sm:space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-2">
                  <a 
                    href={codeforcesProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg sm:text-2xl font-bold hover:text-primary-600 transition-colors"
                  >
                    {data.username}
                  </a>
                  {data.organization && (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs sm:text-sm font-medium">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {data.organization}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {data.rank}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />
                <span className="text-xs sm:text-sm font-medium">
                  Max Rating: {data.maxRating}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium">
                  Friends: {data.friendOfCount}
                </span>
              </div>
            </div>

            {lastOnlineDate && (
              <span className="text-xs text-gray-500 block">
                Last online: {lastOnlineDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-2.5 sm:p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center select-none">
          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mb-1 sm:mb-2" />
          <div>
            <div className="text-lg sm:text-2xl font-bold text-gray-900">
              {data.rating}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Rating</div>
          </div>
        </div>

        {/* Contribution */}
        <div className="bg-white p-2.5 sm:p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center select-none">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-1 sm:mb-2" />
          <div>
            <div className="text-lg sm:text-2xl font-bold text-gray-900">
              {data.contribution}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Contribution</div>
          </div>
        </div>
      </div>
    </div>
  );
}