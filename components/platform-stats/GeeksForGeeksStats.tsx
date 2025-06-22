import { GeeksForGeeksData } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface GeeksForGeeksStatsProps {
  data: GeeksForGeeksData | null;
  isLoading?: boolean;
}

export function GeeksForGeeksStats({
  data,
  isLoading,
}: GeeksForGeeksStatsProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  const EASY_TOTAL = 1702;
  const MEDIUM_TOTAL = 2161;
  const HARD_TOTAL = 943;

  return (
    <div className="h-full flex flex-col">
      {/* Progress bars */}
      <div className="space-y-2.5 mt-4">
        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Easy</span>
            <span className="font-medium text-green-600">
              {data.easyProblems}/{EASY_TOTAL}
            </span>
          </div>
          <ProgressBar
            solved={data.easyProblems}
            total={EASY_TOTAL}
            color="green"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Medium</span>
            <span className="font-medium text-yellow-600">
              {data.mediumProblems}/{MEDIUM_TOTAL}
            </span>
          </div>
          <ProgressBar
            solved={data.mediumProblems}
            total={MEDIUM_TOTAL}
            color="yellow"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span className="font-medium">Hard</span>
            <span className="font-medium text-red-600">
              {data.hardProblems}/{HARD_TOTAL}
            </span>
          </div>
          <ProgressBar
            solved={data.hardProblems}
            total={HARD_TOTAL}
            color="red"
          />
        </div>
      </div>

      {/* Score and streak at bottom */}
      <div className="mt-auto mb-1">
        <div className="text-[14px] text-gray-500">
          Score:{" "}
          <span className="font-mono font-medium">{data.codingScore}</span>
          <span className="mx-2">|</span>
          Streak:{" "}
          <span className="font-mono font-medium">{data.currentStreak}</span>
        </div>
      </div>
    </div>
  );
}
