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
    const url = `${process.env.NEXT_PUBLIC_CODECHEF_API_URL}/${username}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.success) {
      return null;
    }

    const extractedData = {
      username,
      name: data.name || '',
      currentRating: data.currentRating || 0,
      highestRating: data.highestRating || 0,
      globalRank: data.globalRank || 0,
      countryRank: data.countryRank || 0,
      countryName: data.countryName || '',
      stars: data.stars || '',
      contests: data.ratingData?.length || 0,
      heatMap: data.heatMap || [],
      ratingHistory: data.ratingData?.map((contest: CodeChefContest) => ({
        name: contest.name,
        rating: contest.rating,
        rank: contest.rank,
        date: `${contest.getyear}-${contest.getmonth}-${contest.getday}`
      })) || []
    };
    
    return extractedData;
  } catch (error) {
    console.error('CodeChefExtractor: Error:', error);
    return null;
  }
} 