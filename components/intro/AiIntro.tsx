"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlatforms } from "@/lib/PlatformContext";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export interface AiIntroProps {
  username?: string;
  isPublicView?: boolean;
}

export function AiIntro({ username, isPublicView = false }: AiIntroProps) {
  const { platformData, platforms, isInitialLoading } = usePlatforms();
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetchedAdvice, setHasFetchedAdvice] = useState(false);

  useEffect(() => {
    setHasFetchedAdvice(false);
  }, [platforms.length]);

  const generateAdvice = useCallback(async () => {
    if (hasFetchedAdvice) return;
    setIsLoading(true);
    setAdvice("");

    try {
      // Prepare platform data for the AI
      const leetcodeUsers = platformData?.leetcode ? Object.values(platformData.leetcode) : [];
      const codechefUsers = platformData?.codechef ? Object.values(platformData.codechef) : [];
      const gfgUsers = platformData?.geeksforgeeks ? Object.values(platformData.geeksforgeeks) : [];
      const codeforcesUsers = platformData?.codeforces ? Object.values(platformData.codeforces) : [];

      // If no platform data is available, show a message
      if (leetcodeUsers.length === 0 && codechefUsers.length === 0 &&
          gfgUsers.length === 0 && codeforcesUsers.length === 0) {
        setAdvice("Add some coding platforms to get personalized summary!");
        setIsLoading(false);
        setHasFetchedAdvice(true);
        return;
      }

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Based on the following coding profiles data:
            ${leetcodeUsers.map(user => user ? `
              LeetCode:
              - Problems Solved: ${user.totalSolved}/${user.totalQuestions}
              - Easy: ${user.easySolved}, Medium: ${user.mediumSolved}, Hard: ${user.hardSolved}
              - Ranking: ${user.ranking}
            ` : '').join('\n')}
            
            ${codechefUsers.map(user => user ? `
              CodeChef:
              - Rating: ${user.currentRating} (${user.stars})
              - Global Rank: ${user.globalRank}
              - Contests Participated: ${user.contests}
            ` : '').join('\n')}
            
            ${gfgUsers.map(user => user ? `
              GeeksForGeeks:
              - Problems Solved: ${user.problemsSolved}
              - Score: ${user.codingScore}
              - School: ${user.schoolProblems}, Basic: ${user.basicProblems}
              - Easy: ${user.easyProblems}, Medium: ${user.mediumProblems}
              - Hard: ${user.hardProblems}
              - Current Streak: ${user.currentStreak}
            ` : '').join('\n')}

            ${codeforcesUsers.map(user => user ? `
              Codeforces:
              - Current Rating: ${user.rating} (Max: ${user.maxRating})
              - Current Rank: ${user.rank} (Max: ${user.maxRank})
              - Contest Count: ${user.contestCount}
              - Recent Performance: Avg Rank #${user.recentPerformance.averageRank}
              - Contribution: ${user.contribution}
            ` : '').join('\n')}
            
            Act like this is your profile and provide a brief (35 to 45 words stay in that range) personalized coding summary. Focus on areas of improvement, and maintain an encouraging tone. Speak directly to the recruiter and be specific. dont't add quotes on the ends. be concise and to the point. explain in detail yet be concise. dont't say here is the summary or greetingsdirectly give me the summary. just give me the summary. If Codeforces data is present, emphasize competitive programming achievements and contest performance. don't add fluff. stick to the facts`,
          },
        ],
        model: "llama3-8b-8192",
      });

      setAdvice(response.choices[0]?.message?.content || "No advice available at the moment.");
      setHasFetchedAdvice(true);
    } catch (error) {
      console.error('AI summary error:', error);
      setAdvice("I couldn't generate summary at this moment. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [platformData, hasFetchedAdvice]);

  useEffect(() => {
    generateAdvice();
  }, [generateAdvice]);

  return (
    <div className="mt-5 mb-4">
      <div className="block w-full px-4 py-3 relative rounded-lg text-[15px] sm:text-base text-gray-500 font-medium overflow-hidden z-0 select-none
                     before:absolute before:inset-0 before:rounded-lg before:content-[''] before:z-[1]
                     before:bg-[linear-gradient(var(--gradient-angle,0deg),#12c2e9,#c471ed,#f64f59)]
                     before:animate-[gradient_4s_linear_infinite]
                     after:absolute after:inset-[2px] after:rounded-lg after:bg-[#f7f7fd] sm:after:bg-[#f8f8fc] after:z-[2]"
           style={{ "--gradient-angle": "0deg" } as React.CSSProperties}>
        {isInitialLoading || isLoading ? (
          <div className="relative z-[3] w-full">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <span className="relative z-[3] block">
            {advice || "Add some coding platforms to get personalized summary!"}
          </span>
        )}
      </div>
    </div>
  );
} 