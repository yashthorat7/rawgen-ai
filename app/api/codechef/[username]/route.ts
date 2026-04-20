import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { fetchWithRetry } from "@/lib/api-utils";

const extractContestDetails = (document: Document) => {
  const contests: any[] = [];
  const contestDivs = document.querySelectorAll('.content');
  
  contestDivs.forEach(div => {
    const titleElement = div.querySelector('h5 span');
    const problemElements = div.querySelectorAll('p span span');
    
    if (titleElement) {
      const contest = {
        name: titleElement.textContent?.trim() || '',
        problems: Array.from(problemElements).map(span => span.textContent?.trim() || '')
      };
      contests.push(contest);
    }
  });

  return contests;
};

const extractPaths = (document: Document) => {
  const paths: any = {
    learning: [],
    practice: []
  };

  const learningHeader = Array.from(document.querySelectorAll('h3'))
    .find(h3 => h3.textContent?.includes('Learning Paths'));
  if (learningHeader) {
    const learningCount = learningHeader.textContent?.match(/\((\d+)\)/)?.[1] || '0';
    paths.learning = {
      count: parseInt(learningCount),
      details: learningHeader.nextElementSibling?.textContent?.trim() || 'None'
    };
  }

  const practiceHeader = Array.from(document.querySelectorAll('h3'))
    .find(h3 => h3.textContent?.includes('Practice Paths'));
  if (practiceHeader) {
    const practiceCount = practiceHeader.textContent?.match(/\((\d+)\)/)?.[1] || '0';
    paths.practice = {
      count: parseInt(practiceCount),
      details: practiceHeader.nextElementSibling?.textContent?.trim() || 'None'
    };
  }

  return paths;
};

const extractBadges = (document: Document) => {
  const badges: any[] = [];
  const badgeDivs = document.querySelectorAll('.badge');
  
  badgeDivs.forEach((badge) => {
    const imageElement = badge.querySelector('.badge__image img');
    const titleElement = badge.querySelector('.badge__title');
    const descriptionElement = badge.querySelector('.badge__description');
    const goalElement = badge.querySelector('.badge__goal');

    if (imageElement && titleElement) {
      const badgeData = {
        image: imageElement.getAttribute('src'),
        title: titleElement.textContent?.trim() || '',
        description: descriptionElement ? descriptionElement.textContent?.trim() : '',
        goal: goalElement ? goalElement.textContent?.trim() : '',
        alt: imageElement.getAttribute('alt') || ''
      };
      badges.push(badgeData);
    }
  });

  return badges;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    const response = await fetchWithRetry(`https://www.codechef.com/users/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: response.status === 404 ? "User not found" : "Failed to fetch user data"
      }, { status: response.status });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const userExists = document.querySelector('.user-details-container') !== null;
    if (!userExists) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 });
    }

    const rankList = document.querySelector('ul.inline-list');
    let globalRank = 'NA';
    let countryRank = 'NA';

    if (rankList) {
      const rankItems = rankList.querySelectorAll('li');
      rankItems.forEach(item => {
        const text = item.textContent?.trim() || '';
        const rank = item.querySelector('strong')?.textContent?.trim();
        
        if (text.includes('Global Rank')) {
          globalRank = rank || 'NA';
        } else if (text.includes('Country Rank')) {
          countryRank = rank || 'NA';
        }
      });
    }

    const ratingSpan = document.querySelector('.rating');
    const stars = ratingSpan ? ratingSpan.textContent?.match(/(\d+)★/)?.[1] || '0' : '0';
    const rating = document.querySelector('.rating-number')?.textContent?.trim() || '0';
    const highestRating = document.querySelector('.rating-header small')?.textContent?.match(/\d+/)?.[0] || '0';
    
    let ratingHistory = [];
    const ratingScript = Array.from(document.querySelectorAll('script'))
      .find(script => script.textContent?.includes('var all_rating'));
    if (ratingScript) {
      const ratingMatch = ratingScript.textContent?.match(/var\s+all_rating\s*=\s*(\[[\s\S]*?\]);/);
      if (ratingMatch) {
        try {
          ratingHistory = JSON.parse(ratingMatch[1]);
        } catch (e) {}
      }
    }

    let submissionStats = [];
    const submissionScript = Array.from(document.querySelectorAll('script'))
      .find(script => script.textContent?.includes('var userDailySubmissionsStats'));
    if (submissionScript) {
      const submissionMatch = submissionScript.textContent?.match(/var\s+userDailySubmissionsStats\s*=\s*(\[[\s\S]*?\]);/);
      if (submissionMatch) {
        try {
          submissionStats = JSON.parse(submissionMatch[1]);
        } catch (e) {}
      }
    }

    const contestDetails = extractContestDetails(document);
    const paths = extractPaths(document);
    
    const userDetailsSection = document.querySelector('section.user-details');
    let institutionName = 'Unknown';
    if (userDetailsSection) {
      const labels = userDetailsSection.querySelectorAll('label');
      labels.forEach(label => {
        if (label.textContent?.trim() === 'Institution:') {
          institutionName = label.nextElementSibling?.textContent?.trim() || 'Unknown';
        }
      });
    }

    const userDetails = {
      profile: {
        username: username,
        name: document.querySelector('.user-details-container h1')?.textContent?.trim() || username,
        stars: parseInt(stars) || 0,
        institution: institutionName,
        rating: parseInt(rating) || 0,
        highestRating: parseInt(highestRating) || 0,
        globalRank: parseInt(globalRank) || 0,
        countryRank: parseInt(countryRank) || 0,
        country: document.querySelector('.user-country-name')?.textContent?.trim() || 'Unknown',
        badges: extractBadges(document)
      },
      stats: {
        contests: {
          total: contestDetails.length,
          details: contestDetails
        },
        paths: paths,
        totalProblemsSolved: document.querySelector('h3:last-child')?.textContent?.match(/\d+/)?.[0] || '0'
      },
      activity: {
        ratingHistory: ratingHistory,
        submissionStats: submissionStats
      }
    };

    return NextResponse.json({
      success: true,
      data: userDetails
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch CodeChef data",
      details: error.message
    }, { status: 500 });
  }
}
