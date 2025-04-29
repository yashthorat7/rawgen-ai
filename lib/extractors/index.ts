import { extractCodeChefData, extractEssentialCodeChefData } from './codechefExtractor';
import { extractCodeforcesData, extractEssentialCodeforcesData } from './codeforcesExtractor';
import { extractGeeksForGeeksData, extractEssentialGeeksForGeeksData } from './geeksforgeeksExtractor';
import { extractLeetCodeData, extractEssentialLeetCodeData } from './leetcodeExtractor';

export {
  extractCodeChefData,
  extractCodeforcesData,
  extractGeeksForGeeksData,
  extractLeetCodeData,
  extractEssentialCodeChefData,
  extractEssentialCodeforcesData,
  extractEssentialGeeksForGeeksData,
  extractEssentialLeetCodeData,
};

export function getEssentialDataExtractor(platformName: string) {
  switch (platformName.toLowerCase()) {
    case 'leetcode':
      return extractEssentialLeetCodeData;
    case 'codechef':
      return extractEssentialCodeChefData;
    case 'geeksforgeeks':
      return extractEssentialGeeksForGeeksData;
    case 'codeforces':
      return extractEssentialCodeforcesData;
    default:
      return null;
  }
}

export async function extractEssentialPlatformData(platform: string, username: string) {
  try {
    let data = null;
    
    switch (platform.toLowerCase()) {
      case 'leetcode':
        data = await extractLeetCodeData(username);
        return data ? extractEssentialLeetCodeData(data) : null;
      case 'codechef':
        data = await extractCodeChefData(username);
        return data ? extractEssentialCodeChefData(data) : null;
      case 'geeksforgeeks':
        data = await extractGeeksForGeeksData(username);
        return data ? extractEssentialGeeksForGeeksData(data) : null;
      case 'codeforces':
        data = await extractCodeforcesData(username);
        return data ? extractEssentialCodeforcesData(data) : null;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error extracting essential ${platform} data:`, error);
    return null;
  }
} 