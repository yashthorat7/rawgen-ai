import type { CodeChefData } from '../types';

interface ContestData {
  name: string;
  rating: string;
  rank: string;
  getyear: string;
  getmonth: string;
  getday: string;
}

export async function extractCodeChefData(username: string): Promise<CodeChefData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODECHEF_API_URL}/${username}`);
    const data = await response.json();

    if (!data.success) {
      return null;
    }

    return {
      username,
      name: data.name,
      currentRating: data.currentRating,
      highestRating: data.highestRating,
      globalRank: data.globalRank,
      countryRank: data.countryRank,
      countryName: data.countryName,
      stars: data.stars,
      contests: data.ratingData.length,
      heatMap: data.heatMap,
      ratingHistory: data.ratingData.map((contest: ContestData) => ({
        name: contest.name,
        rating: contest.rating,
        rank: contest.rank,
        date: `${contest.getyear}-${contest.getmonth}-${contest.getday}`
      }))
    };
  } catch (error) {
    console.error('CodeChef data extraction error:', error);
    return null;
  }
} 