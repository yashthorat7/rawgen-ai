interface CodeChefResponse {
  success: boolean;
  status: number;
  name?: string;
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
        `${process.env.NEXT_PUBLIC_CODECHEF_API_URL}/${username}`,
        { signal }
      );
      const data: CodeChefResponse = await response.json();
      
      // Simply check if profile exists (success true and status 200)
      return data.success && data.status === 200;
              
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Validation aborted');
      }
      console.error('CodeChef validation error:', error);
      return false;
    }
};