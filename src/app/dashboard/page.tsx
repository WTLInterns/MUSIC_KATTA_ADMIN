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
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1% from last month" },
    { title: "Subscriptions", value: "+2350", change: "+180.1% from last month" },
    { title: "Sales", value: "+12,234", change: "+19% from last month" },
    { title: "Active Now", value: "+573", change: "+201 since last hour" },
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
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="flex items-center p-2 text-blue-600 bg-blue-50 rounded-lg">
                <span className="mr-3">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/video-management" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <span className="mr-3">🎥</span>
                Video Management
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
              >
                <span className="mr-3">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {userInfo?.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {userInfo?.firstName?.charAt(0) || userInfo?.email?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="ml-2 text-sm font-medium text-gray-700">
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
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
                <div className="mt-2 text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-gray-500 mt-1">{item.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Overview</h3>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Sales</h3>
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{sale.customer}</p>
                      <p className="text-sm text-gray-500">{sale.email}</p>
                    </div>
                    <div className="font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}