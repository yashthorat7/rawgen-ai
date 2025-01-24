"use client";

import { Building, MapPin, Link2, Star, Trophy, Github, Linkedin, Twitter, Globe, Calendar, Flame } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SummaryProps {
  data: LeetCodeData;
}

export function Summary({ data }: SummaryProps) {
  const leetcodeProfileUrl = `https://leetcode.com/${data.username}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
      {/* Profile Info */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-start gap-4">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <a 
              href={leetcodeProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <img 
                src={data.avatar} 
                alt={data.username}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </a>
            <div className="absolute -bottom-3 -right-3 bg-yellow-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-lg font-bold">{data.starRating}</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            {/* Name and Location */}
            <div className="flex flex-wrap items-start gap-3 mb-1">
              <div className="flex flex-col">
                <a 
                  href={leetcodeProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-bold hover:text-primary-600 transition-colors"
                >
                  {data.realName || data.username}
                </a>
                <span className="text-sm text-gray-500">@{data.username}</span>
              </div>
              {data.countryName && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-1" />
                  {data.countryName}
                </span>
              )}
            </div>

            {/* Rank */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500 drop-shadow" />
              </div>
              <span className="text-xl font-bold text-primary-600">Rank #{data.ranking}</span>
            </div>

            {/* Work Info */}
            <div className="flex flex-wrap gap-2 mb-2">
              {data.jobTitle && (
                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium">
                  <Building className="w-4 h-4 mr-1" />
                  {data.jobTitle}
                </span>
              )}
              {data.company && (
                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium">
                  <Building className="w-4 h-4 mr-1" />
                  {data.company}
                </span>
              )}
              {data.school && (
                <span className="inline-flex items-center rounded-lg bg-blue-100 text-blue-700 px-2.5 py-0.5 text-sm font-medium">
                  {data.school}
                </span>
              )}
            </div>

            {/* About */}
            {data.about && (
              <p className="text-gray-600 italic mb-3 line-clamp-2">{data.about}</p>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              {data.social.github && (
                <a
                  href={data.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {data.social.linkedin && (
                <a
                  href={data.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#0077b5] transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {data.social.twitter && (
                <a
                  href={data.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#1DA1F2] transition-colors"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {data.websites?.map((website, index) => (
                <a
                  key={index}
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Globe className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Days */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
          <Calendar className="w-8 h-8 text-primary-500 mb-2" />
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.calendar.totalActiveDays}
          </div>
          <div className="text-sm text-gray-600">Active Days</div>
        </div>

        {/* Max Streak */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
          <Flame className="w-8 h-8 text-orange-500 mb-2" />
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.calendar.streak}
          </div>
          <div className="text-sm text-gray-600">Max Streak</div>
        </div>
      </div>
    </div>
  );
}