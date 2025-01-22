import type { CodeforcesData } from '../types';

export async function extractCodeforcesData(username: string): Promise<CodeforcesData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/codeforces/${username}`);
    const data = await response.json();

    if (!data || data.error) {
      return null;
    }

    return {
      username,
      rating: data.rating || 0,
      maxRating: data.maxRating || 0,
      rank: data.rank || 'unrated',
      maxRank: data.maxRank || 'unrated',
      problemsSolved: data.problemsSolved || 0,
      contestsParticipated: data.contestsParticipated || 0,
      contribution: data.contribution || 0,
      friendOfCount: data.friendOfCount || 0
    };
  } catch (error) {
    console.error('Codeforces data extraction error:', error);
    return null;
  }
} 