import { NextRequest, NextResponse } from "next/server";
import { 
  LEETCODE_GRAPHQL_URL, 
  fetchWithRetry,
  CODECHEF_BASE_URL,
  CODEFORCES_BASE_URL,
  GFG_BASE_URL
} from "@/lib/api-utils";
import { JSDOM } from "jsdom";

async function checkLeetcodeUser(username: string) {
  try {
    const response = await fetchWithRetry(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          query userExists($username: String!) {
            matchedUser(username: $username) {
              username
            }
          }
        `,
        variables: { username }
      })
    });

    const data = await response.json();
    return {
      success: !!data.data?.matchedUser,
      platform: 'leetcode',
      username
    };
  } catch (error: any) {
    return {
      success: false,
      platform: 'leetcode',
      username,
      error: error.message
    };
  }
}

async function checkCodechefUser(username: string) {
  try {
    const response = await fetchWithRetry(`${CODECHEF_BASE_URL}/users/${username}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return { success: false, platform: 'codechef', username };
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const userExists = dom.window.document.querySelector('.user-details-container') !== null;

    return {
      success: userExists,
      platform: 'codechef',
      username
    };
  } catch (error: any) {
    return {
      success: false,
      platform: 'codechef',
      username,
      error: error.message
    };
  }
}

async function checkCodeforcesUser(username: string) {
  try {
    const response = await fetchWithRetry(`${CODEFORCES_BASE_URL}/api/user.info?handles=${username}`);
    const data = await response.json();
    
    return {
      success: data.status === 'OK',
      platform: 'codeforces',
      username
    };
  } catch (error: any) {
    return {
      success: false,
      platform: 'codeforces',
      username,
      error: error.message
    };
  }
}

async function checkGeeksforgeeksUser(username: string) {
  try {
    const response = await fetchWithRetry(`${GFG_BASE_URL}/user/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return { success: false, platform: 'geeksforgeeks', username };
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const userExists = dom.window.document.querySelector('.profilePicSection_head_userHandle__oOfFy') !== null || 
                       dom.window.document.querySelector('.profile-handle') !== null;

    return {
      success: userExists,
      platform: 'geeksforgeeks',
      username
    };
  } catch (error: any) {
    return {
      success: false,
      platform: 'geeksforgeeks',
      username,
      error: error.message
    };
  }
}

const checkers: Record<string, (username: string) => Promise<any>> = {
  leetcode: checkLeetcodeUser,
  codechef: checkCodechefUser,
  codeforces: checkCodeforcesUser,
  geeksforgeeks: checkGeeksforgeeksUser
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string, username: string }> }
) {
  const { platform, username } = await params;
  
  const checker = checkers[platform.toLowerCase()];
  if (!checker) {
    return NextResponse.json({
      success: false,
      error: "Invalid platform. Supported platforms: leetcode, codechef, codeforces, geeksforgeeks"
    }, { status: 400 });
  }

  if (!username || username.length < 2) {
    return NextResponse.json({
      success: false,
      error: "Invalid username"
    }, { status: 400 });
  }

  try {
    const result = await checker(username);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: error.message
    }, { status: 500 });
  }
}
