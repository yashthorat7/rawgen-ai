import { CodeforcesData } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { Star } from "lucide-react";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface CodeforcesStatsProps {
  data: CodeforcesData | null;
  isLoading?: boolean;
}

export function CodeforcesStats({ data, isLoading }: CodeforcesStatsProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center mb-3">
        <div className="text-sm font-bold text-gray-600 mb-3 capitalize flex items-center gap-1">
          <Star size={14} className="text-yellow-500" fill="currentColor" />
          {data.rank || 'Unrated'}
        </div>

        {/* Progress bars */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Contribution</span>
              <span className="font-medium text-blue-600">{data.contribution}</span>
            </div>
            <ProgressBar solved={data.contribution} color="blue" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Friend of</span>
              <span className="font-medium text-purple-600">{data.friendOfCount}</span>
            </div>
            <ProgressBar solved={data.friendOfCount} color="purple" />
          </div>
        </div>
      </div>

      {/* Max Rating at bottom */}
      <div className="mt-auto mb-1">
        <div className="text-[14px] text-gray-500">
          Max Rating: <span className="font-mono font-medium">{data.maxRating}</span>
        </div>
      </div>
    </div>
  );
} 