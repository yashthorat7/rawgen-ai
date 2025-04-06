"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePlatforms } from "@/lib/PlatformContext";
import Groq from "groq-sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { LeetCodeData, CodeChefData, GeeksForGeeksData, CodeforcesData } from "@/lib/types";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
  dangerouslyAllowBrowser: true,
});

const convexHttp = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface AiIntroProps {
  username?: string;
  isPublicView?: boolean;
}

interface DirectDataType {
  leetcode: Record<string, LeetCodeData>;
  codechef: Record<string, CodeChefData>;
  geeksforgeeks: Record<string, GeeksForGeeksData>;
  codeforces: Record<string, CodeforcesData>;
}

export function AiIntro({ username, isPublicView = false }: AiIntroProps) {
  const { platformData, platforms, isInitialLoading } = usePlatforms();
  const { user } = useUser();
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetchedAdvice, setHasFetchedAdvice] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [directData, setDirectData] = useState<DirectDataType>({
    leetcode: {},
    codechef: {},
    geeksforgeeks: {},
    codeforces: {}
  });
  const generateRequestInProgress = useRef(false);

  useEffect(() => {
    setHasFetchedAdvice(false);
  }, [platforms.length]);

  // Directly fetch platform data using the userId index
  useEffect(() => {
    if (hasFetchedAdvice || (isPublicView && Object.keys(platformData || {}).length > 0)) {
      return;
    }

    const fetchDirectData = async () => {
      if (isFetchingData) return;
      setIsFetchingData(true);
      
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email && !isPublicView) return;
        
        // For public view, use the username parameter if provided
        const data = isPublicView && username 
          ? await convexHttp.query(api.users.getFullPlatformDataByUsername, { username })
          : await convexHttp.query(api.users.getPlatformDataByEmail, { email: email || '' });

        if (!data || !Array.isArray(data) || data.length === 0) {
          setIsFetchingData(false);
          return;
        }

        const newData: DirectDataType = {
          leetcode: {},
          codechef: {},
          geeksforgeeks: {},
          codeforces: {}
        };

        for (const item of data) {
          try {
            const parsedData = JSON.parse(item.fullData);
            // Get the profile to know what platform this is for
            const profilesResult = isPublicView && username
              ? await convexHttp.query(api.users.getUserByUsername, { username })
              : await convexHttp.query(api.users.getProfiles, { email: email || '' });
            
            // For public view, we get a user object with profiles property
            // For private view, we get an array of profiles directly
            let profilesList: any[] = [];
            if (isPublicView && username && profilesResult) {
              if (profilesResult && typeof profilesResult === 'object' && 'profiles' in profilesResult) {
                profilesList = profilesResult.profiles;
              }
            } else if (Array.isArray(profilesResult)) {
              profilesList = profilesResult;
            }
            
            const profile = profilesList.find((p: { _id: string }) => p._id === item.profileId);

            if (!profile) continue;

            switch (profile.platformName) {
              case 'leetcode':
                newData.leetcode[profile.platformUsername] = parsedData as LeetCodeData;
                break;
              case 'codechef':
                newData.codechef[profile.platformUsername] = parsedData as CodeChefData;
                break;
              case 'geeksforgeeks':
                newData.geeksforgeeks[profile.platformUsername] = parsedData as GeeksForGeeksData;
                break;
              case 'codeforces':
                newData.codeforces[profile.platformUsername] = parsedData as CodeforcesData;
                break;
            }
          } catch (error) {
            console.error("Error parsing platform data:", error);
          }
        }

        setDirectData(newData);
      } catch (error) {
        console.error("Error fetching direct platform data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchDirectData();
  }, [user?.primaryEmailAddress?.emailAddress, username, isPublicView, platformData, hasFetchedAdvice, isFetchingData]);

  const generateAdvice = useCallback(async () => {
    if (hasFetchedAdvice || generateRequestInProgress.current) return;
    generateRequestInProgress.current = true;
    setIsLoading(true);
    
    try {
      // Prepare platform data - prefer direct data if available, fall back to context data
      const mergedData = {
        leetcode: { ...platformData?.leetcode, ...directData.leetcode },
        codechef: { ...platformData?.codechef, ...directData.codechef },
        geeksforgeeks: { ...platformData?.geeksforgeeks, ...directData.geeksforgeeks },
        codeforces: { ...platformData?.codeforces, ...directData.codeforces }
      };
      
      const leetcodeUsers = Object.values(mergedData.leetcode || {});
      const codechefUsers = Object.values(mergedData.codechef || {});
      const gfgUsers = Object.values(mergedData.geeksforgeeks || {});
      const codeforcesUsers = Object.values(mergedData.codeforces || {});

      // If no platform data is available, show a message
      if (leetcodeUsers.length === 0 && codechefUsers.length === 0 &&
          gfgUsers.length === 0 && codeforcesUsers.length === 0) {
        setAdvice("Nothing has been added yet!");
        setIsLoading(false);
        setHasFetchedAdvice(true);
        generateRequestInProgress.current = false;
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
              - Contests Participated: ${user.totalContests}
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
      generateRequestInProgress.current = false;
    }
  }, [platformData, directData, hasFetchedAdvice]);

  useEffect(() => {
    // Only generate advice when we have data from either source and not already fetching
    if ((!isInitialLoading && !isFetchingData) && 
        (Object.values(directData).some(platform => Object.keys(platform).length > 0) || 
        Object.values(platformData || {}).some(platform => Object.keys(platform || {}).length > 0))) {
      generateAdvice();
    }
  }, [generateAdvice, directData, platformData, isInitialLoading, isFetchingData]);

  return (
    <div className="mt-5 mb-4">
      <div className="block w-full px-4 py-3 relative rounded-lg text-[15px] sm:text-base text-gray-500 font-medium overflow-hidden z-0 select-none
                     before:absolute before:inset-0 before:rounded-lg before:content-[''] before:z-[1]
                     before:bg-[linear-gradient(var(--gradient-angle,0deg),#12c2e9,#c471ed,#f64f59)]
                     before:animate-[gradient_4s_linear_infinite]
                     after:absolute after:inset-[2px] after:rounded-lg after:bg-[#f7f7fd] sm:after:bg-[#f8f8fc] after:z-[2]"
           style={{ "--gradient-angle": "0deg" } as React.CSSProperties}>
        {isInitialLoading || isLoading || isFetchingData ? (
          <div className="relative z-[3] w-full">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <span className="relative z-[3] block">
            {advice || "Nothing has been added yet!"}
          </span>
        )}
      </div>
    </div>
  );
} 