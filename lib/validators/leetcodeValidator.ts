export const validateLeetCodeProfile = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CODEFETCH_API_URL}/leetcode/${username}`);
      const data = await response.json();
      
      return !data.error;
    } catch (error) {
      console.error('LeetCode validation error:', error);
      return false;
    }
};