import { NextRequest, NextResponse } from "next/server";
import { 
  LEETCODE_BASE_URL, 
  LEETCODE_GRAPHQL_URL, 
  fetchWithRetry 
} from "@/lib/api-utils";
import { USER_PROFILE_QUERY, USER_CONTEST_QUERY } from "@/lib/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const csrfToken = request.headers.get("x-csrftoken") || "";

  try {
    let actualCsrfToken = csrfToken;
    if (!csrfToken) {
      try {
        const tokenResponse = await fetchWithRetry(LEETCODE_BASE_URL, {
          method: 'GET'
        });
        const cookies = tokenResponse.headers.get('set-cookie');
        if (cookies) {
          const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
          if (csrfMatch) {
            actualCsrfToken = csrfMatch[1];
          }
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: "Failed to get CSRF token"
        }, { status: 500 });
      }
    }

    const [profileResponse, contestResponse] = await Promise.all([
      fetchWithRetry(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": actualCsrfToken,
          "Origin": LEETCODE_BASE_URL,
          "Referer": `${LEETCODE_BASE_URL}/${username}`,
          "Cookie": `csrftoken=${actualCsrfToken}`
        },
        body: JSON.stringify({
          query: USER_PROFILE_QUERY,
          variables: { username }
        })
      }),
      fetchWithRetry(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": actualCsrfToken,
          "Origin": LEETCODE_BASE_URL,
          "Referer": `${LEETCODE_BASE_URL}/${username}`,
          "Cookie": `csrftoken=${actualCsrfToken}`
        },
        body: JSON.stringify({
          query: USER_CONTEST_QUERY,
          variables: { username }
        })
      })
    ]);

    const [profileData, contestData] = await Promise.all([
      profileResponse.json(),
      contestResponse.json()
    ]);

    if (profileData.errors) {
      const userNotExist = profileData.errors.some((error: any) => 
        error.message.includes("user does not exist")
      );
      
      return NextResponse.json({
        success: false,
        error: userNotExist ? "User not found" : "Failed to fetch user data",
        username
      }, { status: userNotExist ? 404 : 400 });
    }

    if (!profileData.data?.matchedUser) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        username
      }, { status: 404 });
    }

    const userData = profileData.data;
    const contestsData = contestData.data;

    const filteredContestHistory = contestsData.userContestRankingHistory.filter(
      (contest: any) => contest.attended
    );

    const enhancedData = {
      success: true,
      user: {
        ...userData.matchedUser,
        recentSubmissions: userData.recentAcSubmissionList,
        dailyChallenge: userData.activeDailyCodingChallengeQuestion
      },
      stats: {
        totalQuestions: userData.allQuestionsCount,
        submissions: userData.matchedUser.submitStats,
        problemsSolvedBeats: userData.matchedUser.problemsSolvedBeatsStats,
        languages: userData.matchedUser.languageProblemCount,
        tags: userData.matchedUser.tagProblemCounts
      },
      calendar: userData.matchedUser.userCalendar,
      badges: userData.matchedUser.badges || [],
      contests: {
        ...contestsData.userContestRanking,
        history: filteredContestHistory
      }
    };

    return NextResponse.json(enhancedData);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch user data",
      details: error.message,
      username
    }, { status: 500 });
  }
}
