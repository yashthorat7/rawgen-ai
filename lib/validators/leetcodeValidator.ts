export const validateLeetCodeProfile = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LEETCODE_API}/${username}`);
      const data = await response.json();
      
      return !!(data && 
        !data.error && 
        data.totalSolved !== undefined && 
        data.totalQuestions !== undefined &&
        data.easySolved !== undefined &&
        data.mediumSolved !== undefined &&
        data.hardSolved !== undefined);
        
    } catch (error) {
      console.error('LeetCode validation error:', error);
      return false;
    }
  };