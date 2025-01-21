export type LeetCodeData = {
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
};

export type CodeChefData = {
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
};

export type GeeksForGeeksData = {
  username: string;
  institution: string;
  codingScore: number;
  currentStreak: number;
  problemsSolved: number;
  basicCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  monthlyCoding?: number;
  weeklyCoding?: number;
  profilePhoto?: string;
  languageUsed?: string;
  totalStreak?: number;
  contestRating?: number;
  institutionRank?: number;
  school?: number;
};

export type CodeforcesData = {
  username: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  problemsSolved: number;
  contestsParticipated: number;
  contribution: number;
  friendOfCount: number;
};

export type PlatformData = {
  leetcode: Record<string, LeetCodeData | null>;
  codechef: Record<string, CodeChefData | null>;
  geeksforgeeks: Record<string, GeeksForGeeksData | null>;
  codeforces: Record<string, CodeforcesData | null>;
};

export type Platform = {
  platform: string;
  username: string;
  order: number;
};

export type PlatformContextType = {
  platforms: Platform[];
  platformData: PlatformData;
  isInitialLoading: boolean;
  profileCount: number;
  addPlatform: (platform: string, username: string) => void;
  removePlatform: (platform: string, username: string) => void;
  reorderPlatforms: (fromIndex: number, toIndex: number) => void;
};

export type SocialLinks = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  medium?: string;
  [key: string]: string | undefined; // Allow for future social media platforms
}; 