type Platform = "leetcode" | "codechef" | "geeksforgeeks" | "codeforces";

export const validateProfile = async (
  platform: Platform,
  username: string,
  signal?: AbortSignal,
): Promise<boolean> => {
  if (platform === "codechef") {
    const validUsernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!validUsernamePattern.test(username)) {
      return false;
    }
  }

  try {
    const response = await fetch(
      `/api/check/${platform}/${username}`,
      { signal },
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.success;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Validation aborted");
    }
    console.error(`${platform} validation error:`, error);
    return false;
  }
};

export const validateLeetCodeProfile = (username: string) =>
  validateProfile("leetcode", username);

export const validateCodeChefProfile = (
  username: string,
  signal?: AbortSignal,
) => validateProfile("codechef", username, signal);

export const validateGeeksForGeeksProfile = (
  username: string,
  signal?: AbortSignal,
) => validateProfile("geeksforgeeks", username, signal);

export const validateCodeforcesProfile = (
  username: string,
  signal?: AbortSignal,
) => validateProfile("codeforces", username, signal);
