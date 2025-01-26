import type { GeeksForGeeksData } from '../types';

interface GFGProblem {
  title: string;
  url: string;
}

export async function extractGeeksForGeeksData(username: string): Promise<GeeksForGeeksData | null> {
  try {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/geeksforgeeks/${username}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Check if response is OK
    if (!response.ok) {
      console.error('GeeksForGeeks API error:', {
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

    const result = await response.json();

    if (!result || !result.success || !result.data || !result.data.data) {
      console.error('Invalid GeeksForGeeks data structure:', result);
      return null;
    }

    const data = result.data.data;
    const profile = data.profile;
    const stats = data.stats;
    const problems = data.problems || { school: [], basic: [], easy: [], medium: [], hard: [] };

    console.log('Problems data:', problems);

    // Get problem counts from problemsSolved object
    const problemCounts = {
      total: stats.problemsSolved?.total || 0,
      school: stats.problemsSolved?.byDifficulty?.school || 0,
      basic: stats.problemsSolved?.byDifficulty?.basic || 0,
      easy: stats.problemsSolved?.byDifficulty?.easy || 0,
      medium: stats.problemsSolved?.byDifficulty?.medium || 0,
      hard: stats.problemsSolved?.byDifficulty?.hard || 0
    };

    const extractedData = {
      // Basic Info
      username: profile.username || '',
      profileImage: profile.userImage || '',
      stars: profile.stars || '',
      institution: profile.institution || '',
      organization: profile.organization || '',
      
      // Stats
      codingScore: stats.coding_score || 0,
      problemsSolved: stats.problem_solved || 0,
      contestRating: stats.contest_rating || 0,
      
      // Streaks
      currentStreak: profile.streak || 0,
      totalStreak: profile.globalStreak || 0,
      
      // Rankings
      institutionRank: profile.instituteRank || 0,
      
      // Problem Counts
      totalProblems: problemCounts.total,
      schoolProblems: problemCounts.school,
      basicProblems: problemCounts.basic,
      easyProblems: problemCounts.easy,
      mediumProblems: problemCounts.medium,
      hardProblems: problemCounts.hard,
      
      // Languages
      languages: profile.languages || [],

      // Problems by Difficulty
      problems: {
        school: problems.school || [],
        basic: problems.basic || [],
        easy: problems.easy || [],
        medium: problems.medium || [],
        hard: problems.hard || []
      }
    };

    return extractedData;

  } catch (error) {
    console.error('Error fetching GeeksForGeeks data:', error);
    return null;
  }
}
