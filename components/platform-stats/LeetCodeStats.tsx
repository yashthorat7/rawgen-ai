import { LeetCodeData } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";

interface LeetCodeStatsProps {
  data: LeetCodeData | null;
}

export function LeetCodeStats({ data }: LeetCodeStatsProps) {
  if (!data) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Progress bars */}
      <div className="space-y-2.5 mt-4">
        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Easy</span>
            <span className="font-medium text-green-600">{data.easySolved}/{data.totalEasy}</span>
          </div>
          <ProgressBar 
            solved={data.easySolved} 
            total={data.totalEasy} 
            color="green"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Medium</span>
            <span className="font-medium text-yellow-600">{data.mediumSolved}/{data.totalMedium}</span>
          </div>
          <ProgressBar 
            solved={data.mediumSolved} 
            total={data.totalMedium} 
            color="yellow"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Hard</span>
            <span className="font-medium text-red-600">{data.hardSolved}/{data.totalHard}</span>
          </div>
          <ProgressBar 
            solved={data.hardSolved} 
            total={data.totalHard} 
            color="red"
          />
        </div>
      </div>

      {/* Rank at bottom */}
      <div className="mt-auto mb-1">
        <span className="text-[14px] text-gray-500">
          Rank: <span className="font-mono font-medium">#{data.ranking}</span>
        </span>
      </div>
    </div>
  );
}
