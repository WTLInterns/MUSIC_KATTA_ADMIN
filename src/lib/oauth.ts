// OAuth utility functions for authentication
// These functions handle access token storage and retrieval in localStorage

// Function to get stored access token
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return null;
    
    const parsed = JSON.parse(userInfo);
    return parsed.accessToken || null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

// Function to store access token
export const storeAccessToken = (accessToken: string): void => {
  if (typeof window === "undefined") return;
  
  try {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return;
    
    const parsed = JSON.parse(userInfo);
    parsed.accessToken = accessToken;
    localStorage.setItem("userInfo", JSON.stringify(parsed));
  } catch (error) {
    console.error("Error storing access token:", error);
  }
};

// Function to get user info
export const getUserInfo = (): any => {
  if (typeof window === "undefined") return null;
  
  try {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return null;
    
    return JSON.parse(userInfo);
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
};

// Function to store user info
export const storeUserInfo = (userInfo: any): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  } catch (error) {
    console.error("Error storing user info:", error);
  }
};

// Function to clear user info (logout)
export const clearUserInfo = (): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");
  } catch (error) {
    console.error("Error clearing user info:", error);
  }
};