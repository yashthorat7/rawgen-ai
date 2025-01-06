export const validateCodeChefProfile = async (username: string): Promise<boolean> => {
    try {
      const corsProxy = 'https://api.allorigins.win/get?url=';
      const targetUrl = `${process.env.NEXT_PUBLIC_CODECHEF_API}/${username}`;
      const proxyUrl = corsProxy + encodeURIComponent(targetUrl);

      const response = await fetch(proxyUrl);
      const html = await response.text();
    
      return !html.includes('404 Error') && !html.includes('User does not exist');
      
    } catch (error) {
      console.error('CodeChef validation error:', error);
      return false;
    }
}