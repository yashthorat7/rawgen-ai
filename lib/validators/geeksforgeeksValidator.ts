export const validateGeeksForGeeksProfile = async (
  username: string,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    const corsProxy = 'https://api.allorigins.win/get?url=';
    const targetUrl = `${process.env.NEXT_PUBLIC_GEEKSFORGEEKS}/${username}`;
    const proxyUrl = corsProxy + encodeURIComponent(targetUrl);

    const response = await fetch(proxyUrl, { signal });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return false;
    }
    
    const data = await response.json();
    return data.status.http_code === 200;

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Validation aborted');
    }
    console.error('GeeksForGeeks validation error:', error);
    return false;
  }
};