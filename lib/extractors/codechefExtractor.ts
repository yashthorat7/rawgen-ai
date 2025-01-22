import type { CodeChefData } from '../types';

interface CodeChefContest {
  name: string;
  rating: string;
  rank: string;
  getyear: string;
  getmonth: string;
  getday: string;
}

export async function extractCodeChefData(username: string): Promise<CodeChefData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/codechef/${username}`);
    const data = await response.json();

    if (!data || data.error) {
      return null;
    }

    return {
      username,
      name: data.name || '',
      currentRating: data.currentRating || 0,
      highestRating: data.highestRating || 0,
      globalRank: data.globalRank || 0,
      countryRank: data.countryRank || 0,
      countryName: data.countryName || '',
      stars: data.stars || '',
      contests: data.contests || 0,
      heatMap: data.heatMap || [],
      ratingHistory: data.ratingHistory || []
    };
  } catch (error) {
    console.error('CodeChef data extraction error:', error);
    return null;
  }
} 