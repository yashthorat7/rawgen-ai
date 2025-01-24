"use client";

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Send } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import type { LeetCodeData } from "@/lib/types";

interface QuestionsSolvedProps {
  data: LeetCodeData;
}

interface ProgressCircleProps {
  title: string;
  value: number;
  total: number;
  color: string;
  submissions: number;
  acceptanceRate: number;
}

export function QuestionsSolved({ data }: QuestionsSolvedProps) {
  // Calculate acceptance rates for each difficulty
  const easySubmissions = data.submitStats?.totalSubmissionNum?.find(s => s.difficulty === 'Easy')?.submissions || data.totalSubmissions || 0;
  const mediumSubmissions = data.submitStats?.totalSubmissionNum?.find(s => s.difficulty === 'Medium')?.submissions || data.totalSubmissions || 0;
  const hardSubmissions = data.submitStats?.totalSubmissionNum?.find(s => s.difficulty === 'Hard')?.submissions || data.totalSubmissions || 0;

  const easyAcceptance = ((data.easySolved / (easySubmissions || 1)) * 100).toFixed(1);
  const mediumAcceptance = ((data.mediumSolved / (mediumSubmissions || 1)) * 100).toFixed(1);
  const hardAcceptance = ((data.hardSolved / (hardSubmissions || 1)) * 100).toFixed(1);
  const totalAcceptance = parseFloat(data.acceptanceRate || '0');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Questions Solved</h3>

      <div className="flex-1 flex flex-col">
        {/* Circles Container */}
        <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6 place-items-center max-h-[400px]">
          <ProgressCircle
            title="Easy"
            value={data.easySolved}
            total={data.totalEasy}
            color="#00b8a3"
            submissions={easySubmissions}
            acceptanceRate={parseFloat(easyAcceptance)}
          />
          <ProgressCircle
            title="Medium"
            value={data.mediumSolved}
            total={data.totalMedium}
            color="#ffc01e"
            submissions={mediumSubmissions}
            acceptanceRate={parseFloat(mediumAcceptance)}
          />
          <ProgressCircle
            title="Hard"
            value={data.hardSolved}
            total={data.totalHard}
            color="#ff375f"
            submissions={hardSubmissions}
            acceptanceRate={parseFloat(hardAcceptance)}
          />
          <ProgressCircle
            title="Total"
            value={data.totalSolved}
            total={data.totalQuestions}
            color="#10B981"
            submissions={data.totalSubmissions}
            acceptanceRate={totalAcceptance}
          />
        </div>

        {/* Stats and Progress Bar */}
        <div className="mt-6 space-y-4">
          {/* Total Stats */}
          <div className="flex items-center justify-center gap-12">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-primary-500" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800">
                  {data.totalSubmissions.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Total Submissions</span>
              </div>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-2xl font-bold text-gray-800">
                {data.totalSolved.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">Questions Solved</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-[400px] mx-auto w-full">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
              <div 
                className="h-full bg-[#00b8a3] transition-all duration-300"
                style={{ 
                  width: `${(data.easySolved / (data.easySolved + data.mediumSolved + data.hardSolved)) * 100}%` 
                }}
              />
              <div 
                className="h-full bg-[#ffc01e] transition-all duration-300"
                style={{ 
                  width: `${(data.mediumSolved / (data.easySolved + data.mediumSolved + data.hardSolved)) * 100}%` 
                }}
              />
              <div 
                className="h-full bg-[#ff375f] transition-all duration-300"
                style={{ 
                  width: `${(data.hardSolved / (data.easySolved + data.mediumSolved + data.hardSolved)) * 100}%` 
                }}
              />
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00b8a3]" />
              <span className="text-gray-600">{data.easySolved} Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffc01e]" />
              <span className="text-gray-600">{data.mediumSolved} Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff375f]" />
              <span className="text-gray-600">{data.hardSolved} Hard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCircle({ title, value, total, color, submissions, acceptanceRate }: ProgressCircleProps) {
  const percentage = (value / total) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square max-w-[140px] group">
        <CircularProgressbar
          value={percentage}
          text={`${percentage.toFixed(1)}%`}
          className="group-hover:[&>.CircularProgressbar-text]:opacity-0 transition-all duration-300"
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: '#E5E7EB',
            textSize: '20px',
            pathTransitionDuration: 0.5,
          })}
        />
        
        {/* Default View (non-hover) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-base text-gray-600 mt-12 sm:group-hover:hidden transition-all duration-300">
            {value}/{total}
          </div>
        </div>

        {/* Hover View */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
          <div className="text-xl font-bold" style={{ color }}>
            {acceptanceRate}%
          </div>
          <div className="text-sm text-gray-600">acceptance</div>
        </div>
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
