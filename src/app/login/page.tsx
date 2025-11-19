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
    <div className="min-h-screen flex items-center justify-center bg-gradient-animated p-4 animate-gradient">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 card-glass animate-fade-in">
          <div className="p-8">
            <div className="text-center">
              <div className="mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-lg animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-2 animate-slide-in-left">Music Katta Admin</h1>
              <p className="text-white/90 mb-8 animate-slide-in-left" style={{ animationDelay: "0.1s" }}>Sign in to access your admin panel</p>
              
              {/* Success toast */}
              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/40 rounded-xl animate-fade-in">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-100 font-medium">{successMessage}</span>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-500/30 to-rose-500/30 border border-red-500/40 rounded-xl animate-fade-in">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-100 font-medium">{error}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Email Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full px-5 py-4 input-enhanced rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 animate-slide-in-left"
                      style={{ animationDelay: "0.2s" }}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-5 py-4 input-enhanced rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 animate-slide-in-left"
                      style={{ animationDelay: "0.3s" }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-vibrant rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-in-left"
                    style={{ animationDelay: "0.4s" }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">🌀</span> Signing in...
                      </span>
                    ) : (
                      'Sign in with Email'
                    )}
                  </button>
                </form>
                
                <div className="relative animate-slide-in-left" style={{ animationDelay: "0.5s" }}>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-transparent text-white/70">Admin access only</span>
                  </div>
                </div>
                
                <div className="animate-slide-in-left" style={{ animationDelay: "0.6s" }}>
                  <button 
                    className="w-full py-3 bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-700/90 hover:to-cyan-700/90 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => alert('Google Sign-In would be implemented here')}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                      </svg>
                      Sign in with Google
                    </div>
                  </button>
                </div>
                
                <p className="text-white/70 text-xs mt-6 animate-slide-in-left" style={{ animationDelay: "0.7s" }}>
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <p className="text-white/70 text-sm">
            © {new Date().getFullYear()} Music Katta Admin Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}