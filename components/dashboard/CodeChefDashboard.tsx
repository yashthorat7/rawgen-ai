"use client";

import { Trophy, Star, Target, TrendingUp, ExternalLink, X } from 'lucide-react';
import type { CodeChefData } from "@/lib/types";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement
);

interface CodeChefDashboardProps {
  username: string;
  data: CodeChefData;
  platform: string;
  onClose: () => void;
}

export function CodeChefDashboard({ username, data, platform, onClose }: CodeChefDashboardProps) {
  const stats = [
    {
      label: "Current Rating",
      value: data.currentRating,
      color: "#00b4a2",
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      subtitle: data.stars,
    },
    {
      label: "Highest Rating",
      value: data.highestRating,
      color: "#ffa116",
      icon: <Trophy className="w-5 h-5 text-white" />,
    },
    {
      label: "Total Contests",
      value: data.contests,
      color: "#ff375f",
      icon: <Target className="w-5 h-5 text-white" />,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
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
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-primary-600">{username}</h2>
                  <a
                    href={`https://codechef.com/users/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-500">
                  {data.stars} ⭐ | Global Rank: #{data.globalRank}
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
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {stats.map(({ label, value, color, icon, subtitle }) => (
                <div key={label} className="relative bg-gray-50 p-3 sm:p-6 rounded-xl border-2" style={{ borderColor: color }}>
                  <div className="absolute -top-2 -right-2 p-1.5 sm:p-2 rounded-full text-white" style={{ backgroundColor: color }}>
                    {icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">{label}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Contests */}
              <div className="bg-gray-50 p-3 sm:p-6 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Contests</h3>
                <div className="space-y-3 sm:space-y-4">
                  {data.ratingHistory.slice(0, 5).map((contest, index) => (
                    <div key={index} className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contest.name}</p>
                        <p className="text-xs text-gray-500">{contest.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Rank</p>
                          <p className="text-sm font-semibold text-right">#{contest.rank}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Rating</p>
                          <p className="text-sm font-semibold text-right">{contest.rating}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="bg-gray-50 p-3 sm:p-6 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Rating Distribution</h3>
                <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: ['Current Rating', 'To Next Star'],
                      datasets: [{
                        data: [data.currentRating, data.highestRating - data.currentRating],
                        backgroundColor: [
                          '#00b4a2',
                          '#e5e7eb',
                        ],
                        borderWidth: 0,
                        hoverOffset: 4,
                      }],
                    }}
                    options={{
                      cutout: '65%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        },
                      },
                      animation: {
                        animateScale: true,
                        animateRotate: true
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 