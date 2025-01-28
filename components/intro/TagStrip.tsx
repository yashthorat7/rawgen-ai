"use client";

import { usePlatforms } from "@/lib/PlatformContext";
import { useEffect, useState, useCallback } from "react";
import Groq from "groq-sdk";

// Initialize Groq only if API key is available
const groq = process.env.NEXT_PUBLIC_GROQ_API_KEY ? new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
}) : null;

type Tag = {
  text: string;
  id: number;
};

export interface TagStripProps {
  username?: string;
  isPublicView?: boolean;
}

export function TagStrip({ username, isPublicView = false }: TagStripProps) {
  const { platformData, platforms } = usePlatforms();
  const [tags, setTags] = useState<Tag[]>([]);
  const [hasFetchedTags, setHasFetchedTags] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasFetchedTags(false);
  }, [platforms.length]);

  const generateTags = useCallback(async () => {
    if (hasFetchedTags || !groq) return;

    try {
      const leetcodeUsers = platformData?.leetcode ? Object.values(platformData.leetcode) : [];
      const codechefUsers = platformData?.codechef ? Object.values(platformData.codechef) : [];
      const gfgUsers = platformData?.geeksforgeeks ? Object.values(platformData.geeksforgeeks) : [];
      const codeforcesUsers = platformData?.codeforces ? Object.values(platformData.codeforces) : [];

      if (leetcodeUsers.length === 0 && codechefUsers.length === 0 &&
        gfgUsers.length === 0 && codeforcesUsers.length === 0) {
        setTags([]);
        setHasFetchedTags(true);
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
              - Contest Rating: ${user.contestStats?.rating || 'N/A'}
              - Contest Rank: Top ${user.contestStats?.topPercentage || 'N/A'}%
              - Contests Participated: ${user.contestStats?.attendedContestsCount || user.contests.length}
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
              - School: ${user.schoolProblems}, Basic: ${user.basicProblems}
              - Easy: ${user.easyProblems}, Medium: ${user.mediumProblems}
              - Hard: ${user.hardProblems}
              - Score: ${user.codingScore}
            ` : '').join('\n')}

            ${codeforcesUsers.map(user => user ? `
              Codeforces:
              - Rating: ${user.rating} (Max: ${user.maxRating})
              - Rank: ${user.rank}
              - Contest Count: ${user.contestCount}
              - Recent Performance: Avg Rank #${user.recentPerformance.averageRank}
              - Contribution: ${user.contribution}
            ` : '').join('\n')}
            
            Generate a list of 15 to 40 concise and meaningful tags summarizing the user's solution. Each tag should be one to three words and highlight key aspects such as platform, difficulty, number of questions solved, achievements, coding patterns, and data structures. Include a wide variety of coding patterns (e.g., dynamic programming, backtracking, greedy, divide and conquer) and data structures (e.g., stack, array, linked list, graph). Avoid showcasing tags with values of 0 or none. Focus on providing diverse, relevant, and compact tags. Return the result as an array of tags, separated by commas and spaces in words, without any introductory text or explanation in the response. please make the words have spaces between them and no introductry text or explanation in the response."`,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 500,
      });

      let tagList: string[] = [];
      const content = response.choices[0]?.message?.content || '';
      try {
        // Try parsing as JSON array first
        tagList = JSON.parse(content.replace(/'/g, '"'));
      } catch {
        // If not JSON, try splitting by commas
        tagList = content
          .replace(/[\[\]"']/g, '') // Remove brackets and quotes
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && !tag.toLowerCase().includes('here') && !tag.toLowerCase().includes('tags'));
      }

      const formattedTags = tagList
        .filter(tag => tag.length > 0)
        .map((tag, index) => ({ text: tag.trim(), id: index }));

      setTags(formattedTags);
      setHasFetchedTags(true);
      setError(null);
    } catch (error) {
      console.error('Tag generation error:', error);
      setError('Failed to generate tags');
      setTags([]);
    }
  }, [platformData, hasFetchedTags]);

  useEffect(() => {
    generateTags();
  }, [generateTags]);

  // Show error message if API key is missing
  if (!groq) {
    console.warn('NEXT_PUBLIC_GROQ_API_KEY is not configured');
    return null;
  }

  // Don't render anything if there are no tags and no error
  if (tags.length === 0 && !error) return null;

  return (
    <div className="w-full overflow-hidden mb-8 relative">
      {error ? (
        <div className="text-center text-sm text-gray-500 py-2">{error}</div>
      ) : (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f8f8fa] to-transparent z-10" />

          <div className="relative overflow-hidden">
            <div className="animate-scroll flex gap-4 py-1 whitespace-nowrap">
              {/* Original strip */}
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-white border-[1.5px] border-slate-300 text-gray-900 px-3 py-0.5 rounded-md text-sm inline-block select-none whitespace-nowrap"
                >
                  {tag.text}
                </div>
              ))}
              {/* Duplicate strip for seamless loop */}
              {tags.map((tag) => (
                <div
                  key={`dup-${tag.id}`}
                  className="bg-white border-[1.5px] border-slate-300 text-gray-900 px-3 py-0.5 rounded-md text-sm inline-block select-none whitespace-nowrap"
                >
                  {tag.text}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f8f8fa] to-transparent z-10" />
        </>
      )}

      <style jsx>{`
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}