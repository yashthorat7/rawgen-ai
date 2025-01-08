"use client";

import { Trophy, Target, Brain, Zap, Trash2, ExternalLink } from 'lucide-react';
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
}

export function LeetCodeDashboard({ username, data, platform, onDelete }: LeetCodeDashboardProps) {
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
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={`/${platform}.png`}
              alt={platform}
              width={64}
              height={64}
              className="rounded-lg"
            />
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{username}</h2>
              <a 
                href={`https://leetcode.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-gray-500">Rank: #{data.ranking}</p>
          </div>
        </div>
        
        <button 
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Profile</span>
        </button>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(difficultyData).map(([key, { solved, total, color, icon }]) => (
            <div key={key} className="relative bg-gray-50 p-4 sm:p-6 rounded-xl border-2" style={{ borderColor: color }}>
              <div className="absolute -top-3 -right-3 p-2 rounded-full text-white" style={{ backgroundColor: color }}>
                {icon}
              </div>
              <h3 className="text-sm font-medium text-gray-500 capitalize">{key}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-2xl font-bold text-gray-900">{solved}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Solved</span>
                  <span className="text-gray-400">{total} total</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Difficulty Distribution</h3>
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
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

          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Submission Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Questions', value: data.totalQuestions },
                { label: 'Total Solved', value: data.totalSolved },
                { 
                  label: 'Acceptance Rate', 
                  value: `${((data.totalSolved / data.totalQuestions) * 100).toFixed(1)}%` 
                }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 