"use client";

import { usePlatforms } from "@/lib/PlatformContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
  dangerouslyAllowBrowser: true,
});

type Tag = {
  text: string;
};

export function TagStrip() {
  const { platformData, platforms } = usePlatforms();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFetchedTags, setHasFetchedTags] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    setHasFetchedTags(false);
  }, [platforms.length]);

  const generateTags = useCallback(async () => {
    if (hasFetchedTags) return;

    try {
      const leetcodeUsers = Object.values(platformData.leetcode);
      const codechefUsers = Object.values(platformData.codechef);
      const gfgUsers = Object.values(platformData.geeksforgeeks);
      const codeforcesUsers = Object.values(platformData.codeforces);

      if (leetcodeUsers.length === 0 && codechefUsers.length === 0 &&
        gfgUsers.length === 0 && codeforcesUsers.length === 0) {
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
              - Basic: ${user.basicCount}, Easy: ${user.easyCount}
              - Medium: ${user.mediumCount}, Hard: ${user.hardCount}
              - Score: ${user.codingScore}
            ` : '').join('\n')}

            ${codeforcesUsers.map(user => user ? `
              Codeforces:
              - Rating: ${user.rating} (Max: ${user.maxRating})
              - Rank: ${user.rank}
              - Problems Solved: ${user.problemsSolved}
              - Contests: ${user.contestsParticipated}
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

  useEffect(() => {
    if (!containerRef.current || tags.length === 0) return;

    const animate = async () => {
      const width = containerRef.current?.scrollWidth || 1000;
      await controls.start({
        x: [-20, -(width / 2)],
        transition: {
          duration: 600,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }
      });
    };

    if (!isPaused) {
      animate();
    } else {
      controls.stop();
    }
  }, [controls, isPaused, tags]);

  return (
    <div className="w-full overflow-hidden mb-8 bg-gray-50 relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10" />

      <motion.div
        ref={containerRef}
        className="flex whitespace-nowrap"
        animate={controls}
        initial={{ x: 0 }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
      >
        {[...tags, ...tags, ...tags].map((tag, index) => (
          <motion.div
            key={index}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md mx-2 
                     shadow-sm font-medium text-sm inline-block"
            whileHover={{ 
              backgroundColor: "#fff",
              transition: { duration: 0.2 }
            }}
          >
            {tag.text}
          </motion.div>
        ))}
      </motion.div>

      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10" />
    </div>
  );
} 