"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserInfo } from "@/lib/oauth";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const userInfo = getUserInfo();
    if (userInfo && userInfo.isLoggedIn) {
      router.push("/dashboard");
      return;
    }

    // Handle Google OAuth callback
    const googleAuth = searchParams.get('googleAuth');
    const code = searchParams.get('code');
    
    // If we have a code parameter, it means we're in the OAuth flow
    if (code) {
      // In a real implementation, we would exchange the code for tokens here
      // For now, let's simulate a successful login
      handleSuccessfulLogin();
      return;
    }
    
    if (googleAuth === 'success') {
      handleSuccessfulLogin();
    } else if (googleAuth === 'error') {
      const message = searchParams.get('message');
      setError(message || 'Google authentication failed');
    }
  }, [searchParams, router]);

  const handleSuccessfulLogin = () => {
    // Get user data from OAuth callback
    const userId = searchParams.get('userId') || 'user123';
    const firstName = searchParams.get('firstName') || 'User';
    const lastName = searchParams.get('lastName') || '';
    const username = searchParams.get('username') || 'user';
    const email = searchParams.get('email') || 'user@example.com';
    const phone = searchParams.get('phone') || '';
    const role = searchParams.get('role') || 'USER';
    const profilePicture = searchParams.get('profilePicture') || '';
    const accessToken = searchParams.get('accessToken') || ''; // Get access token from OAuth callback
    
    // Validate profile picture URL
    let validProfilePicture = '';
    if (profilePicture && profilePicture.trim() !== '') {
      // Simple validation - check if it looks like a URL
      try {
        new URL(profilePicture);
        validProfilePicture = profilePicture;
      } catch (e) {
        // Invalid URL, keep empty
        validProfilePicture = '';
      }
    }

    const userInfo = {
      userId: userId || null,
      firstName: firstName || '',
      lastName: lastName || '',
      username: username || email?.split('@')[0] || '',
      email: email || '',
      mobileNo: phone || '',
      role: role || 'USER',
      profilePicture: validProfilePicture,
      accessToken: accessToken || '', // Store access token
      isLoggedIn: true,
    };

    // Store in localStorage
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    if (userId) {
      localStorage.setItem('userId', String(userId));
    }

    setSuccessMessage('Successfully logged in!');
    setShowSuccessMessage(true);
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8085/login-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Create admin info object
      const adminInfo = {
        adminId: data.adminId,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        role: data.role || 'ADMIN',
        phone: data.phone || '',
        isLoggedIn: true,
      };

      // Store in localStorage
      localStorage.setItem("adminInfo", JSON.stringify(adminInfo));

      setSuccessMessage('Successfully logged in!');
      setShowSuccessMessage(true);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-600 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8">
            <div className="text-center">
              <div className="mx-auto bg-white/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/80 mb-8">Sign in to access your admin panel</p>
              
              {/* Success toast */}
              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-100">{successMessage}</span>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-100">{error}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Email Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in with Email'}
                  </button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/60">Admin access only</span>
                  </div>
                </div>
                
                <p className="text-white/60 text-xs mt-6">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}