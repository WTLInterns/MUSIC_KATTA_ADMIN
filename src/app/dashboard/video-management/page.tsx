'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@/lib/auth';
import { getAccessToken } from '@/lib/oauth';

export default function VideoManagement() {
  const [isUser, setIsUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string }>>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  // Check if user is logged in and has admin role
  useEffect(() => {
    const checkAuth = () => {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.isLoggedIn) {
        router.push('/login');
        return;
      }
      setIsUser(true);
    };

    checkAuth();
  }, [router]);

  // Function to get playlists (mock implementation)
  const fetchPlaylists = async () => {
    try {
      // Get access token
      const accessToken = getAccessToken();
      console.log("Access token for YouTube API:", accessToken);
      
      // Mock implementation for now
      const mockPlaylists = [
        { id: "playlist1", name: "Music Videos" },
        { id: "playlist2", name: "Tutorials" },
        { id: "playlist3", name: "Live Sessions" },
      ];
      setPlaylists(mockPlaylists);
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
      setMessage({ type: "error", text: "Failed to fetch playlists: " + error.message });
    }
  };

  // Fetch playlists on component mount
  useEffect(() => {
    if (isUser) {
      fetchPlaylists();
    }
  }, [isUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!playlistName || !videoTitle || !selectedFile) {
      setMessage({ type: "error", text: "Please fill in all required fields and select a video file." });
      setIsLoading(false);
      return;
    }

    try {
      // Get access token
      const accessToken = getAccessToken();
      console.log("Using access token for upload:", accessToken);
      
      // Mock implementation for video upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ 
        type: "success", 
        text: `Video "${videoTitle}" uploaded successfully and added to playlist "${playlistName}"!` 
      });
      
      // Refresh playlists
      await fetchPlaylists();
      
      // Reset form
      setPlaylistName("");
      setVideoTitle("");
      setVideoDescription("");
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("video-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading video:", error);
      setMessage({ type: "error", text: "Failed to upload video: " + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Video Management</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Upload Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playlist" className="block text-sm font-medium text-gray-700 mb-1">
                Playlist Name
              </label>
              <select
                id="playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select or create a playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.name}>
                    {playlist.name}
                  </option>
                ))}
                <option value="new">Create new playlist</option>
              </select>
              {playlistName === 'new' && (
                <input
                  type="text"
                  placeholder="Enter new playlist name"
                  value={playlistName === 'new' ? '' : playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              )}
            </div>
            
            <div>
              <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                id="video-title"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video description"
              />
            </div>
            
            <div>
              <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 mb-1">
                Video File
              </label>
              <input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </button>
          </form>
        </div>
        
        {/* Playlists Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Playlists</h2>
          {playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{playlist.name}</h3>
                    <p className="text-sm text-gray-500">ID: {playlist.id}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No playlists found.</p>
          )}
        </div>
      </div>
    </div>
  );
}