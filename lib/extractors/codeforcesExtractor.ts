import type { CodeforcesData } from '../types';

export async function extractCodeforcesData(username: string): Promise<CodeforcesData | null> {
  try {
    // Get user info
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_CODEFORCES_API_URL}/user.info?handles=${username}`);
    const userData = await userResponse.json();

    if (userData.status !== "OK") {
      console.error('Codeforces API error:', userData.comment);
      return null;
    }

    const userInfo = userData.result[0];

    // Get user submissions to count problems solved
    const submissionsResponse = await fetch(`${process.env.NEXT_PUBLIC_CODEFORCES_API_URL}/user.status?handle=${username}`);
    const submissionsData = await submissionsResponse.json();

    let problemsSolved = 0;
    if (submissionsData.status === "OK") {
      // Count unique problems solved (verdict = "OK")
      const solvedProblems = new Set();
      submissionsData.result.forEach((submission: any) => {
        if (submission.verdict === "OK") {
          solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
        }
      });
      problemsSolved = solvedProblems.size;
    }

    // Get contest participation count
    const contestResponse = await fetch(`${process.env.NEXT_PUBLIC_CODEFORCES_API_URL}/user.rating?handle=${username}`);
    const contestData = await contestResponse.json();

    let contestsParticipated = 0;
    if (contestData.status === "OK") {
      contestsParticipated = contestData.result.length;
    }

    return {
      username,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || 'unrated',
      maxRank: userInfo.maxRank || 'unrated',
      problemsSolved,
      contestsParticipated,
      contribution: userInfo.contribution || 0,
      friendOfCount: userInfo.friendOfCount || 0
    };
  } catch (error) {
    console.error('Codeforces data extraction error:', error);
    return null;
  }
} 