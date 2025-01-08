export const validateCodeChefProfile = async (
  username: string,
  signal?: AbortSignal
): Promise<boolean> => {
  // CodeChef usernames can only contain alphanumeric characters and underscore
  const validUsernamePattern = /^[a-zA-Z0-9_]+$/;
  if (!validUsernamePattern.test(username)) {
    return false;
  }

  try {
    if (!process.env.NEXT_PUBLIC_CODECHEF_API_URL) {
      console.error('CodeChef API URL not configured');
      return false;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CODECHEF_API_URL}/users/${username}`,
      { 
        signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success && data.status === 200 && data.username === username;

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Validation aborted');
    }
    console.error('CodeChef validation error:', error);
    return false;
  }
};