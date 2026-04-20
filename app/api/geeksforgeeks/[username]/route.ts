import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { GFGDataExtractor } from "@/lib/gfg-selectors";
import { fetchWithRetry } from "@/lib/api-utils";

const fetchGFGData = async (username: string) => {
  try {
    const mainResponse = await fetchWithRetry(`https://www.geeksforgeeks.org/user/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!mainResponse.ok) {
      return {
        success: false,
        status: mainResponse.status,
        error: mainResponse.status === 404 ? "User not found" : "Failed to fetch user data"
      };
    }

    const mainHtml = await mainResponse.text();
    const mainDom = new JSDOM(mainHtml);
    const extractor = new GFGDataExtractor(mainDom.window.document);
    const result = extractor.getAllData();

    const extractProfileImage = (document: Document) => {
      const imgElement = document.querySelector('img[alt*="profile"]') || 
                        document.querySelector('img[src*="auth/profile"]');
      
      if (imgElement) {
        const imgSrc = imgElement.getAttribute('src');
        if (imgSrc && imgSrc.startsWith('/_next/image')) {
          const urlParams = new URLSearchParams(imgSrc.split('?')[1]);
          return urlParams.get('url');
        }
        return imgSrc;
      }
      return null;
    };

    const userImage = extractProfileImage(mainDom.window.document);

    return {
      success: true,
      status: 200,
      data: {
        ...result.data,
        userImage: userImage || result.data.profile.userImage
      }
    };

  } catch (error: any) {
    return {
      success: false,
      status: 500,
      error: 'Failed to fetch user data: ' + error.message
    };
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  try {
    const data = await fetchGFGData(username);
    return NextResponse.json(data, { status: data.success ? 200 : data.status });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch GeeksForGeeks data",
      details: error.message
    }, { status: 500 });
  }
}
