export interface LeetCodeData {
  // Basic Info
  username: string;
  realName: string | null;
  avatar: string;
  about: string | null;
  school: string | null;
  company: string | null;
  jobTitle: string | null;
  countryName: string | null;
  websites: string[];
  skills: string[];

  // Stats
  ranking: number;
  starRating: number;
  reputation: number;
  contributionPoints: {
    points: number;
    diff: number;
  };
  solutions: {
    count: number;
    diff: number;
  };
  discussions: {
    count: number;
    diff: number;
  };
  views: {
    count: number;
    diff: number;
  };

  // Submission Stats
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  totalSubmissions: number;
  acceptanceRate: string;
  submitStats: {
    acSubmissionNum: Array<{
      difficulty: string;
      count: number;
      submissions: number;
    }>;
    totalSubmissionNum: Array<{
      difficulty: string;
      count: number;
      submissions: number;
    }>;
  };

  // Calendar & Streak
  calendar: {
    streak: number;
    totalActiveDays: number;
    submissionCalendar: Record<string, number>;
  };

  // Contests
  contests: Array<{
    title: string;
    rating: number;
    ranking: number;
    globalRanking: number;
  }>;

  // Recent Submissions
  recentlySolved: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
    url: string;
    difficulty: string;
  }>;

  // Badges
  badges: Array<{
    id: string;
    name: string;
    shortName: string;
    displayName: string;
    icon: string;
    hoverText: string;
    creationDate: string;
    category: string;
    gifIcon?: string;
    gifBackground?: string;
  }>;
  activeBadge: any;
  upcomingBadges: any[];

  // Language Stats
  languageStats: Array<{
    name: string;
    solved: number;
  }>;

  // Topic Stats
  topicStats: {
    advanced: Array<{
      name: string;
      slug: string;
      solved: number;
    }>;
    intermediate: Array<{
      name: string;
      slug: string;
      solved: number;
    }>;
    fundamental: Array<{
      name: string;
      slug: string;
      solved: number;
    }>;
  };

  // Social Links
  social: {
    github: string | null;
    linkedin: string | null;
    twitter: string | null;
    websites?: string[];
  };
}

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
  websites?: string[];
  [key: string]: string | string[] | undefined; // Allow for future social media platforms
}; 