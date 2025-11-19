'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, logoutUser } from '@/lib/auth';
import Link from 'next/link';

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has admin role
    const info = getUserInfo();
    if (!info || !info.isLoggedIn) {
      router.push('/login');
      return;
    }
    setUserInfo(info);
  }, [router]);

  const handleLogout = () => {
    // Clear user info from localStorage
    logoutUser();
    
    // Redirect to login page
    router.push('/login');
  };

  // Mock data for revenue cards
  const revenueData = [
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1% from last month", icon: "💰" },
    { title: "Subscriptions", value: "+2350", change: "+180.1% from last month", icon: "👥" },
    { title: "Sales", value: "+12,234", change: "+19% from last month", icon: "📊" },
    { title: "Active Now", value: "+573", change: "+201 since last hour", icon: "⚡" },
  ];

  // Mock recent sales data
  const recentSales = [
    { customer: "Olivia Martin", email: "olivia.martin@email.com", amount: "$1,999.00" },
    { customer: "Jackson Lee", email: "jackson.lee@email.com", amount: "$39.00" },
    { customer: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "$299.00" },
    { customer: "William Kim", email: "will@email.com", amount: "$99.00" },
    { customer: "Sofia Davis", email: "sofia.davis@email.com", amount: "$39.00" },
  ];

  if (!userInfo) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-animated">
      <div className="animate-pulse-slow text-2xl font-bold text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-indigo-700 to-purple-800 shadow-xl">
        <div className="p-6 border-b border-purple-600">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-2 animate-bounce">🎵</span>
            Music Katta Admin
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard" className="flex items-center p-3 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105">
                <span className="mr-3 text-xl">📊</span>
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/video-management" className="flex items-center p-3 text-gray-200 hover:bg-purple-700 rounded-xl hover:text-white transition-all duration-300 group">
                <span className="mr-3 text-xl group-hover:animate-bounce">🎥</span>
                <span className="font-medium">Video Management</span>
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center p-3 text-gray-200 hover:bg-red-600 rounded-xl hover:text-white w-full text-left transition-all duration-300 group"
              >
                <span className="mr-3 text-xl group-hover:animate-bounce">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 text-white text-sm">
            <p>Welcome, {userInfo?.firstName || userInfo?.email || 'Admin'}!</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full py-1 px-3">
                {userInfo?.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-purple-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold ring-2 ring-purple-300">
                    {userInfo?.firstName?.charAt(0) || userInfo?.email?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {userInfo?.firstName || userInfo?.email || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {revenueData.map((item, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {item.title}
                    </h3>
                    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                    <p className="text-xs text-green-500 mt-1 font-medium">{item.change}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl">
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover-lift animate-slide-in-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Overview</h3>
                <button className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  View Report
                </button>
              </div>
              <div className="h-80 flex items-center justify-center bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                <div className="text-center">
                  <div className="text-5xl mb-4 animate-bounce">📈</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Interactive Chart Visualization</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Coming soon with analytics integration</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover-lift animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Sales</h3>
                <button className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{sale.customer}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{sale.email}</p>
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">{sale.amount}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02]">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional Stats Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">New Users</h3>
                  <p className="text-3xl font-bold mt-2">+1,240</p>
                  <p className="text-cyan-100 text-sm mt-1">+12.4% from last week</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Course Completion</h3>
                  <p className="text-3xl font-bold mt-2">78%</p>
                  <p className="text-purple-100 text-sm mt-1">+5.2% from last month</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="text-2xl">🎓</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Avg. Session</h3>
                  <p className="text-3xl font-bold mt-2">24m</p>
                  <p className="text-amber-100 text-sm mt-1">+3.1m from yesterday</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}