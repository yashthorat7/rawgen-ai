"use client";

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Code2, CheckCircle2, Trophy } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import type { GeeksForGeeksData } from "@/lib/types";
import { useState } from 'react';

interface QuestionsSolvedProps {
  data: GeeksForGeeksData;
}

interface ProgressCircleProps {
  title: string;
  value: number;
  total: number;
  color: string;
}

export function QuestionsSolved({ data }: QuestionsSolvedProps) {
  const TOTAL_SCHOOL = 600;
  const TOTAL_BASIC = 810;
  const TOTAL_EASY = 1702;
  const TOTAL_MEDIUM = 2161;
  const TOTAL_HARD = 943;

  const totalProgress = {
    school: (data.schoolProblems / data.totalProblems) * 100,
    basic: (data.basicProblems / data.totalProblems) * 100,
    easy: (data.easyProblems / data.totalProblems) * 100,
    medium: (data.mediumProblems / data.totalProblems) * 100,
    hard: (data.hardProblems / data.totalProblems) * 100
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col select-none">
      <h3 className="text-lg font-semibold mb-4">Questions Solved</h3>

      <div className="flex-1 flex flex-col">
        {/* Circles Container */}
        <div className="flex-1 flex flex-col justify-center items-center gap-6 max-h-[500px] sm:gap-8">
          {/* First row - 3 circles */}
          <div className="w-full flex justify-center">
            <div className="flex gap-6 sm:gap-8 sm:transform-none sm:scale-100 transform scale-[0.85] origin-center">
              <ProgressCircle
                title="School"
                value={data.schoolProblems}
                total={TOTAL_SCHOOL}
                color="#8b5cf6"
              />
              <ProgressCircle
                title="Basic"
                value={data.basicProblems}
                total={TOTAL_BASIC}
                color="#3b82f6"
              />
              <ProgressCircle
                title="Easy"
                value={data.easyProblems}
                total={TOTAL_EASY}
                color="#00b8a3"
              />
            </div>
          </div>
          {/* Second row - 3 circles */}
          <div className="w-full flex justify-center">
            <div className="flex gap-6 sm:gap-8 sm:transform-none sm:scale-100 transform scale-[0.85] origin-center">
              <ProgressCircle
                title="Medium"
                value={data.mediumProblems}
                total={TOTAL_MEDIUM}
                color="#ffc01e"
              />
              <ProgressCircle
                title="Hard"
                value={data.hardProblems}
                total={TOTAL_HARD}
                color="#ff375f"
              />
              <div className="flex flex-col items-center">
                <div className="w-[112px] sm:w-[140px] relative aspect-square group">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="3"
                    />
                    {/* School segment */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.school}, 100`}
                    />
                    {/* Basic segment */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.basic}, 100`}
                      transform={`rotate(${totalProgress.school * 3.6}, 18, 18)`}
                    />
                    {/* Easy segment */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#00b8a3"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.easy}, 100`}
                      transform={`rotate(${(totalProgress.school + totalProgress.basic) * 3.6}, 18, 18)`}
                    />
                    {/* Medium segment */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ffc01e"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.medium}, 100`}
                      transform={`rotate(${(totalProgress.school + totalProgress.basic + totalProgress.easy) * 3.6}, 18, 18)`}
                    />
                    {/* Hard segment */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ff375f"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.hard}, 100`}
                      transform={`rotate(${(totalProgress.school + totalProgress.basic + totalProgress.easy + totalProgress.medium) * 3.6}, 18, 18)`}
                    />
                  </svg>
                  {/* Default Text Labels */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs sm:text-sm font-medium hover:none sm:group-hover:opacity-0 transition-all duration-300">
                    <span className="text-[#00b8a3]">Easy</span>
                    <span className="text-[#ffc01e]">Medium</span>
                    <span className="text-[#ff375f]">Hard</span>
                  </div>
                  {/* Hover Text Labels */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs sm:text-sm font-medium opacity-0 hover:none sm:group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[#00b8a3]">{totalProgress.easy.toFixed(1)}%</span>
                    <span className="text-[#ffc01e]">{totalProgress.medium.toFixed(1)}%</span>
                    <span className="text-[#ff375f]">{totalProgress.hard.toFixed(1)}%</span>
                  </div>
                </div>
                <span className="mt-3 text-base font-medium text-gray-700">Summary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Code2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800">
                  {data.codingScore.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Coding Score</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800">
                  {data.totalProblems.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Total Solved</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800">
                  {data.contestRating.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Contest Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCircle({ title, value, total, color }: ProgressCircleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = (value / total) * 100;

  return (
    <div 
      className="flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-[112px] sm:w-[140px] aspect-square relative">
        <CircularProgressbar
          value={percentage}
          text={isHovered ? `${percentage.toFixed(1)}%` : `${value}/${total}`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: '#E5E7EB',
            textSize: '16px',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      <span 
        className="mt-3 text-base font-medium"
        style={{ color }}
      >
        {title}
      </span>
    </div>
  );
}
