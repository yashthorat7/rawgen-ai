export interface LeetCodeData {
  username: string;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  ranking: number;
  contributionPoint: number;
  reputation: number;
  totalSubmissions: Array<{
    difficulty: string;
    count: number;
    submissions: number;
  }>;
  submissionCalendar: Record<string, number>;
}

export interface CodeChefData {
  username: string;
  name: string;
  currentRating: number;
  highestRating: number;
  globalRank: number;
  countryRank: number;
  countryName: string;
  stars: string;
  contests: number;
  heatMap: Array<{ date: string; value: number }>;
  ratingHistory: Array<{
    name: string;
    rating: string;
    rank: string;
    date: string;
  }>;
}

export interface GeeksForGeeksData {
  username: string;
  institution: string;
  codingScore: number;
  currentStreak: number;
  problemsSolved: number;
  basicCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  monthlyCoding: number;
  weeklyCoding: number;
} 