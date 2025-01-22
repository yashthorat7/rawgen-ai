export const validateCodeforcesProfile = async (
  username: string,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/codeforces/${username}`,
      { signal }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return !data.error;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Validation aborted');
    }
    console.error('Codeforces validation error:', error);
    return false;
  }
}; 