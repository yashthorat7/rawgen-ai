interface CodeChefResponse {
  success: boolean;
  status: number;
  name?: string;
  error?: boolean;
}

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/codechef/${username}`,
        { signal }
      );

      if (!response.ok) return false;

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return false;
      }

      const data: CodeChefResponse = await response.json();
      return !data.error;
              
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Validation aborted');
      }
      console.error('CodeChef validation error:', error);
      return false;
    }
};