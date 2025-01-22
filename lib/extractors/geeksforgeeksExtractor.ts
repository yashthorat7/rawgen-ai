import type { GeeksForGeeksData } from '../types';
import * as cheerio from 'cheerio';

export async function extractGeeksForGeeksData(username: string): Promise<GeeksForGeeksData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/geeksforgeeks/${username}`);
    const data = await response.json();

    if (!data || data.error) {
      return null;
    }

    return {
      username,
      institution: data.institution || '',
      codingScore: data.codingScore || 0,
      currentStreak: data.currentStreak || 0,
      problemsSolved: data.problemsSolved || 0,
      basicCount: data.basicCount || 0,
      easyCount: data.easyCount || 0,
      mediumCount: data.mediumCount || 0,
      hardCount: data.hardCount || 0,
      monthlyCoding: data.monthlyCoding,
      weeklyCoding: data.weeklyCoding,
      contestRating: data.contestRating,
      institutionRank: data.institutionRank,
      school: data.school
    };
  } catch (error) {
    console.error('GeeksForGeeks data extraction error:', error);
    return null;
  }
}
