export interface LeetCodeData {
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

  calendar: {
    streak: number;
    totalActiveDays: number;
    submissionCalendar: Record<string, number>;
  };

  contests: Array<{
    title: string;
    rating: number;
    ranking: number;
    globalRanking: number;
    trendDirection?: "UP" | "DOWN";
    problemsSolved?: number;
    totalProblems?: number;
    finishTimeInSeconds?: number;
    startTime?: number;
  }>;
  contestStats?: {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    totalParticipants: number;
    topPercentage: number;
    badge: any;
  };

  recentlySolved: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
    url: string;
    difficulty: string;
  }>;

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

  languageStats: Array<{
    name: string;
    solved: number;
  }>;

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
  stars: number;
  institution: string | null;
  countryName: string | null;

  currentRating: number;
  highestRating: number;
  globalRank: number;
  countryRank: number;

  badges: Array<{
    title: string;
    description: string;
    image: string;
  }>;

  totalContests: number;
  totalProblemsSolved: string;
  practiceProblems: number;
  learningProblems: number;

  ratingHistory: Array<{
    name: string;
    code: string;
    rating: number;
    rank: number;
    date: string;
    color: string;
    endDate: string;
  }>;

  submissionStats: Array<{
    date: string;
    submissions: number;
  }>;

  contests: Array<{
    name: string;
    problemCount: number;
  }>;

  contestDetails: Array<{
    name: string;
    problems: string[];
  }>;
};

export interface GeeksForGeeksData {
  username: string;
  profileImage: string;
  stars: string;
  institution: string;
  organization: string;

  codingScore: number;
  problemsSolved: number;
  contestRating: number;

  currentStreak: number;
  totalStreak: number;

  institutionRank: number;

  totalProblems: number;
  schoolProblems: number;
  basicProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;

  languages: string[];

  problems: {
    school: Array<{ title: string; url: string }>;
    basic: Array<{ title: string; url: string }>;
    easy: Array<{ title: string; url: string }>;
    medium: Array<{ title: string; url: string }>;
    hard: Array<{ title: string; url: string }>;
  };
}

export interface CodeforcesData {
  username: string;
  rank: string;
  rating: number;
  maxRating: number;
  maxRank: string;
  contribution: number;
  friendOfCount: number;
  organization?: string;
  titlePhoto?: string;
  avatar?: string;
  lastOnline?: number;
  registrationTime?: number;

  ratingHistory: Array<{
    contestId: number;
    contestName: string;
    rank: number;
    oldRating: number;
    newRating: number;
    ratingChange: number;
    timestamp: number;
  }>;

  contestCount: number;
  recentPerformance: {
    averageRank: number;
    averageRatingChange: number;
    bestRank: number;
    worstRank: number;
    lastContests: number;
  };
}

export type PlatformData = {
  leetcode: Record<string, LeetCodeData | null>;
  codechef: Record<string, CodeChefData | null>;
  geeksforgeeks: Record<string, GeeksForGeeksData | null>;
  codeforces: Record<string, CodeforcesData | null>;
  [key: string]: Record<string, any>;
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
  forceRefreshAllPlatforms: () => Promise<void>;
};

export type SocialLinks = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  websites?: string[];
  [key: string]: string | string[] | undefined;
};
