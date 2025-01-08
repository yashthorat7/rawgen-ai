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
  console.log('CodeChefExtractor: Fetching data for username:', username);
  
  try {
    const url = `${process.env.NEXT_PUBLIC_CODECHEF_API_URL}/${username}`;
    console.log('CodeChefExtractor: API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    console.log('CodeChefExtractor: Raw API Response:', data);

    if (!data || data.status !== 200) {
      console.error('CodeChefExtractor: API error:', data?.message);
      return null;
    }

    const extractedData = {
      username,
      name: data.name || '',
      currentRating: parseInt(data.rating) || 0,
      highestRating: parseInt(data.highest_rating) || 0,
      globalRank: parseInt(data.global_rank) || 0,
      countryRank: parseInt(data.country_rank) || 0,
      countryName: data.country || '',
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
    
    console.log('CodeChefExtractor: Extracted Data:', extractedData);
    return extractedData;
  } catch (error) {
    console.error('CodeChefExtractor: Error:', error);
    return null;
  }
} 