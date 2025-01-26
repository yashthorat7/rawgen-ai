import type { CodeforcesData } from '../types';

interface ContestHistory {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export async function extractCodeforcesData(username: string): Promise<CodeforcesData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/codeforces/${username}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Codeforces API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return null;
    }

    const result = await response.json();

    if (!result || !result.success || !result.data) {
      console.error('Invalid Codeforces data structure:', result);
      return null;
    }

    const data = result.data;
    const profile = data.profile;
    const ratingHistory = (data.ratingHistory || []) as ContestHistory[];

    // Calculate recent performance metrics
    const recentContests = ratingHistory.slice(-10); // Last 10 contests
    const recentRanks = recentContests.map((c: ContestHistory) => c.rank);
    const recentRatingChanges = recentContests.map((c: ContestHistory) => c.newRating - c.oldRating);

    const averageRank = recentRanks.length 
      ? Math.round(recentRanks.reduce((a: number, b: number) => a + b, 0) / recentRanks.length)
      : 0;

    const averageRatingChange = recentRatingChanges.length
      ? Math.round(recentRatingChanges.reduce((a: number, b: number) => a + b, 0) / recentRatingChanges.length)
      : 0;

    return {
      // Basic Info
      username: profile.handle || '',
      rank: profile.rank || '',
      rating: profile.rating || 0,
      maxRating: profile.maxRating || 0,
      maxRank: profile.maxRank || '',
      contribution: profile.contribution || 0,
      friendOfCount: profile.friendOfCount || 0,
      organization: profile.organization,
      titlePhoto: profile.titlePhoto,
      avatar: profile.avatar,
      lastOnline: profile.lastOnline,
      registrationTime: profile.registrationTime,

      // Rating History
      ratingHistory: ratingHistory.map((contest: ContestHistory) => ({
        contestId: contest.contestId,
        contestName: contest.contestName,
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        ratingChange: contest.newRating - contest.oldRating,
        timestamp: contest.ratingUpdateTimeSeconds
      })),

      // Stats
      contestCount: ratingHistory.length,
      recentPerformance: {
        averageRank,
        averageRatingChange,
        bestRank: Math.min(...recentRanks),
        worstRank: Math.max(...recentRanks),
        lastContests: recentContests.length
      }
    };

  } catch (error) {
    console.error('Error fetching Codeforces data:', error);
    return null;
  }
} 