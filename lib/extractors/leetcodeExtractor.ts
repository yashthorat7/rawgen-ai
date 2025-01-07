import type { LeetCodeData } from '../types';

export async function extractLeetCodeData(username: string): Promise<LeetCodeData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_LEETCODE_API}/${username}`);
    const data = await response.json();

    if (data.error) {
      return null;
    }

    return {
      username,
      totalSolved: data.totalSolved,
      totalQuestions: data.totalQuestions,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      totalEasy: data.totalEasy,
      totalMedium: data.totalMedium,
      totalHard: data.totalHard,
      ranking: data.ranking,
      contributionPoint: data.contributionPoint,
      reputation: data.reputation,
      totalSubmissions: data.totalSubmissions,
      submissionCalendar: data.submissionCalendar
    };
  } catch (error) {
    console.error('LeetCode data extraction error:', error);
    return null;
  }
} 