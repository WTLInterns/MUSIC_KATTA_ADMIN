// Utility functions for authentication

export const isAdminLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for adminInfo first (email/password login)
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      const parsed = JSON.parse(adminInfo);
      return parsed.isLoggedIn === true;
    }
    
    // Fallback to userInfo (Google login)
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return false;
    
    const parsed = JSON.parse(userInfo);
    return parsed.isLoggedIn === true && parsed.role === 'ADMIN';
  } catch (error) {
    // If there's an error parsing, remove the items
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('userInfo');
    return false;
  }
};

export const getUserInfo = (): any => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check for adminInfo first (email/password login)
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      return JSON.parse(adminInfo);
    }
    
    // Fallback to userInfo (Google login)
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return null;
    
    return JSON.parse(userInfo);
  } catch (error) {
    // If there's an error parsing, remove the items
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('userInfo');
    return null;
  }
};

export const logoutUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userId');
  }
};