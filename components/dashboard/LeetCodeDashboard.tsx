"use client";

import { Trophy, Target, Brain, Zap, Trash2, ExternalLink, X } from 'lucide-react';
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
import type { LeetCodeData } from "@/lib/types";
import Image from "next/image";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement
);

interface LeetCodeDashboardProps {
  username: string;
  data: LeetCodeData;
  platform: string;
  onDelete: () => void;
  onClose: () => void;
}

export function LeetCodeDashboard({ username, data, platform, onDelete, onClose }: LeetCodeDashboardProps) {
  const difficultyData = {
    easy: {
      solved: data.easySolved,
      total: data.totalEasy,
      color: '#00b4a2',
      icon: <Brain className="w-5 h-5 text-white" />,
    },
    medium: {
      solved: data.mediumSolved,
      total: data.totalMedium,
      color: '#ffa116',
      icon: <Target className="w-5 h-5 text-white" />,
    },
    hard: {
      solved: data.hardSolved,
      total: data.totalHard,
      color: '#ff375f',
      icon: <Zap className="w-5 h-5 text-white" />,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg z-50 max-h-[90vh] overflow-y-auto sm:max-h-[85vh] w-full max-w-[95vw] sm:max-w-4xl mx-auto mt-[6vh] sm:mt-0">
      <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-[1]">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Image
              src={`/${platform}.png`}
              alt={platform}
              width={64}
              height={64}
              className="rounded-lg w-12 h-12 sm:w-16 sm:h-16"
              style={{ objectFit: 'contain' }}
            />
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{username}</h2>
              <a 
                href={`https://leetcode.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Rank: #{data.ranking}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={onDelete}
            className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(difficultyData).map(([key, { solved, total, color, icon }]) => (
            <div key={key} className="relative bg-gray-50 p-3 sm:p-6 rounded-xl border-2" style={{ borderColor: color }}>
              <div className="absolute -top-2 -right-2 p-1.5 sm:p-2 rounded-full text-white" style={{ backgroundColor: color }}>
                {icon}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 capitalize">{key}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{solved}</p>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Solved</span>
                  <span className="text-gray-400">{total} total</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(solved/total) * 100}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}40`
                    }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50 p-3 sm:p-6 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Difficulty Distribution</h3>
            <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
              <Doughnut 
                data={{
                  labels: ['Easy', 'Medium', 'Hard'],
                  datasets: [{
                    data: [data.easySolved, data.mediumSolved, data.hardSolved],
                    backgroundColor: [
                      difficultyData.easy.color,
                      difficultyData.medium.color,
                      difficultyData.hard.color,
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

          <div className="bg-gray-50 p-3 sm:p-6 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Submission Stats</h3>
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: 'Total Questions', value: data.totalQuestions },
                { label: 'Total Solved', value: data.totalSolved },
                { 
                  label: 'Acceptance Rate', 
                  value: `${((data.totalSolved / data.totalQuestions) * 100).toFixed(1)}%` 
                }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-xs sm:text-sm text-gray-600">{label}</span>
                  <span className="text-xs sm:text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 