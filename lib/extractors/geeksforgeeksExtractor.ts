import type { GeeksForGeeksData } from '../types';
import * as cheerio from 'cheerio';

export async function extractGeeksForGeeksData(username: string): Promise<GeeksForGeeksData | null> {
  try {
    const corsProxy = 'https://api.allorigins.win/get?url=';
    const targetUrl = `${process.env.NEXT_PUBLIC_GEEKSFORGEEKS}/${username}`;
    const proxyUrl = corsProxy + encodeURIComponent(targetUrl);

    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (data.status?.http_code !== 200) {
      return null;
    }

    // Load HTML content into cheerio
    const $ = cheerio.load(data.contents);

    // Extract data using CSS selectors
    const codingScore = parseInt($('.coding-score').text().trim()) || 0;
    const problemsSolved = parseInt($('.problems-solved').text().trim()) || 0;
    const currentStreak = parseInt($('.current-streak').text().trim()) || 0;
    const institution = $('.institution-name').text().trim();

    // Extract problem counts by difficulty
    const basicCount = parseInt($('.BASIC').text().trim()) || 0;
    const easyCount = parseInt($('.EASY').text().trim()) || 0;
    const mediumCount = parseInt($('.MEDIUM').text().trim()) || 0;
    const hardCount = parseInt($('.HARD').text().trim()) || 0;

    // Extract monthly/weekly coding scores
    const monthlyCoding = parseInt($('.monthly-score').text().trim()) || 0;
    const weeklyCoding = parseInt($('.weekly-score').text().trim()) || 0;

    return {
      username,
      institution,
      codingScore,
      currentStreak,
      problemsSolved,
      basicCount,
      easyCount,
      mediumCount,
      hardCount,
      monthlyCoding,
      weeklyCoding
    };
  } catch (error) {
    console.error('GeeksForGeeks data extraction error:', error);
    return null;
  }
} 