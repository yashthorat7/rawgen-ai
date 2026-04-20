import {
  extractCodeChefData,
  extractEssentialCodeChefData,
} from "./codechefExtractor";
import {
  extractCodeforcesData,
  extractEssentialCodeforcesData,
} from "./codeforcesExtractor";
import {
  extractGeeksForGeeksData,
  extractEssentialGeeksForGeeksData,
} from "./geeksforgeeksExtractor";
import {
  extractLeetCodeData,
  extractEssentialLeetCodeData,
} from "./leetcodeExtractor";

export type PlatformName = "leetcode" | "codechef" | "geeksforgeeks" | "codeforces";

export const EXTRACTORS: Record<PlatformName, (username: string) => Promise<any>> = {
  leetcode: extractLeetCodeData,
  codechef: extractCodeChefData,
  geeksforgeeks: extractGeeksForGeeksData,
  codeforces: extractCodeforcesData,
};

export const ESSENTIAL_EXTRACTORS: Record<PlatformName, (data: any) => any> = {
  leetcode: extractEssentialLeetCodeData,
  codechef: extractEssentialCodeChefData,
  geeksforgeeks: extractEssentialGeeksForGeeksData,
  codeforces: extractEssentialCodeforcesData,
};

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

export async function extractAllPlatformData(
  platform: string,
  username: string,
) {
  const platformKey = platform.toLowerCase() as PlatformName;
  const extractor = EXTRACTORS[platformKey];
  const essentialExtractor = ESSENTIAL_EXTRACTORS[platformKey];

  if (!extractor || !essentialExtractor) {
    return null;
  }

  try {
    const fullData = await extractor(username);
    if (!fullData) return null;

    const essentialData = essentialExtractor(fullData);
    return {
      fullData,
      essentialData,
    };
  } catch (error) {
    console.error(`Error extracting data for ${platform}:`, error);
    return null;
  }
}

export function getEssentialDataExtractor(platformName: string) {
  return ESSENTIAL_EXTRACTORS[platformName.toLowerCase() as PlatformName] || null;
}

export async function extractEssentialPlatformData(
  platform: string,
  username: string,
) {
  const result = await extractAllPlatformData(platform, username);
  return result?.essentialData || null;
}

