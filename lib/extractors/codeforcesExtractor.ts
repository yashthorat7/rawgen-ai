import type { CodeforcesData } from '../types';

export async function extractCodeforcesData(username: string): Promise<CodeforcesData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFORCES_API_URL}/user.info?handles=${username}`);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error('Codeforces API error:', data.comment);
      return null;
    }

    const userInfo = data.result[0];
    
    return {
      username,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || 'unrated',
      maxRank: userInfo.maxRank || 'unrated',
      problemsSolved: userInfo.contribution || 0,
      contestsParticipated: 0,
      contribution: userInfo.contribution || 0,
      friendOfCount: userInfo.friendOfCount || 0
    };
  } catch (error) {
    console.error('Codeforces data extraction error:', error);
    return null;
  }
} 