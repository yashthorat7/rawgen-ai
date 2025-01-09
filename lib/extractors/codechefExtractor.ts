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
  console.log('CodeChefExtractor: Starting extraction for username:', username);
  
  try {
    const url = `${process.env.NEXT_PUBLIC_CODECHEF_API_URL}/${username}`;
    console.log('CodeChefExtractor: Fetching from URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    console.log('CodeChefExtractor: Raw API Response:', JSON.stringify(data, null, 2));

    if (!data || !data.success) {
      console.error('CodeChefExtractor: API error:', data?.message || 'Unknown error');
      return null;
    }

    console.log('CodeChefExtractor: Processing data...');
    console.log('CodeChefExtractor: Stars:', data.stars);
    console.log('CodeChefExtractor: Rating:', data.currentRating);
    console.log('CodeChefExtractor: Global Rank:', data.globalRank);
    console.log('CodeChefExtractor: Country Rank:', data.countryRank);
    console.log('CodeChefExtractor: Country Name:', data.countryName);

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
    
    console.log('CodeChefExtractor: Final processed data:', JSON.stringify(extractedData, null, 2));
    return extractedData;
  } catch (error) {
    console.error('CodeChefExtractor: Error:', error);
    return null;
  }
} 