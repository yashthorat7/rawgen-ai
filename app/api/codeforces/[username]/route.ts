import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const API_KEY = process.env.CODEFORCES_API_KEY || 'f3d946ddd61e4d54d70ede39f22351a57c2a45c0';
const API_SECRET = process.env.CODEFORCES_API_SECRET || '84fd26933d2a992d223450442ed251c9457b79a1';

const generateApiSig = (methodName: string, params: Record<string, any>) => {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const sigStr = `${rand}/${methodName}?${sortedParams}`;
  const hashStr = sigStr + '#' + API_SECRET;
  
  const hash = crypto.createHash('sha512').update(hashStr).digest('hex');
  
  return {
    sig: `${rand}${hash}`,
    rand: rand
  };
};

const fetchUserInfo = async (handle: string) => {
  try {
    const time = Math.floor(Date.now() / 1000);
    const params = {
      apiKey: API_KEY,
      time: time,
      handles: handle
    };

    const { sig } = generateApiSig('user.info', params);
    const queryParams = new URLSearchParams({
      ...params,
      apiSig: sig
    } as any);

    const url = `https://codeforces.com/api/user.info?${queryParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return {
        success: false,
        status: 400,
        error: data.comment || 'Failed to fetch user data'
      };
    }

    return {
      success: true,
      status: 200,
      data: data.result[0]
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      error: 'Failed to fetch user data: ' + error.message
    };
  }
};

const fetchRatingHistory = async (handle: string) => {
  try {
    const time = Math.floor(Date.now() / 1000);
    const params = {
      apiKey: API_KEY,
      time: time,
      handle: handle
    };

    const { sig } = generateApiSig('user.rating', params);
    const queryParams = new URLSearchParams({
      ...params,
      apiSig: sig
    } as any);

    const url = `https://codeforces.com/api/user.rating?${queryParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return {
        success: false,
        status: 400,
        error: data.comment || 'Failed to fetch rating history'
      };
    }

    return {
      success: true,
      status: 200,
      data: data.result
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      error: 'Failed to fetch rating history: ' + error.message
    };
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  
  if (!username || username.length < 3 || !/^[a-zA-Z0-9_\.]+$/.test(username)) {
    return NextResponse.json({
      success: false,
      error: "Invalid username format"
    }, { status: 400 });
  }
  
  try {
    const userInfo = await fetchUserInfo(username);
    
    if (!userInfo.success) {
      return NextResponse.json(userInfo, { status: userInfo.status });
    }

    const ratingHistory = await fetchRatingHistory(username);

    const userData = {
      success: true,
      status: 200,
      data: {
        profile: {
          handle: userInfo.data.handle,
          rank: userInfo.data.rank || 'unranked',
          rating: userInfo.data.rating || 0,
          maxRating: userInfo.data.maxRating || 0,
          maxRank: userInfo.data.maxRank || 'unranked',
          contribution: userInfo.data.contribution || 0,
          friendOfCount: userInfo.data.friendOfCount || 0,
          titlePhoto: userInfo.data.titlePhoto || '',
          avatar: userInfo.data.avatar || '',
          organization: userInfo.data.organization || '',
          registrationTime: userInfo.data.registrationTimeSeconds || 0,
          lastOnline: userInfo.data.lastOnlineTimeSeconds || 0
        },
        ratingHistory: ratingHistory.success ? ratingHistory.data : []
      }
    };

    return NextResponse.json(userData);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Internal server error: " + error.message
    }, { status: 500 });
  }
}
