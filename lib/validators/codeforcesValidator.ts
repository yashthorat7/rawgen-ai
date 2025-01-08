export const validateCodeforcesProfile = async (
  username: string,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_CODEFORCES_API_URL}user.info?handles=${username}`;
    console.log('Codeforces API Request:', url);

    const response = await fetch(url, { signal });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return false;
    }
    
    const data = await response.json();
    return data.status === "OK";
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Validation aborted');
    }
    console.error('Codeforces validation error:', error);
    return false;
  }
}; 