import type { LeetCodeData } from '../types';

export async function extractLeetCodeData(username: string): Promise<LeetCodeData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/leetcode/${username}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Check if response is OK and is JSON
    if (!response.ok) {
      console.error('LeetCode API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return null;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return null;
    }

    const data = await response.json();

    if (!data || !data.success || !data.user) {
      console.error('Invalid LeetCode data structure:', data);
      return null;
    }

    // Validate required data exists
    if (!data.user.submitStats || !data.user.profile) {
      console.error('Missing required LeetCode data:', {
        hasSubmitStats: !!data.user.submitStats,
        hasProfile: !!data.user.profile
      });
      return null;
    }

    return {
      // Basic Info
      username: data.user.username,
      realName: data.user.profile.realName,
      avatar: data.user.profile.userAvatar,
      about: data.user.profile.aboutMe,
      school: data.user.profile.school,
      company: data.user.profile.company,
      jobTitle: data.user.profile.jobTitle,
      countryName: data.user.profile.countryName,
      websites: data.user.profile.websites || [],
      skills: data.user.profile.skillTags || [],

      // Stats
      ranking: data.user.profile.ranking,
      starRating: data.user.profile.starRating,
      reputation: data.user.profile.reputation,
      contributionPoints: {
        points: data.user.contributions?.points || 0,
        diff: data.user.profile.reputationDiff || 0,
      },
      solutions: {
        count: data.user.profile.solutionCount || 0,
        diff: data.user.profile.solutionCountDiff || 0,
      },
      discussions: {
        count: data.user.profile.categoryDiscussCount || 0,
        diff: data.user.profile.categoryDiscussCountDiff || 0,
      },
      views: {
        count: data.user.profile.postViewCount || 0,
        diff: data.user.profile.postViewCountDiff || 0,
      },

      // Submission Stats
      totalSolved: data.user.submitStats.acSubmissionNum?.[0]?.count || 0,
      totalQuestions: data.stats?.totalQuestions?.[0]?.count || 0,
      easySolved: data.user.submitStats.acSubmissionNum?.[1]?.count || 0,
      mediumSolved: data.user.submitStats.acSubmissionNum?.[2]?.count || 0,
      hardSolved: data.user.submitStats.acSubmissionNum?.[3]?.count || 0,
      totalEasy: data.stats?.totalQuestions?.[1]?.count || 0,
      totalMedium: data.stats?.totalQuestions?.[2]?.count || 0,
      totalHard: data.stats?.totalQuestions?.[3]?.count || 0,
      totalSubmissions: data.user.submitStats.totalSubmissionNum?.[0]?.submissions || 0,
      acceptanceRate: data.user.submitStats.totalSubmissionNum?.[0]?.submissions 
        ? ((data.user.submitStats.acSubmissionNum?.[0]?.count || 0) / data.user.submitStats.totalSubmissionNum[0].submissions * 100).toFixed(1)
        : "0.0",
      submitStats: {
        acSubmissionNum: data.user.submitStats.acSubmissionNum || [],
        totalSubmissionNum: data.user.submitStats.totalSubmissionNum || [],
      },

      // Calendar & Streak
      calendar: {
        streak: data.calendar?.streak || 0,
        totalActiveDays: data.calendar?.totalActiveDays || 0,
        submissionCalendar: data.calendar?.submissionCalendar || "{}",
      },

      // Contests
      contests: (data.contests?.history || data.user.contestHistory || []).map((contest: any) => ({
        title: contest.contest?.title || contest.contestName || 'Unknown Contest',
        rating: contest.rating || 0,
        ranking: contest.ranking || 0,
        globalRanking: contest.globalRanking || 0,
        trendDirection: contest.trendDirection || undefined,
        problemsSolved: contest.problemsSolved || undefined,
        totalProblems: contest.totalProblems || undefined,
        finishTimeInSeconds: contest.finishTimeInSeconds || undefined,
        startTime: contest.contest?.startTime || undefined
      })),
      contestStats: data.contests ? {
        attendedContestsCount: data.contests.attendedContestsCount || 0,
        rating: data.contests.rating || 0,
        globalRanking: data.contests.globalRanking || 0,
        totalParticipants: data.contests.totalParticipants || 0,
        topPercentage: data.contests.topPercentage || 0,
        badge: data.contests.badge || null
      } : undefined,

      // Recent Submissions
      recentlySolved: (data.user.recentSubmissions || []).map((sub: any) => ({
        id: sub.id || '',
        title: sub.title || 'Unknown Problem',
        titleSlug: sub.titleSlug || '',
        timestamp: sub.timestamp || '',
        url: sub.titleSlug ? `https://leetcode.com/problems/${sub.titleSlug}/` : '#',
        difficulty: sub.difficulty || 'Unknown'
      })),

      // Badges
      badges: (data.badges?.all || data.badges || []).map((badge: any) => ({
        id: badge.id || '',
        name: badge.name || '',
        shortName: badge.shortName || '',
        displayName: badge.displayName || '',
        icon: badge.icon || '',
        hoverText: badge.hoverText || '',
        creationDate: badge.creationDate || '',
        category: badge.category || '',
        gifIcon: badge.medal?.config?.iconGif || null,
        gifBackground: badge.medal?.config?.iconGifBackground || null,
      })),
      activeBadge: data.badges?.active || data.activeBadge || null,
      upcomingBadges: data.badges?.upcoming || data.upcomingBadges || [],

      // Language Stats
      languageStats: (data.user.languageProblemCount || []).map((lang: any) => ({
        name: lang.languageName || 'Unknown',
        solved: lang.problemsSolved || 0,
      })),

      // Topic Stats
      topicStats: {
        advanced: (data.user.tagProblemCounts?.advanced || []).map((tag: any) => ({
          name: tag.tagName || '',
          slug: tag.tagSlug || '',
          solved: tag.problemsSolved || 0,
        })),
        intermediate: (data.user.tagProblemCounts?.intermediate || []).map((tag: any) => ({
          name: tag.tagName || '',
          slug: tag.tagSlug || '',
          solved: tag.problemsSolved || 0,
        })),
        fundamental: (data.user.tagProblemCounts?.fundamental || []).map((tag: any) => ({
          name: tag.tagName || '',
          slug: tag.tagSlug || '',
          solved: tag.problemsSolved || 0,
        })),
      },

      // Social Links
      social: {
        github: data.user.githubUrl || null,
        linkedin: data.user.linkedinUrl || null,
        twitter: data.user.twitterUrl || null,
      },
    };
  } catch (error) {
    console.error('Error fetching LeetCode data:', error);
    return null;
  }
}

// New function to extract only essential data for platform cards
export function extractEssentialLeetCodeData(data: LeetCodeData): Record<string, any> {
  return {
    ranking: data.ranking || 0,
    totalSolved: data.totalSolved || 0,
    easySolved: data.easySolved || 0,
    mediumSolved: data.mediumSolved || 0,
    hardSolved: data.hardSolved || 0,
    totalEasy: data.totalEasy || 0,
    totalMedium: data.totalMedium || 0,
    totalHard: data.totalHard || 0,
  };
} 