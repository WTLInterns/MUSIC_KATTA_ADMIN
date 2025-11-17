'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@/lib/auth';

type VideoItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  postDate: string;
  postTime: string;
};

type CourseWithVideos = {
  courseId: string;
  courseName: string;
  details: string;
  postDate: string;
  postTime: string;
  price: string;
  vedios: VideoItem[];
};

type Course = {
  courseId: string;
  courseName: string;
  details: string;
  postDate: string;
  postTime: string;
  price: string;
};

const BACKEND_BASE_URL = 'http://localhost:8085';

export default function VideoManagement() {
  const [isUser, setIsUser] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Course creation state
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDetails, setCourseDetails] = useState('');
  const [coursePrice, setCoursePrice] = useState('');

  // Course videos management state
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadedCourse, setLoadedCourse] = useState<CourseWithVideos | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [isFetchingCourseDetails, setIsFetchingCourseDetails] = useState(false);

  // Video upload state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

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

  useEffect(() => {
    if (!isUser) return;

    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        setMessage(null);
        const response = await fetch(`${BACKEND_BASE_URL}/course/all-courses`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load courses');
        }
        const data = (await response.json()) as Course[];
        setCourses(data);
      } catch (error: any) {
        console.error('Error loading courses:', error);
        showError(error.message || 'Error loading courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isUser]);

  const showError = (text: string) => {
    setMessage({ type: 'error', text });
  };

  const showSuccess = (text: string) => {
    setMessage({ type: 'success', text });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!courseName || !courseDetails || !coursePrice) {
      showError('Please fill in course name, details and price.');
      return;
    }

    try {
      setIsCreatingCourse(true);

      const response = await fetch(`${BACKEND_BASE_URL}/course/create-course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName,
          details: courseDetails,
          price: coursePrice,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create course');
      }

      const data = (await response.json()) as CourseWithVideos;
      showSuccess(`Course created successfully with ID: ${data.courseId}`);

      // Reset form
      setCourseName('');
      setCourseDetails('');
      setCoursePrice('');

      // Optionally pre-fill selected course for video management
      setSelectedCourseId(data.courseId ?? '');
      setLoadedCourse(null);
    } catch (error: any) {
      console.error('Error creating course:', error);
      showError(error.message || 'Error creating course');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleLoadCourse = async () => {
    if (!selectedCourseId) {
      showError('Please select a course before loading videos.');
      return;
    }

    try {
      setIsLoadingCourse(true);
      setMessage(null);

      const response = await fetch(`${BACKEND_BASE_URL}/api/videos/by-course/${selectedCourseId}`);

      if (response.status === 404) {
        setLoadedCourse(null);
        showError('Course not found for the provided ID.');
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to load course and videos');
      }

      const data = (await response.json()) as CourseWithVideos;
      setLoadedCourse(data);
    } catch (error: any) {
      console.error('Error loading course:', error);
      showError(error.message || 'Error loading course');
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedCourseId) {
      showError('Please select a course before uploading a video.');
      return;
    }

    if (!videoTitle || !selectedFile) {
      showError('Please fill in video title and select a video file.');
      return;
    }

    try {
      setIsUploadingVideo(true);

      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('video', selectedFile);

      const response = await fetch(`${BACKEND_BASE_URL}/videos/upload/${selectedCourseId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to upload video');
      }

      showSuccess('Video uploaded successfully.');

      // Reset form
      setVideoTitle('');
      setVideoDescription('');
      setSelectedFile(null);
      const fileInput = document.getElementById('video-file') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh loaded course videos
      await handleLoadCourse();
    } catch (error: any) {
      console.error('Error uploading video:', error);
      showError(error.message || 'Error uploading video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setMessage(null);
      const response = await fetch(`${BACKEND_BASE_URL}/videos/delete/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to delete video');
      }

      showSuccess('Video deleted successfully.');
      await handleLoadCourse();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      showError(error.message || 'Error deleting video');
    }
  };

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setLoadedCourse(null);

    if (!courseId) {
      setSelectedCourseDetails(null);
      return;
    }

    try {
      setIsFetchingCourseDetails(true);
      setMessage(null);
      const response = await fetch(`${BACKEND_BASE_URL}/course/get-course/${courseId}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch course details');
      }
      const data = (await response.json()) as Course;
      setSelectedCourseDetails(data);
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      setSelectedCourseDetails(null);
      showError(error.message || 'Error fetching course details');
    } finally {
      setIsFetchingCourseDetails(false);
    }
  };

  if (!isUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Course &amp; Video Management</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Course Creation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <input
                id="course-name"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter course name"
                required
              />
            </div>

            <div>
              <label htmlFor="course-details" className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                id="course-details"
                value={courseDetails}
                onChange={(e) => setCourseDetails(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the course"
                required
              />
            </div>

            <div>
              <label htmlFor="course-price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                id="course-price"
                type="text"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingCourse}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isCreatingCourse ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>

        {/* Course Videos Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Course Videos</h2>

          {/* Course selection dropdown */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Select Course</h3>
              {isLoadingCourses && (
                <span className="text-xs text-gray-500">Loading...</span>
              )}
            </div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={selectedCourseId}
              onChange={(e) => handleCourseSelect(e.target.value)}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>

            {selectedCourseId && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/course-details/${selectedCourseId}`)}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  View Video Details
                </button>
                <button
                  type="button"
                  onClick={handleLoadCourse}
                  className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Video
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/courses/${selectedCourseId}`)}
                  className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-800"
                >
                  Edit Course Details
                </button>
              </div>
            )}
          </div>

          {selectedCourseDetails && (
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Selected Course Details</h3>
                {isFetchingCourseDetails && (
                  <span className="text-xs text-gray-500">Refreshing…</span>
                )}
              </div>
              <p className="text-base font-semibold text-gray-900">{selectedCourseDetails.courseName}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedCourseDetails.details}</p>
              <p className="text-sm text-gray-500 mt-1">
                Course ID: <span className="font-mono">{selectedCourseDetails.courseId}</span>
              </p>
              <p className="text-sm text-gray-500">
                Price: <span className="font-semibold text-gray-900">{selectedCourseDetails.price}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Posted on {selectedCourseDetails.postDate} at {selectedCourseDetails.postTime}
              </p>
            </div>
          )}

          {/* Course details and videos */}
          {loadedCourse && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-1">{loadedCourse.courseName}</h3>
                <p className="text-sm text-gray-600 mb-1">{loadedCourse.details}</p>
                <p className="text-sm text-gray-500">
                  Course ID: <span className="font-mono">{loadedCourse.courseId}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Posted on {loadedCourse.postDate} at {loadedCourse.postTime} | Price: {loadedCourse.price}
                </p>
              </div>

              {/* Video upload form */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Upload New Video</h3>
                <form onSubmit={handleUploadVideo} className="space-y-4">
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
                    disabled={isUploadingVideo}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUploadingVideo ? 'Uploading...' : 'Upload Video'}
                  </button>
                </form>
              </div>

              {/* Videos list */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Videos</h3>
                {loadedCourse.vedios && loadedCourse.vedios.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {loadedCourse.vedios.map((video) => (
                      <div
                        key={video.videoId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                      >
                        <div className="mb-2 sm:mb-0 sm:mr-4">
                          <h4 className="font-medium text-gray-800">{video.title}</h4>
                          {video.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {video.postDate} | {video.postTime}
                          </p>
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            Open Video
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(video.videoId)}
                          className="self-start sm:self-auto mt-2 sm:mt-0 text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No videos found for this course.</p>
                )}
              </div>
            </div>
          )}

          {!loadedCourse && !isLoadingCourse && (
            <p className="text-sm text-gray-500">Load a course by ID to manage its videos.</p>
          )}
        </div>
      </div>
    </div>
  );
}