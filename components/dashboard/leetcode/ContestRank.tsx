"use client";

import { Line } from 'react-chartjs-2';
import { Trophy } from 'lucide-react';
import type { LeetCodeData } from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ContestRankProps {
  data: LeetCodeData;
}

export function ContestRank({ data }: ContestRankProps) {
  const contestData = {
    labels: data.contests.map(contest => contest.title),
    datasets: [
      {
        label: 'Rating',
        data: data.contests.map(contest => contest.rating),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const contest = data.contests[context.dataIndex];
            return [
              `Rating: ${contest.rating}`,
              `Rank: ${contest.ranking}`,
              `Contest: ${contest.title}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Rating'
        }
      },
      x: {
        display: false // Hide x-axis labels for better appearance
      }
    }
  };

  // Calculate stats
  const latestRating = data.contests[data.contests.length - 1]?.rating || 0;
  const highestRating = Math.max(...data.contests.map(c => c.rating));
  const totalContests = data.contests.length;
  const globalRank = data.contests[data.contests.length - 1]?.globalRanking || 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Contest Performance</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Current Rating</p>
          <p className="text-xl font-semibold">{latestRating}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Highest Rating</p>
          <p className="text-xl font-semibold">{highestRating}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Contests</p>
          <p className="text-xl font-semibold">{totalContests}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Global Ranking</p>
          <p className="text-xl font-semibold">#{globalRank}</p>
        </div>
      </div>

      <div className="h-64">
        <Line data={contestData} options={options} />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Contests</h4>
        <div className="space-y-2">
          {data.contests.slice(-5).reverse().map((contest, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium">{contest.title}</p>
                <p className="text-sm text-gray-600">Rank: #{contest.ranking}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{contest.rating}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}