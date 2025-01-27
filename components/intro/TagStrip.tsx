"use client";

import { usePlatforms } from "@/lib/PlatformContext";
import { useEffect, useState, useCallback } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
  dangerouslyAllowBrowser: true,
});

type Tag = {
  text: string;
};

export interface TagStripProps {
  username?: string;
  isPublicView?: boolean;
}

export function TagStrip({ username, isPublicView = false }: TagStripProps) {
  const { platformData, platforms } = usePlatforms();
  const [tags, setTags] = useState<Tag[]>([]);
  const [hasFetchedTags, setHasFetchedTags] = useState(false);

  useEffect(() => {
    setHasFetchedTags(false);
  }, [platforms.length]);

  const generateTags = useCallback(async () => {
    if (hasFetchedTags) return;

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
        .map(tag => ({ text: tag.trim() }));

      setTags(formattedTags);
      setHasFetchedTags(true);
    } catch (error) {
      console.error('Tag generation error:', error);
      setTags([]);
    }
  }, [platformData, hasFetchedTags]);

  useEffect(() => {
    generateTags();
  }, [generateTags]);

  // Don't render anything if there are no tags
  if (tags.length === 0) return null;

  return (
    <div className="w-full overflow-hidden mb-8 relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f8f8fa] to-transparent z-10" />

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-4 py-1">
          {[...tags, ...tags, ...tags].map((tag, index) => (
            <div
              key={index}
              className="bg-gray-100 text-gray-900 px-3 py-0.5 rounded-md text-sm inline-block select-none"
            >
              {tag.text}
            </div>
          ))}
        </div>

        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-4 py-1">
          {[...tags, ...tags].map((tag, index) => (
            <div
              key={index}
              className="bg-slate-100 text-gray-900 px-3 py-0.5 rounded-md text-sm inline-block select-none"
            >
              {tag.text}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f8f8fa] to-transparent z-10" />

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        @keyframes marquee2 {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-marquee {
          animation: marquee 240s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 240s linear infinite;
        }
      `}</style>
    </div>
  );
}