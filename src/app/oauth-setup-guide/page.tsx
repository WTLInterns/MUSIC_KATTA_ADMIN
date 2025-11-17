'use client'

import { useState } from 'react';

export default function OAuthSetupGuide() {
  const [activeTab, setActiveTab] = useState('test-users');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Google OAuth Setup Guide</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Important Notice</h2>
        <p className="text-yellow-700">
          You're seeing the "Access blocked: Garja has not completed the Google verification process" error because 
          your Google OAuth application is not verified and the user is not added as a test user.
        </p>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('test-users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'test-users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add Test Users
          </button>
          <button
            onClick={() => setActiveTab('consent-screen')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'consent-screen'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            OAuth Consent Screen
          </button>
          <button
            onClick={() => setActiveTab('troubleshooting')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'troubleshooting'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Troubleshooting
          </button>
        </nav>
      </div>
      
      {activeTab === 'test-users' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Add Test Users</h2>
          <ol className="list-decimal list-inside space-y-4">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <div>
                <p className="font-medium">Go to Google Cloud Console</p>
                <p className="text-gray-600">Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://console.cloud.google.com/</a> and sign in with your Google account</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <div>
                <p className="font-medium">Select Your Project</p>
                <p className="text-gray-600">Select the project that contains your OAuth credentials</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <div>
                <p className="font-medium">Navigate to OAuth Consent Screen</p>
                <p className="text-gray-600">In the left sidebar, go to "APIs & Services" → "OAuth consent screen"</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <div>
                <p className="font-medium">Add Test Users</p>
                <p className="text-gray-600">Scroll down to the "Test users" section and click "ADD USERS"</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
              <div>
                <p className="font-medium">Add Your Email</p>
                <p className="text-gray-600">Add <code className="bg-gray-100 px-1 rounded">wtlinterns2@gmail.com</code> as a test user</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">6.</span>
              <div>
                <p className="font-medium">Save Changes</p>
                <p className="text-gray-600">Click "SAVE AND CONTINUE" to save your changes</p>
              </div>
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Important Notes:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>You must be logged in as the project owner to make these changes</li>
              <li>Test users can access the application even when it's in testing mode</li>
              <li>You can add up to 100 test users for testing purposes</li>
            </ul>
          </div>
        </div>
      )}
      
      {activeTab === 'consent-screen' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Configure OAuth Consent Screen</h2>
          <ol className="list-decimal list-inside space-y-4">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <div>
                <p className="font-medium">Complete App Information</p>
                <p className="text-gray-600">Fill in all required fields on the OAuth consent screen:</p>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-600">
                  <li>App name (e.g., "MusicKatta")</li>
                  <li>User support email</li>
                  <li>Developer contact information</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <div>
                <p className="font-medium">Add Required Scopes</p>
                <p className="text-gray-600">Make sure the following scopes are added:</p>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-600">
                  <li><code>https://www.googleapis.com/auth/userinfo.email</code></li>
                  <li><code>https://www.googleapis.com/auth/userinfo.profile</code></li>
                  <li><code>https://www.googleapis.com/auth/youtube</code></li>
                  <li><code>https://www.googleapis.com/auth/youtube.upload</code></li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <div>
                <p className="font-medium">Test User Access</p>
                <p className="text-gray-600">Ensure your test users are properly added (as shown in the previous tab)</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <div>
                <p className="font-medium">Save and Publish (Optional)</p>
                <p className="text-gray-600">For production use, you would submit for verification, but for testing, the current setup is sufficient</p>
              </div>
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Tip:</h3>
            <p className="text-green-700">
              While your app is in testing mode, only test users can access it. This is Google's way of protecting 
              users while you're developing and testing your application.
            </p>
          </div>
        </div>
      )}
      
      {activeTab === 'troubleshooting' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Common Issues</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Issue: "Access blocked" Error Persists</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Double-check that you've added the exact email address as a test user</li>
                <li>Make sure you clicked "SAVE AND CONTINUE" after adding test users</li>
                <li>Try logging out and logging back in to Google</li>
                <li>Clear your browser cache and cookies for Google services</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Issue: Redirect URI Mismatch</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Ensure your redirect URI in Google Cloud Console matches exactly: <code className="bg-gray-100 px-1 rounded">http://localhost:8085/login/oauth2/code/google</code></li>
                <li>Check that there are no extra spaces or characters</li>
                <li>Make sure you're using the correct protocol (http vs https) for localhost</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Issue: Insufficient Permissions</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Verify that all required scopes are added to your OAuth consent screen</li>
                <li>When logging in, make sure to grant all requested permissions</li>
                <li>If you accidentally denied permissions, log out and log back in</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Issue: Application Still Not Working</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Restart your backend server after making configuration changes</li>
                <li>Check the backend logs for any error messages</li>
                <li>Verify your client ID and client secret are correct</li>
                <li>Ensure your application is running on the correct port (8085)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Still Having Issues?</h3>
            <p className="text-red-700">
              If you've tried all the above steps and are still experiencing issues, please double-check:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
              <li>You're logged into the Google Cloud Console as the project owner</li>
              <li>Your OAuth credentials (client ID and secret) are correct</li>
              <li>You're using the correct email address as a test user</li>
              <li>Your application is running on <code className="bg-gray-100 px-1 rounded">http://localhost:8085</code></li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-800 mb-2">Next Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Follow the instructions in the "Add Test Users" tab to add <code className="bg-blue-100 px-1 rounded">wtlinterns2@gmail.com</code> as a test user</li>
          <li>Return to your application and try logging in again</li>
          <li>If you still encounter issues, check the "Troubleshooting" tab for additional help</li>
        </ol>
      </div>
    </div>
  );
}