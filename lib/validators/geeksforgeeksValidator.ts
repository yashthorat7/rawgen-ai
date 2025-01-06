export const validateGeeksForGeeksProfile = async (username: string): Promise<boolean> => {
  try {
    const corsProxy = 'https://api.allorigins.win/get?url=';
    const targetUrl = `https://auth.geeksforgeeks.org/user/${username}`;
    const proxyUrl = corsProxy + encodeURIComponent(targetUrl);

    const response = await fetch(proxyUrl);
    const data = await response.json();

    // Simply check the HTTP status code
    return data.status.http_code === 200;

  } catch (error) {
    console.error('GeeksForGeeks validation error:', error);
    return false;
  }
};