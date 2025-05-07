// Get user information from local storage or session
export function getUserInfo() {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user info:', e);
      return null;
    }
  }
  return null;
} 