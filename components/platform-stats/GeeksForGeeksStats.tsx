import { GeeksForGeeksData } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface GeeksForGeeksStatsProps {
  data: GeeksForGeeksData | null;
  isLoading?: boolean;
}

export function GeeksForGeeksStats({ data, isLoading }: GeeksForGeeksStatsProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        {/* Institution */}
        <div className="text-xs text-gray-600 text-center mb-3 mt-4">
          {data.institution}
        </div>

        {/* Progress bars */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Easy</span>
              <span className="font-medium text-green-600">{data.easyCount}</span>
            </div>
            <ProgressBar solved={data.easyCount} color="green" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Medium</span>
              <span className="font-medium text-yellow-600">{data.mediumCount}</span>
            </div>
            <ProgressBar solved={data.mediumCount} color="yellow" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">Hard</span>
              <span className="font-medium text-red-600">{data.hardCount}</span>
            </div>
            <ProgressBar solved={data.hardCount} color="red" />
          </div>
        </div>
      </div>

      {/* Score and streak at bottom */}
      <div className="mt-auto mb-1">
        <div className="text-[14px] text-gray-500">
          Score: <span className="font-mono font-medium">{data.codingScore}</span>
          <span className="mx-2">•</span>
          Streak: <span className="font-mono font-medium">{data.currentStreak}</span>
        </div>
      </div>
    </div>
  );
}
