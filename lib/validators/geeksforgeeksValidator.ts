export const validateGeeksForGeeksProfile = async (
  username: string,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    const corsProxy = 'https://api.allorigins.win/get?url=';
    const targetUrl = `${process.env.NEXT_PUBLIC_GEEKSFORGEEKS}/${username}`;
    const proxyUrl = corsProxy + encodeURIComponent(targetUrl);

    const response = await fetch(proxyUrl, { signal });
    const data = await response.json();

    // Simply check the HTTP status code
    return data.status.http_code === 200;

  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Validation aborted');
    }
    console.error('GeeksForGeeks validation error:', error);
    return false;
  }
};