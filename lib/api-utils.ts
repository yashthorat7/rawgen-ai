import https from 'https';

export const agent = new https.Agent({
  keepAlive: true,
  timeout: 30000,
});

export const LEETCODE_BASE_URL = "https://leetcode.com";
export const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
export const CODECHEF_BASE_URL = "https://www.codechef.com";
export const CODEFORCES_BASE_URL = "https://codeforces.com";
export const GFG_BASE_URL = "https://www.geeksforgeeks.org";

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchWithRetry(
  url: string, 
  options: RequestInit & { agent?: any; timeout?: number } = {}, 
  maxRetries = 3, 
  timeout = 30000
) {
  const { agent: optAgent, timeout: optTimeout, ...fetchOptions } = options;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        agent: optAgent || agent,
        headers: {
          'Connection': 'keep-alive',
          ...fetchOptions.headers,
        }
      } as any);
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} failed for ${url}:`, error.message);
      
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      await delay(Math.min(1000 * Math.pow(2, attempt), 10000));
    }
  }
  throw new Error("Maximum retries reached");
}

export async function pollSubmissionStatus(
  submissionId: string, 
  problemSlug: string, 
  csrfToken: string, 
  maxAttempts = 10
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${LEETCODE_BASE_URL}/submissions/detail/${submissionId}/check/`, {
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": csrfToken,
          "Referer": `${LEETCODE_BASE_URL}/problems/${problemSlug}`,
          "Cookie": `csrftoken=${csrfToken}`
        }
      });

      const data = await response.json();
      if (data.state === "SUCCESS" || data.state === "FAILURE") {
        return data;
      }

      await delay(1000);
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
    }
  }
  throw new Error("Polling timeout exceeded");
}
