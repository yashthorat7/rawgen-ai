import type { GeeksForGeeksData } from '../types';
import * as cheerio from 'cheerio';

export async function extractGeeksForGeeksData(username: string): Promise<GeeksForGeeksData | null> {
  try {
    const corsProxy = 'https://api.allorigins.win/get?url=';
    const targetUrl = `https://www.geeksforgeeks.org/user/${username}`;
    const proxyUrl = corsProxy + encodeURIComponent(targetUrl);

    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (!data || !data.contents) {
      console.error('Failed to fetch GeeksForGeeks data');
      return null;
    }

    const $ = cheerio.load(data.contents);

    // Extract data using updated selectors
    const profilePhoto = $('profilePicSection_head_img__1GLm0 span img').attr('src') || '';
    const languageUsed = $('.educationDetails_head_right--text__lLOHI').text().trim() || '';

    const navElements = $('.problemNavbar_head__cKSRi .problemNavbar_head_nav__a4K6P');
    const school = parseInt(
      $(navElements[0]).find('.problemNavbar_head_nav--text__UaGCx').text().match(/\d+/)?.[0] || '0'
    );
    const basic = parseInt(
      $(navElements[1]).find('.problemNavbar_head_nav--text__UaGCx').text().match(/\d+/)?.[0] || '0'
    );
    const easy = parseInt(
      $(navElements[2]).find('.problemNavbar_head_nav--text__UaGCx').text().match(/\d+/)?.[0] || '0'
    );
    const medium = parseInt(
      $(navElements[3]).find('.problemNavbar_head_nav--text__UaGCx').text().match(/\d+/)?.[0] || '0'
    );
    const hard = parseInt(
      $(navElements[4]).find('.problemNavbar_head_nav--text__UaGCx').text().match(/\d+/)?.[0] || '0'
    );

    const currentStreak = parseInt(
      $('.circularProgressBar_head_mid_streakCnt__MFOF1').text().trim() || '0'
    );
    const totalStreak = parseInt(
      $('.circularProgressBar_head_mid_streakCnt--glbLongStreak__viuBP').text().split('/')[1]?.trim() || '0'
    );

    const codingScore = parseInt($('.scoreCard_head_left--score__oSi_x').eq(0).text().trim() || '0');
    const problemsSolved = parseInt($('.scoreCard_head_left--score__oSi_x').eq(1).text().trim() || '0');
    const contestRating = parseInt($('.scoreCard_head_left--score__oSi_x').eq(2).text().trim() || '0');

    const institution = $('.educationDetails_head_left--text__tgi9I').text().trim() || 'N/A';
    const institutionRank = parseInt(
      $('.educationDetails_head_left_userRankContainer--text__wt81s b')
        .first()
        .text()
        .split('\n')[0]
        .trim() || '0'
    );

    return {
      username,
      profilePhoto,
      languageUsed,
      school,
      basicCount: basic,
      easyCount: easy,
      mediumCount: medium,
      hardCount: hard,
      currentStreak,
      totalStreak,
      codingScore,
      problemsSolved,
      contestRating,
      institution,
      institutionRank
    };
  } catch (error) {
    console.error('GeeksForGeeks data extraction error:', error);
    return null;
  }
}
