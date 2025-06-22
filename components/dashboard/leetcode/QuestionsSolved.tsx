"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Send, CheckCircle2, Code2, Sigma } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
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
  const easySubmissions =
    data.submitStats?.totalSubmissionNum?.find((s) => s.difficulty === "Easy")
      ?.submissions ||
    data.totalSubmissions ||
    0;
  const mediumSubmissions =
    data.submitStats?.totalSubmissionNum?.find((s) => s.difficulty === "Medium")
      ?.submissions ||
    data.totalSubmissions ||
    0;
  const hardSubmissions =
    data.submitStats?.totalSubmissionNum?.find((s) => s.difficulty === "Hard")
      ?.submissions ||
    data.totalSubmissions ||
    0;

  const easyAcceptance = (
    (data.easySolved / (easySubmissions || 1)) *
    100
  ).toFixed(1);
  const mediumAcceptance = (
    (data.mediumSolved / (mediumSubmissions || 1)) *
    100
  ).toFixed(1);
  const hardAcceptance = (
    (data.hardSolved / (hardSubmissions || 1)) *
    100
  ).toFixed(1);
  const totalAcceptance = parseFloat(data.acceptanceRate || "0");

  const totalProgress = {
    easy:
      (data.easySolved /
        (data.easySolved + data.mediumSolved + data.hardSolved)) *
      100,
    medium:
      (data.mediumSolved /
        (data.easySolved + data.mediumSolved + data.hardSolved)) *
      100,
    hard:
      (data.hardSolved /
        (data.easySolved + data.mediumSolved + data.hardSolved)) *
      100,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col select-none">
      <h3 className="text-lg font-semibold mb-4">Questions Solved</h3>

      <div className="flex-1 flex flex-col">
        {/* Circles Container */}
        <div className="flex-1 flex flex-col justify-center items-center gap-6 max-h-[500px] sm:gap-8">
          <div className="w-full flex justify-center">
            <div className="flex gap-6 sm:gap-8 sm:transform-none sm:scale-100 transform scale-[0.85] origin-center">
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
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="flex gap-6 sm:gap-8 sm:transform-none sm:scale-100 transform scale-[0.85] origin-center">
              <ProgressCircle
                title="Total"
                value={data.totalSolved}
                total={data.totalQuestions}
                color="#3b82f6"
                submissions={data.totalSubmissions}
                acceptanceRate={totalAcceptance}
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
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#00b8a3"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.easy}, 100`}
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ffc01e"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.medium}, 100`}
                      transform={`rotate(${totalProgress.easy * 3.6}, 18, 18)`}
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ff375f"
                      strokeWidth="3"
                      strokeDasharray={`${totalProgress.hard}, 100`}
                      transform={`rotate(${(totalProgress.easy + totalProgress.medium) * 3.6}, 18, 18)`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs sm:text-sm font-medium group-hover:opacity-0 transition-all duration-300">
                    <span className="text-[#00b8a3]">Easy</span>
                    <span className="text-[#ffc01e]">Medium</span>
                    <span className="text-[#ff375f]">Hard</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[#00b8a3]">
                      {totalProgress.easy.toFixed(1)}%
                    </span>
                    <span className="text-[#ffc01e]">
                      {totalProgress.medium.toFixed(1)}%
                    </span>
                    <span className="text-[#ff375f]">
                      {totalProgress.hard.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="mt-3 text-base font-medium text-gray-700">
                  Summary
                </span>
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
                  {data.totalSubmissions.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Total Submissions</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800">
                  {data.totalSolved.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Questions Solved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCircle({
  title,
  value,
  total,
  color,
  submissions,
  acceptanceRate,
}: ProgressCircleProps) {
  const percentage = (value / total) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[112px] sm:w-[140px] aspect-square group">
        <CircularProgressbar
          value={percentage}
          text={`${percentage.toFixed(1)}%`}
          className="group-hover:[&>.CircularProgressbar-text]:opacity-0 transition-all duration-300"
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: "#E5E7EB",
            textSize: "20px",
            pathTransitionDuration: 0.5,
          })}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-base text-gray-600 mt-12 group-hover:hidden transition-all duration-300">
            {value}/{total}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="text-xl font-bold" style={{ color }}>
            {acceptanceRate}%
          </div>
          <div className="text-sm text-gray-600">acceptance</div>
        </div>
      </div>
      <span className="mt-3 text-base font-medium" style={{ color }}>
        {title}
      </span>
    </div>
  );
}
