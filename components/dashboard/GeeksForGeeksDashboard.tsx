"use client";

import { Trophy, Brain, Target, Zap, ExternalLink, X, School } from 'lucide-react';
import type { GeeksForGeeksData } from "@/lib/types";
import Image from "next/image";

interface GeeksForGeeksProps {
  username: string;
  data: GeeksForGeeksData;
  platform: string;
  onClose: () => void;
}

export function GeeksForGeeksDashboard({ username, data, platform, onClose }: GeeksForGeeksProps) {
  const difficultyData = [
    {
      label: "Basic",
      value: data.basicCount,
      color: "#00b4a2",
      icon: <Brain className="w-5 h-5 text-white" />,
    },
    {
      label: "Easy",
      value: data.easyCount,
      color: "#3CCF4E",
      icon: <Target className="w-5 h-5 text-white" />,
    },
    {
      label: "Medium",
      value: data.mediumCount,
      color: "#ffa116",
      icon: <Zap className="w-5 h-5 text-white" />,
    },
    {
      label: "Hard",
      value: data.hardCount,
      color: "#ff375f",
      icon: <Trophy className="w-5 h-5 text-white" />,
    },
  ];

  const stats = [
    {
      label: "Overall Coding Score",
      value: data.codingScore,
      color: "#00b4a2",
    },
    {
      label: "Problems Solved",
      value: data.problemsSolved,
      color: "#ffa116",
    },
    {
      label: "Current Streak",
      value: `${data.currentStreak} days`,
      color: "#ff375f",
    },
  ];

  return (
    <>
      <div className="dialog-backdrop" onClick={onClose} />
      <div className="dialog-content">
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <Image
                    src={`/${platform}.png`}
                    alt={platform}
                    width={64}
                    height={64}
                    className="rounded-lg w-16 h-16"
                    style={{ objectFit: 'contain' }}
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                    <School className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-primary-600">{username}</h2>
                    <a
                      href={`https://auth.geeksforgeeks.org/user/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-sm text-gray-500">
                    {data.institution || "GeeksForGeeks User"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {stats.map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 p-6 rounded-xl border-2" style={{ borderColor: color }}>
                    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                  </div>
                ))}
              </div>

              {/* Difficulty Distribution */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Problem Solving Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {difficultyData.map(({ label, value, color, icon }) => (
                    <div key={label} className="relative bg-white p-4 rounded-lg border-2" style={{ borderColor: color }}>
                      <div className="absolute -top-2 -right-2 p-1.5 rounded-full text-white" style={{ backgroundColor: color }}>
                        {icon}
                      </div>
                      <h4 className="text-sm font-medium text-gray-500">{label}</h4>
                      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              {(data.monthlyCoding || data.weeklyCoding || data.contestRating || data.institutionRank) && (
                <div className="mt-6 bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Additional Stats</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.monthlyCoding && (
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="text-sm text-gray-500">Monthly Coding Score</h4>
                        <p className="text-lg font-semibold">{data.monthlyCoding}</p>
                      </div>
                    )}
                    {data.weeklyCoding && (
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="text-sm text-gray-500">Weekly Coding Score</h4>
                        <p className="text-lg font-semibold">{data.weeklyCoding}</p>
                      </div>
                    )}
                    {data.contestRating && (
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="text-sm text-gray-500">Contest Rating</h4>
                        <p className="text-lg font-semibold">{data.contestRating}</p>
                      </div>
                    )}
                    {data.institutionRank && (
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="text-sm text-gray-500">Institution Rank</h4>
                        <p className="text-lg font-semibold">#{data.institutionRank}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 