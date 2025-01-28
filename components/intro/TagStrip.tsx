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
            
            Generate a list of 15 to 40 concise and meaningful tags that summarize the user's coding activity and achievements based on their data from coding platforms. The tags should be short (one to three words each) and highlight key aspects such as platform-specific performance (e.g., "LeetCode Expert," "CodeChef 5-Star"), problem-solving metrics by difficulty (e.g., "1000 Easy Solved," "50 Hard Problems"), contest performance (e.g., "1500 Contest Rating," "Top 5% Rank"), coding patterns (e.g., "Dynamic Programming," "Backtracking," "Divide and Conquer"), data structures (e.g., "Graph Algorithms," "Binary Trees," "HashMap Solutions"), achievements and scores (e.g., "Top Coder," "95% Accuracy"), and areas of skill specialization (e.g., "Bit Manipulation Expert," "Algorithmic Thinking"). Avoid tags with values of 0, "None," or irrelevant/unhelpful information. Focus on meaningful insights only.

            Output the tags as an array of strings, where each tag is separated by commas. Ensure the tags are descriptive, concise, and formatted with spaces between words (e.g., "Greedy Algorithm," not "GreedyAlgorithm"). Avoid duplicates and ensure the tags provide a diverse and compact summary of the user’s coding achievements and skills.

            Example output: ["Dynamic Programming", "Top 5% Rank", "Graph Algorithms", "HashMap Solutions", "LeetCode Medium Expert", "Contest Champion", "Bit Manipulation", "Divide and Conquer", "Trie Applications"]`,
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
    <div className="w-full overflow-hidden mb-2 relative">
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