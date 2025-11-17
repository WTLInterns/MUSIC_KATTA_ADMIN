"use client";

import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/auth";

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check authentication status
      const info = getUserInfo();
      setUserInfo(info);
      
      if (info && info.isLoggedIn) {
        setAuthStatus("User is logged in");
      } else {
        setAuthStatus("User is not logged in");
      }
    }
  }, []);

  const handleLogin = () => {
    // Simulate login
    const mockUser = {
      userId: "user123",
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      email: "test@example.com",
      mobileNo: "1234567890",
      role: "ADMIN",
      profilePicture: "",
      accessToken: "mock_access_token_12345",
      isLoggedIn: true,
    };
    
    localStorage.setItem("userInfo", JSON.stringify(mockUser));
    setUserInfo(mockUser);
    setAuthStatus("User logged in successfully");
  };

  const handleLogout = () => {
    // Clear user info
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");
    setUserInfo(null);
    setAuthStatus("User logged out successfully");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Status:</strong> {authStatus}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {userInfo ? JSON.stringify(userInfo, null, 2) : "No user info found"}
        </pre>
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Simulate Login
        </button>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}