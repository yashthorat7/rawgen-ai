import type { CodeChefData } from "../types";

export async function extractCodeChefData(
  username: string,
): Promise<CodeChefData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/codechef/${username}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("CodeChef API error:", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid content type:", contentType);
      return null;
    }

    const data = await response.json();

    if (!data || !data.success || !data.data) {
      console.error("Invalid CodeChef data structure:", data);
      return null;
    }

    const profileData = data.data.profile;
    const statsData = data.data.stats;
    const activityData = data.data.activity;

    if (!profileData || !statsData || !activityData) {
      console.error("Missing required CodeChef data:", {
        hasProfile: !!profileData,
        hasStats: !!statsData,
        hasActivity: !!activityData,
      });
      return null;
    }

    return {
      username: profileData.username || "",
      name: profileData.name || "",
      stars: profileData.stars || 0,
      institution: profileData.institution || "",
      countryName: profileData.country || "",

      currentRating: profileData.rating || 0,
      highestRating: profileData.highestRating || 0,
      globalRank: profileData.globalRank || 0,
      countryRank: profileData.countryRank || 0,

      badges: (profileData.badges || []).map((badge: any) => ({
        title: badge.title || "",
        description: badge.description || "",
        image: badge.image || "",
        goal: badge.goal || "",
        alt: badge.alt || "",
      })),

      totalContests: statsData.contests?.total || 0,
      totalProblemsSolved: statsData.totalProblemsSolved || "0",
      practiceProblems: statsData.paths?.practice?.count || 0,
      learningProblems: statsData.paths?.learning?.count || 0,

      ratingHistory: (activityData.ratingHistory || []).map((contest: any) => ({
        name: contest.name || "",
        code: contest.code || "",
        rating: parseInt(contest.rating) || 0,
        rank: parseInt(contest.rank) || 0,
        date:
          contest.getyear && contest.getmonth && contest.getday
            ? `${contest.getyear}-${contest.getmonth}-${contest.getday}`
            : new Date().toISOString().split("T")[0],
        color: contest.color || "",
        endDate: contest.end_date || "",
      })),

      submissionStats: (activityData.submissionStats || []).map(
        (stat: any) => ({
          date: stat.date || "",
          submissions: parseInt(stat.value) || 0,
        }),
      ),

      contests: (statsData.contests?.details || [])
        .map((contest: any) => ({
          name: contest.name || "",
          problemCount: Array.isArray(contest.problems)
            ? contest.problems.length
            : 0,
        }))
        .slice(0, 10),

      contestDetails: (statsData.contests?.details || []).map(
        (contest: any) => ({
          name: contest.name || "",
          problems: Array.isArray(contest.problems) ? contest.problems : [],
        }),
      ),
    };
  } catch (error) {
    console.error("Error fetching CodeChef data:", error);
    return null;
  }
}

export function extractEssentialCodeChefData(
  data: CodeChefData,
): Record<string, any> {
  return {
    stars: data.stars || 0,
    currentRating: data.currentRating || 0,
    highestRating: data.highestRating || 0,
    globalRank: data.globalRank || 0,
    countryRank: data.countryRank || 0,
    countryName: data.countryName || "",
    totalContests: data.totalContests || 0,
  };
}
