import type { LeetCodeData } from '../types';

export async function extractLeetCodeData(username: string): Promise<LeetCodeData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/leetcode/${username}`);
    const data = await response.json();

    if (!data.success) return null;

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
      websites: data.user.profile.websites,
      skills: data.user.profile.skillTags,

      // Stats
      ranking: data.user.profile.ranking,
      starRating: data.user.profile.starRating,
      reputation: data.user.profile.reputation,
      contributionPoints: {
        points: data.user.profile.reputation,
        diff: data.user.profile.reputationDiff
      },
      solutions: {
        count: data.user.profile.solutionCount,
        diff: data.user.profile.solutionCountDiff
      },
      discussions: {
        count: data.user.profile.categoryDiscussCount,
        diff: data.user.profile.categoryDiscussCountDiff
      },
      views: {
        count: data.user.profile.postViewCount,
        diff: data.user.profile.postViewCountDiff
      },

      // Submission Stats
      totalSolved: data.user.submitStats.acSubmissionNum[0].count,
      totalQuestions: data.stats.totalQuestions[0].count,
      easySolved: data.user.submitStats.acSubmissionNum[1].count,
      mediumSolved: data.user.submitStats.acSubmissionNum[2].count,
      hardSolved: data.user.submitStats.acSubmissionNum[3].count,
      totalEasy: data.stats.totalQuestions[1].count,
      totalMedium: data.stats.totalQuestions[2].count,
      totalHard: data.stats.totalQuestions[3].count,
      totalSubmissions: data.user.submitStats.totalSubmissionNum[0].submissions,
      acceptanceRate: (data.user.submitStats.acSubmissionNum[0].count / data.user.submitStats.totalSubmissionNum[0].submissions * 100).toFixed(1),

      // Calendar & Streak
      calendar: {
        activeYears: data.calendar.activeYears,
        streak: data.calendar.streak,
        totalActiveDays: data.calendar.totalActiveDays,
        submissionCalendar: data.calendar.submissionCalendar
      },

      // Badges
      badges: data.user.badges.map((badge: any) => ({
        id: badge.id,
        name: badge.name,
        shortName: badge.shortName,
        displayName: badge.displayName,
        icon: badge.icon.startsWith('http') ? badge.icon : `https://leetcode.com${badge.icon}`,
        hoverText: badge.hoverText,
        creationDate: badge.creationDate,
        category: badge.category,
        gifIcon: badge.medal?.config?.iconGif,
        gifBackground: badge.medal?.config?.iconGifBackground
      })),
      activeBadge: data.user.activeBadge,
      upcomingBadges: data.user.upcomingBadges,

      // Language Stats
      languageStats: data.user.languageProblemCount.map((lang: any) => ({
        name: lang.languageName,
        solved: lang.problemsSolved
      })),

      // Topic Stats
      topicStats: {
        advanced: data.user.tagProblemCounts.advanced.map((tag: any) => ({
          name: tag.tagName,
          slug: tag.tagSlug,
          solved: tag.problemsSolved
        })),
        intermediate: data.user.tagProblemCounts.intermediate.map((tag: any) => ({
          name: tag.tagName,
          slug: tag.tagSlug,
          solved: tag.problemsSolved
        })),
        fundamental: data.user.tagProblemCounts.fundamental.map((tag: any) => ({
          name: tag.tagName,
          slug: tag.tagSlug,
          solved: tag.problemsSolved
        }))
      },

      // Social Links
      social: {
        github: data.user.githubUrl,
        twitter: data.user.twitterUrl,
        linkedin: data.user.linkedinUrl,
        websites: data.user.profile.websites
      }
    };
  } catch (error) {
    console.error('LeetCode data extraction error:', error);
    return null;
  }
} 