import { CodeChefData } from "@/lib/types";
import { Star } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface CodeChefStatsProps {
  data: CodeChefData | null;
  isLoading?: boolean;
}

export function CodeChefStats({ data, isLoading }: CodeChefStatsProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  const getRecentActivity = () => {
    if (!data.submissionStats.length) return 0;
    const last3Months = data.submissionStats.slice(-3);
    return last3Months.reduce((sum: number, item: { submissions: number }) => sum + item.submissions, 0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Stars and Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: data.stars }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-600">
            {data.currentRating}
          </span>
        </div>

        {/* Progress bars */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Contests</span>
              <span className="font-medium text-purple-600">{data.totalContests}</span>
            </div>
            <ProgressBar 
              solved={data.totalContests}
              color="purple"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Recent Activity</span>
              <span className="font-medium text-green-600">{getRecentActivity()}</span>
            </div>
            <ProgressBar 
              solved={getRecentActivity()}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Ranks at bottom */}
      <div className="mt-auto mb-1">
        <div className="text-[14px] text-gray-500">
          Global: <span className="font-mono font-medium">#{data.globalRank}</span>
          <span className="mx-2">|</span>
          {data.countryName}: <span className="font-mono font-medium">#{data.countryRank}</span>
        </div>
      </div>
    </div>
  );
}