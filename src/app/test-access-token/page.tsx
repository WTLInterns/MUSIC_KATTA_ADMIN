"use client";

import { useEffect, useState } from "react";
import { getAccessToken, getUserInfo } from "@/lib/oauth";

export default function TestAccessTokenPage() {
  const [tokens, setTokens] = useState({
    accessToken: "",
  });
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get tokens using the oauth utility
      const accessToken = getAccessToken();
      
      setTokens({
        accessToken: accessToken || "",
      });
      
      // Also get full user info
      const info = getUserInfo();
      if (info) {
        try {
          setUserInfo(info);
        } catch (e) {
          console.error("Error parsing user info:", e);
        }
      }
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Access Token Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tokens from OAuth Utility</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Access Token:</strong> {tokens.accessToken || "No access token found"}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Full User Info</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {userInfo ? JSON.stringify(userInfo, null, 2) : "No user info found"}
        </pre>
      </div>
    </div>
  );
}